import React, { useCallback, useMemo, useEffect, useState, useRef, version } from "react";
import axiosInstance from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";

const getAllDocs = async () => {
  const endpoint = `/doc/`;

  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    return null;
  }
};

const createNewDoc = async (navigate) => {
  const endpoint = `/doc/create/`;

  try {
    const response = await axiosInstance.post(endpoint, { content: "Default Content", title: "Doc" });
    navigate(`${response.data.id}`);
  } catch (error) {
    return null;
  }
};

export default function AllDocs({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    getAllDocs()
      .then((res) => {
        setDocs(res);
      })
      .catch((e) => {});
  }, []);

  return (
    <div className="flex flex-col justify-center h-screen">
      <h1 className="text-3xl font-semibold mb-4">
        All Docs
        <button
          onClick={() => createNewDoc(navigate)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md ml-4 hover:bg-blue-600"
        >
          Create New
        </button>
      </h1>
      <ul className="space-y-2">
        {docs
          ? docs.map((doc) => (
              <li key={doc.id}>
                <Link to={`/doc/${doc.id}`} className="text-blue-500 hover:underline">
                  {doc.title}
                </Link>
              </li>
            ))
          : ""}
      </ul>
    </div>
  );
}
