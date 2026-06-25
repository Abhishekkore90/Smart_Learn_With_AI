import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/teacher/templates")({
  component: TemplatesIndexPage,
});

function TemplatesIndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/teacher/templates/birthday" });
  }, [navigate]);

  return null;
}
