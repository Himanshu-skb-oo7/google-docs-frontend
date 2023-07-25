import Doc from "../components/Doc";
import { Route, Link, Routes, useParams } from "react-router-dom";

export default function DocPage() {
  const { id } = useParams();
  return (
    <>
      <Doc id={id} />
    </>
  );
}
