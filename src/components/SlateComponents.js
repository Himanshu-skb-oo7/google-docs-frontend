import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { cx, css } from "@emotion/css";

const Button = React.forwardRef((props, ref) => (
  <span
    {...props}
    ref={ref}
    className={cx(
      props.className,
      css`
        cursor: pointer;
        color: ${props.reversed ? (props.active ? "white" : "#aaa") : props.active ? "black" : "#ccc"};
      `
    )}
  />
));

const EditorValue = React.forwardRef((props, ref) => {
  const textLines = props.value.document.nodes
    .map((node) => node.text)
    .toArray()
    .join("\n");
  return (
    <div
      ref={ref}
      {...props}
      className={cx(
        props.className,
        css`
          margin: 30px -20px 0;
        `
      )}
    >
      <div
        className={css`
          font-size: 14px;
          padding: 5px 20px;
          color: #404040;
          border-top: 2px solid #eeeeee;
          background: #f8f8f8;
        `}
      >
        Slate's value as text
      </div>
      <div
        className={css`
          color: #404040;
          font: 12px monospace;
          white-space: pre-wrap;
          padding: 10px 20px;
          div {
            margin: 0 0 0.5em;
          }
        `}
      >
        {textLines}
      </div>
    </div>
  );
});

const Icon = React.forwardRef((props, ref) => (
  <span
    {...props}
    ref={ref}
    className={cx(
      "material-icons",
      props.className,
      css`
        font-size: 18px;
        vertical-align: text-bottom;
      `
    )}
  />
));

const Instruction = React.forwardRef((props, ref) => (
  <div
    {...props}
    ref={ref}
    className={cx(
      props.className,
      css`
        white-space: pre-wrap;
        margin: 0 -20px 10px;
        padding: 10px 20px;
        font-size: 14px;
        background: #f8f8e8;
      `
    )}
  />
));

const Menu = React.forwardRef((props, ref) => (
  <div
    {...props}
    data-test-id="menu"
    ref={ref}
    className={cx(
      props.className,
      css`
        & > * {
          display: inline-block;
        }

        & > * + * {
          margin-left: 15px;
        }
      `
    )}
  />
));

const Portal = ({ children }) => {
  const portalNode = useRef(document.body);
  return typeof document === "object" ? ReactDOM.createPortal(children, portalNode.current) : null;
};

const Toolbar = React.forwardRef((props, ref) => (
  <Menu
    {...props}
    ref={ref}
    className={cx(
      props.className,
      css`
        position: relative;
        padding: 1px 18px 17px;
        margin: 0 -20px;
        border-bottom: 2px solid #eee;
        margin-bottom: 20px;
      `
    )}
  />
));

export { Button, Icon, Toolbar };
