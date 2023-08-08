import Doc from "../components/Doc";
import AllDocs from "../components/AllDocs";
import { useAuth } from "../AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function DocPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return <>{id ? <Doc id={id} /> : <AllDocs></AllDocs>}</>;
}
