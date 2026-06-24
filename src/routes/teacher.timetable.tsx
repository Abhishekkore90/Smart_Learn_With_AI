import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/teacher/timetable")({
  component: TimetableLayout,
});

function TimetableLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/teacher/timetable" || location.pathname === "/teacher/timetable/") {
      navigate({ to: "/teacher/timetable/class", search: { class: "1st" } });
    }
  }, [location.pathname, navigate]);

  return <Outlet />;
}
