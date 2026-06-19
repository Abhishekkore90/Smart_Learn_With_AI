import { jsxs, jsx } from "react/jsx-runtime";
import { T as TeacherSidebar } from "./TeacherSidebar-CghKmnYW.js";
import { T as TeacherHeader } from "./TeacherHeader-B8DOTlZ-.js";
import { useState } from "react";
import "@tanstack/react-router";
import "lucide-react";
import "framer-motion";
import "./router-BgyeMb5L.js";
import "@tanstack/react-query";
import "firebase/auth";
import "firebase/app";
import "firebase/analytics";
import "firebase/firestore";
import "sonner";
import "./translations-DnpdRcxs.js";
function AddSubjectPage() {
  const [year, setYear] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const handleSave = () => {
    if (!subjectName.trim()) return;
    const newSubject = {
      id: `SUB-${(subjects.length + 1).toString().padStart(3, "0")}`,
      name: subjectName,
      year,
      classLevel
    };
    setSubjects([...subjects, newSubject]);
    setSubjectName("");
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 font-sans", children: [
    /* @__PURE__ */ jsx(TeacherHeader, {}),
    /* @__PURE__ */ jsx(TeacherSidebar, {}),
    /* @__PURE__ */ jsx("main", { className: "lg:pl-64 pt-20 min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "p-4 md:p-8 max-w-5xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-bold text-center text-[#0f2d69] mb-8", children: "Add Subject" }),
      /* @__PURE__ */ jsxs("form", { className: "space-y-6 max-w-3xl mx-auto", onSubmit: (e) => {
        e.preventDefault();
        handleSave();
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-700", children: "Year :" }),
          /* @__PURE__ */ jsxs("select", { value: year, onChange: (e) => setYear(e.target.value), className: "w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700", children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select Year" }),
            /* @__PURE__ */ jsx("option", { value: "2026-2027", children: "2026-2027" }),
            /* @__PURE__ */ jsx("option", { value: "2027-2028", children: "2027-2028" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-700", children: "Class :" }),
          /* @__PURE__ */ jsxs("select", { value: classLevel, onChange: (e) => setClassLevel(e.target.value), className: "w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700", children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select Class" }),
            /* @__PURE__ */ jsx("option", { value: "1st", children: "1st" }),
            /* @__PURE__ */ jsx("option", { value: "2nd", children: "2nd" }),
            /* @__PURE__ */ jsx("option", { value: "3rd", children: "3rd" }),
            /* @__PURE__ */ jsx("option", { value: "4th", children: "4th" }),
            /* @__PURE__ */ jsx("option", { value: "5th", children: "5th" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-700", children: "Subject :" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: subjectName, onChange: (e) => setSubjectName(e.target.value), className: "w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-sm text-slate-700", placeholder: "Enter subject name" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: handleSave, className: "px-6 py-2 bg-[#0d6efd] hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors", children: "Save" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 max-w-3xl mx-auto", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-slate-800 mb-4", children: "All Subjects" }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border border-slate-200 rounded", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm text-slate-700", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-200", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "p-3 font-bold w-32 border-r border-slate-200", children: "ID" }),
            /* @__PURE__ */ jsx("th", { className: "p-3 font-bold", children: "Subject" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: subjects.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 2, className: "p-4 text-center text-slate-500", children: "No subjects added yet" }) }) : subjects.map((sub) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100 last:border-0 hover:bg-slate-50", children: [
            /* @__PURE__ */ jsx("td", { className: "p-3 border-r border-slate-200", children: sub.id }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: sub.name })
          ] }, sub.id)) })
        ] }) })
      ] })
    ] }) }) })
  ] });
}
export {
  AddSubjectPage as component
};
