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
function AssignPeriodPage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 font-sans", children: [
    /* @__PURE__ */ jsx(TeacherHeader, {}),
    /* @__PURE__ */ jsx(TeacherSidebar, {}),
    /* @__PURE__ */ jsx("main", { className: "lg:pl-64 pt-20 min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "p-4 md:p-8 max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-bold text-center text-[#0f2d69] mb-6", children: "Period Assign Timetable" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-4 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-slate-700", children: "Number of Periods :" }),
          /* @__PURE__ */ jsx("input", { type: "number", defaultValue: 1, className: "w-16 p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-slate-700", children: "Year :" }),
          /* @__PURE__ */ jsx("select", { className: "p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm", children: /* @__PURE__ */ jsx("option", { children: "Select a Year" }) })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", className: "px-4 py-1.5 bg-[#198754] hover:bg-green-700 text-white font-medium rounded text-sm transition-colors", children: "Save" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md border border-slate-200 mb-12 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Select a weekday:" }),
            /* @__PURE__ */ jsxs("select", { className: "w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm", children: [
              /* @__PURE__ */ jsx("option", { children: "-- Select Weekday --" }),
              /* @__PURE__ */ jsx("option", { children: "Monday" }),
              /* @__PURE__ */ jsx("option", { children: "Tuesday" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Select a teacher:" }),
            /* @__PURE__ */ jsx("select", { className: "w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm", children: /* @__PURE__ */ jsx("option", { children: "-- Select Teacher --" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Period Name" }),
            /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Select Period", className: "w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Start Time" }),
            /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx("input", { type: "time", className: "w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-700", children: "End Time" }),
            /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx("input", { type: "time", className: "w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Class" }),
            /* @__PURE__ */ jsx("select", { className: "w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm", children: /* @__PURE__ */ jsx("option", { children: "Select Class" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 items-end", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Division" }),
              /* @__PURE__ */ jsx("select", { className: "w-full p-2 bg-slate-100 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm", children: /* @__PURE__ */ jsx("option", { children: "Select Division" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Subject" }),
              /* @__PURE__ */ jsx("select", { className: "w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm", children: /* @__PURE__ */ jsx("option", { children: "Select Subject" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("button", { type: "button", className: "px-4 py-2 bg-[#0d6efd] hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors", children: "Add Period" }),
            /* @__PURE__ */ jsx("button", { type: "button", className: "px-4 py-2 bg-[#dc3545] hover:bg-red-700 text-white font-medium rounded text-sm transition-colors", children: "Reset" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-center font-semibold text-slate-800 mb-4", children: "Assigned Periods" }),
        /* @__PURE__ */ jsx("div", { className: "bg-white overflow-x-auto border border-slate-700 shadow-sm", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-center text-sm text-slate-700 whitespace-nowrap", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[#dbeafe] border-b border-slate-700", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "p-2 font-bold border-r border-slate-700", children: "Weekday" }),
            /* @__PURE__ */ jsx("th", { className: "p-2 font-bold border-r border-slate-700", children: "Period Name" }),
            /* @__PURE__ */ jsx("th", { className: "p-2 font-bold border-r border-slate-700", children: "Start Time" }),
            /* @__PURE__ */ jsx("th", { className: "p-2 font-bold border-r border-slate-700", children: "End Time" }),
            /* @__PURE__ */ jsx("th", { className: "p-2 font-bold border-r border-slate-700", children: "Class" }),
            /* @__PURE__ */ jsx("th", { className: "p-2 font-bold border-r border-slate-700", children: "Division" }),
            /* @__PURE__ */ jsx("th", { className: "p-2 font-bold border-r border-slate-700", children: "Teacher" }),
            /* @__PURE__ */ jsx("th", { className: "p-2 font-bold border-r border-slate-700", children: "Subject" }),
            /* @__PURE__ */ jsx("th", { className: "p-2 font-bold", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: [{
            day: "Monday",
            period: "1",
            start: "10:00 AM",
            end: "11:00 AM",
            cls: "Class I",
            div: "-",
            teacher: "वैभव अविनाश लोखंडे",
            sub: "marathi"
          }, {
            day: "Monday",
            period: "1",
            start: "3:30 PM",
            end: "4:30 PM",
            cls: "Class I",
            div: "-",
            teacher: "Ashish patil",
            sub: "Hindi"
          }, {
            day: "Monday",
            period: "1",
            start: "3:27 PM",
            end: "3:27 PM",
            cls: "Class II",
            div: "-",
            teacher: "Sagar",
            sub: "Marathi"
          }, {
            day: "Monday",
            period: "1",
            start: "1:37 PM",
            end: "2:38 PM",
            cls: "Class II",
            div: "-",
            teacher: "vishal patil",
            sub: "maths 2"
          }, {
            day: "Monday",
            period: "1",
            start: "3:05 PM",
            end: "3:18 PM",
            cls: "Class II",
            div: "-",
            teacher: "ganesh patil",
            sub: "Drawing"
          }].map((row, idx) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-700 last:border-0 hover:bg-slate-50", children: [
            /* @__PURE__ */ jsx("td", { className: "p-2 border-r border-slate-700", children: row.day }),
            /* @__PURE__ */ jsx("td", { className: "p-2 border-r border-slate-700", children: row.period }),
            /* @__PURE__ */ jsx("td", { className: "p-2 border-r border-slate-700", children: row.start }),
            /* @__PURE__ */ jsx("td", { className: "p-2 border-r border-slate-700", children: row.end }),
            /* @__PURE__ */ jsx("td", { className: "p-2 border-r border-slate-700", children: row.cls }),
            /* @__PURE__ */ jsx("td", { className: "p-2 border-r border-slate-700", children: row.div }),
            /* @__PURE__ */ jsx("td", { className: "p-2 border-r border-slate-700", children: row.teacher }),
            /* @__PURE__ */ jsx("td", { className: "p-2 border-r border-slate-700", children: row.sub }),
            /* @__PURE__ */ jsx("td", { className: "p-2", children: /* @__PURE__ */ jsx("button", { className: "px-3 py-1 bg-[#dc3545] hover:bg-red-700 text-white text-xs font-medium rounded", children: "Delete" }) })
          ] }, idx)) })
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  AssignPeriodPage as component
};
