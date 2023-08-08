import React, { useCallback, useMemo, useEffect, useState, useRef, version } from "react";
import axiosInstance from "../api/axiosConfig";
import { Link } from "react-router-dom";

const getAllDocs = async () => {
  const endpoint = `/doc/`;

  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    return null;
  }
};

export default function AllDocs({ setIsAuthenticated }) {
  const [docs, setDocs] = useState([]);
  useEffect(() => {
    getAllDocs()
      .then((res) => {
        setDocs(res);
      })
      .catch((e) => {});
  }, []);
  return docs ? (
    <div className="flex flex-col justify-center h-screen">
      <h1 className="text-3xl font-semibold mb-4">All Docs</h1>
      <ul className="space-y-2">
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link to={`/doc/${doc.id}`} className="text-blue-500 hover:underline">
              {doc.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    ""
  );
}
