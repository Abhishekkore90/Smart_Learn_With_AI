import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/timetable")({
  component: () => <Outlet />,
});
