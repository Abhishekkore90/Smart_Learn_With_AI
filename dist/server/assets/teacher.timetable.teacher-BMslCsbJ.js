import { jsxs, jsx } from "react/jsx-runtime";
import { T as TeacherHeader, a as TeacherSidebar } from "./TeacherHeader-B0j7ec0U.js";
import "@tanstack/react-router";
import "lucide-react";
import "react";
import "framer-motion";
import "./router-BCVN4cfk.js";
import "@tanstack/react-query";
import "firebase/auth";
import "firebase/app";
import "firebase/analytics";
import "firebase/firestore";
import "sonner";
import "./translations-RzKVqU65.js";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function TeacherTimetablePage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white font-sans flex flex-col", children: [
    /* @__PURE__ */ jsx(TeacherHeader, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 mt-16", children: [
      /* @__PURE__ */ jsx(TeacherSidebar, {}),
      /* @__PURE__ */ jsx("main", { className: "flex-1 lg:pl-64 p-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-8 pt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-medium text-slate-800", children: "Teacher Timetable" }),
          /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-sm border border-slate-100 rounded p-4 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-left text-xs font-semibold text-slate-600 mb-2", children: "Select Teacher" }),
            /* @__PURE__ */ jsx("select", { className: "w-full px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-700 outline-none focus:border-blue-500 bg-white", children: /* @__PURE__ */ jsx("option", { value: "", children: "Select Teacher" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-medium text-slate-800", children: "Chintamanrao Institute of Technology University" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-600 font-medium", children: "Tal:- Andheri, Dist:- Mumbai City" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border border-slate-200 rounded-sm overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-[#bce0fd]", children: [
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-4 font-bold text-slate-800 border-b border-r border-slate-200 w-1/2", children: "Day" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-4 font-bold text-slate-800 border-b border-slate-200 w-1/2", children: "Period 1" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: DAYS.map((day) => /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 border-b border-slate-200 last:border-b-0", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-4 text-center text-slate-600 border-r border-slate-200", children: day }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-4 text-center text-slate-500", children: "-" })
          ] }, day)) })
        ] }) }),
        /* @__PURE__ */ jsx("button", { className: "bg-[#0066ff] hover:bg-blue-600 text-white text-[11px] font-medium py-2 px-4 rounded shadow-sm transition-colors", children: "Print Timetable" })
      ] }) })
    ] })
  ] });
}
export {
  TeacherTimetablePage as component
};
