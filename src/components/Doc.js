import React, { useCallback, useMemo, useEffect, useState, useRef, version } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import { Editor, Transforms, createEditor, Element as SlateElement } from "slate";
import { withHistory } from "slate-history";
import throttle from "lodash.throttle";
import axiosInstance from "../api/axiosConfig";
import { AUTH_TOKEN } from "../api/apiConstants";

import { Button, Icon, Toolbar } from "./SlateComponents";

const YOUR_USER_ID = AUTH_TOKEN;

//Get doc content
const getDocContent = async (doc_id) => {
  const endpoint = `/doc/${doc_id}/`;

  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    return null;
  }
};

// Update doc content in DB
const updateDoc = async (doc_id, doc_content) => {
  const endpoint = "http://127.0.0.1:8000/doc/" + doc_id + "/";

  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: doc_id, content: doc_content }),
  };
  return fetch(endpoint, requestOptions)
    .then((response) => response.json())
    .then((data) => {});
};

const throttledUpdateDoc = throttle(updateDoc, 1000);

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

const Doc = ({ id }) => {
  const [content, setContent] = useState("");
  const [version, setVersion] = useState(0); // Add version state
  const lastReceivedContentRef = useRef("");
  const isLocalChangeRef = useRef(false); // Ref to track local changes

  //const [isLocalChange, setIsLocalChange] = useState(true);
  const wsRef = useRef(null);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const sendDataViaWebSocket = (change, content, version) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const data = {
        change: change,
        content: content,
        version: version, // Include the version in the data
      };
      wsRef.current.send(JSON.stringify(data));
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/doc/${id}/?user_id=${YOUR_USER_ID}`);

    ws.onopen = function (event) {
      wsRef.current = ws;
    };

    ws.onclose = function (e) {
      wsRef.current = null;
    };

    ws.onerror = function (event) {};

    ws.onmessage = function (event) {
      const data = JSON.parse(event.data);

      if (editor.selection) {
        const isLocalChange = data.user_id === YOUR_USER_ID;
        if (!isLocalChange) {
          const currentContent = JSON.stringify(editor.children);
          const remoteValue = JSON.parse(currentContent);
          applyRemoteChange(editor, remoteValue, data.change);
          lastReceivedContentRef.current = data.content;
          setVersion(data.version); // Update the local version number
          isLocalChangeRef.current = isLocalChange;
        }
      }
    };

    return () => {};
  }, []);

  useEffect(() => {
    getDocContent(id)
      .then((res) => {
        setContent(res.content);
        setVersion(res.version);
      })
      .catch((e) => {});
  }, []);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const initialValue = [
    {
      type: "paragraph",
      children: [{ text: content ? content : "Loading..." }],
    },
  ];

  const slateOnChange = useCallback(
    (currTextContent) => {
      var fullContent = currTextContent
        .map((elements) => elements.children.map((child) => child.text).join(""))
        .join("\n");

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        if (isLocalChangeRef.current) {
          sendDataViaWebSocket(editor.operations, fullContent, version);
          throttledUpdateDoc(id, fullContent)
            .then((response) => {})
            .catch((error) => {});
        }
      }
    },
    [] // Add version as a dependency
  );

  return (
    <Slate editor={editor} initialValue={initialValue} key={content} onChange={slateOnChange}>
      <Toolbar>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <BlockButton format="left" icon="format_align_left" />
        <BlockButton format="center" icon="format_align_center" />
        <BlockButton format="right" icon="format_align_right" />
        <BlockButton format="justify" icon="format_align_justify" />
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          isLocalChangeRef.current = true;
          setVersion(version + 1);
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
};

const applyRemoteChange = (editor, remoteValue, change) => {
  Editor.withoutNormalizing(editor, () => {
    change.forEach((operation) => {
      editor.apply(operation);
    });
  });
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? "align" : "type");
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });

  let newProperties;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? "align" : "type")}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

export default Doc;
