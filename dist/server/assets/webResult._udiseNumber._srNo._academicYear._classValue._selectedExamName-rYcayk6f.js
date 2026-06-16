import { jsxs, jsx } from "react/jsx-runtime";
import { useParams, MemoryRouter, Routes, Route as Route$1 } from "react-router-dom";
import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { A as AlertMessage } from "./AlertMessage-CSxBmgvw.js";
import { i as Route } from "./router-BCVN4cfk.js";
import "sonner";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "firebase/auth";
import "firebase/app";
import "firebase/analytics";
import "firebase/firestore";
import "lucide-react";
import "framer-motion";
const WebResult = () => {
  const params = useParams();
  const udiseNumber = params.udiseNumber;
  const srNo = params.srNo;
  const academicYear = params.academicYear;
  const classValue = params.classValue;
  const selectedExamName = params.selectedExamName;
  const [studentData, setStudentData] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [selectedStudentResults, setSelectedStudentResults] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [subjectSequence, setSubjectSequence] = useState([]);
  useEffect(() => {
    if (academicYear && classValue) {
      fetchSubjectSequence();
    }
  }, [academicYear, classValue]);
  const fetchSubjectSequence = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/${academicYear}/${classValue}.json`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subject sequence");
      }
      const data = await response.json();
      const orderedSubjects = Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b)).map((key) => data[key]);
      setSubjectSequence(orderedSubjects);
    } catch (error) {
      console.error("Error fetching subject sequence:", error);
    }
  };
  useEffect(() => {
    if (alertMessage) {
      setShowAlert(true);
      const timeoutId = setTimeout(() => {
        setShowAlert(false);
        setAlertMessage("");
      }, 3e3);
      return () => clearTimeout(timeoutId);
    }
  }, [alertMessage]);
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") || "English";
    setLanguage(storedLanguage);
  }, []);
  const fetchSchoolName = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/schoolData.json`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch school name");
      }
      const data = await response.json();
      setSchoolName(data.schoolName || " ");
      setSchoolLogo(data.schoolLogo || "");
    } catch (error) {
      console.error("Error fetching school name:", error);
    }
  };
  useEffect(() => {
    if (selectedExamName && classValue && academicYear) {
      fetchMarksForSelectedSubject();
    }
  }, [selectedExamName, classValue, academicYear]);
  useEffect(() => {
    const fetchBasicStudentInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}.json`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch student info");
        }
        const studentInfo = await response.json();
        setSelectedStudentResults((prev) => ({
          ...prev,
          studentName: studentInfo.stdName,
          stdMother: studentInfo.stdMother,
          stdFather: studentInfo.stdFather,
          stdSurname: studentInfo.stdSurname,
          dob: studentInfo.dob,
          division: studentInfo.division,
          motherTounge: studentInfo.motherTounge,
          studentId: studentInfo.studentId,
          gender: studentInfo.gender,
          rollNo: studentInfo.rollNo
        }));
      } catch (error) {
        console.error("Error fetching student info:", error);
      }
    };
    if (srNo) {
      fetchBasicStudentInfo();
    }
  }, [srNo, udiseNumber]);
  const fetchStudentData = async () => {
    try {
      const firstSemesterResponse = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/First Semester.json`
      );
      const secondSemesterResponse = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/${selectedExamName}.json`
      );
      const firstSemesterData = await firstSemesterResponse.json();
      const secondSemesterData = await secondSemesterResponse.json();
      const nondiFirstSemesterResponse = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/First Semester/nondi.json`
      );
      const nondiSecondSemesterResponse = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/${selectedExamName}/nondi.json`
      );
      if (!nondiFirstSemesterResponse.ok || !nondiSecondSemesterResponse.ok) {
        throw new Error("Failed to fetch nondi data");
      }
      const nondiFirstSemesterData = await nondiFirstSemesterResponse.json();
      const nondiSecondSemesterData = await nondiSecondSemesterResponse.json();
      setSelectedStudentResults({
        ...selectedStudentResults,
        nondi: nondiSecondSemesterData || {},
        firstSemester: nondiFirstSemesterData || {}
      });
      const resultsWithTotal = {};
      const allSubjects = /* @__PURE__ */ new Set([
        ...Object.keys(firstSemesterData || {}),
        ...Object.keys(secondSemesterData || {})
      ]);
      allSubjects.forEach((subject) => {
        const firstSemesterGrade = firstSemesterData?.[subject]?.Akarik?.Total ? calculateGrade(
          firstSemesterData[subject].Akarik.Total + (firstSemesterData[subject].Sanklik?.Total || 0)
        ) : " ";
        const akarikTotal = secondSemesterData?.[subject]?.Akarik?.Total || 0;
        const sankalikTotal = secondSemesterData?.[subject]?.Sanklik?.Total || 0;
        const total = akarikTotal + sankalikTotal;
        const grade = calculateGrade(total);
        resultsWithTotal[subject] = {
          akarikTotal,
          sankalikTotal,
          total,
          grade,
          firstSemesterGrade
        };
      });
      setSelectedStudentResults((prev) => ({
        ...prev,
        results: resultsWithTotal
      }));
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };
  useEffect(() => {
    const fetchStudentData2 = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}.json`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch student info");
        }
        const studentInfo = await response.json();
        const firstSemesterResponse = await fetch(
          `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/First Semester.json`
        );
        const secondSemesterResponse = await fetch(
          `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/${selectedExamName}.json`
        );
        const firstSemesterData = await firstSemesterResponse.json();
        const secondSemesterData = await secondSemesterResponse.json();
        const nondiFirstSemesterResponse = await fetch(
          `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/First Semester/nondi.json`
        );
        const nondiSecondSemesterResponse = await fetch(
          `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/${selectedExamName}/nondi.json`
        );
        const nondiFirstSemesterData = await nondiFirstSemesterResponse.json();
        const nondiSecondSemesterData = await nondiSecondSemesterResponse.json();
        const resultsWithTotal = {};
        const allSubjects = /* @__PURE__ */ new Set([
          ...Object.keys(firstSemesterData || {}),
          ...Object.keys(secondSemesterData || {})
        ]);
        allSubjects.forEach((subject) => {
          const firstSemesterGrade = firstSemesterData?.[subject]?.Akarik?.Total ? calculateGrade(
            firstSemesterData[subject].Akarik.Total + (firstSemesterData[subject].Sanklik?.Total || 0)
          ) : " ";
          const akarikTotal = secondSemesterData?.[subject]?.Akarik?.Total || 0;
          const sankalikTotal = secondSemesterData?.[subject]?.Sanklik?.Total || 0;
          const total = akarikTotal + sankalikTotal;
          const grade = calculateGrade(total);
          resultsWithTotal[subject] = {
            akarikTotal,
            sankalikTotal,
            total,
            grade,
            firstSemesterGrade
          };
        });
        setSelectedStudentResults({
          studentName: studentInfo.stdName,
          stdMother: studentInfo.stdMother,
          stdFather: studentInfo.stdFather,
          stdSurname: studentInfo.stdSurname,
          dob: studentInfo.dob,
          division: studentInfo.division,
          motherTounge: studentInfo.motherTounge,
          studentId: studentInfo.studentId,
          gender: studentInfo.gender,
          rollNo: studentInfo.rollNo,
          results: resultsWithTotal,
          nondi: {
            specialEntries: nondiSecondSemesterData.specialEntries || "",
            interestsAndHobbies: nondiSecondSemesterData.interestsAndHobbies || "",
            necessaryCorrections: nondiSecondSemesterData.necessaryCorrections || ""
          },
          firstSemester: {
            specialEntries: nondiFirstSemesterData.specialEntries || "",
            interestsAndHobbies: nondiFirstSemesterData.interestsAndHobbies || "",
            necessaryCorrections: nondiFirstSemesterData.necessaryCorrections || ""
          }
        });
        setShowModal(true);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    if (academicYear && classValue && selectedExamName && srNo) {
      fetchStudentData2();
    }
  }, [academicYear, classValue, selectedExamName, srNo]);
  useEffect(() => {
    fetchSchoolName();
    if (academicYear && classValue && selectedExamName && srNo) {
      fetchStudentData();
    }
  }, [academicYear, classValue, selectedExamName, srNo]);
  const fetchMarksForSelectedSubject = async () => {
    try {
      const selectedStudents2 = studentData.filter(
        (student) => student.currentClass === classValue
      );
      setSelectedStudents(selectedStudents2);
      const marksDataPromises = selectedStudents2.map(async (student) => {
        const studentMarks = await fetchMarksData(
          student.srNo,
          academicYear,
          selectedExamName
        );
        return { srNo: student.srNo, marks: studentMarks };
      });
      const marksDataArray = await Promise.all(marksDataPromises);
      const marksData2 = marksDataArray.reduce((acc, { srNo: srNo2, marks }) => {
        acc[srNo2] = marks;
        return acc;
      }, {});
      setMarksData(marksData2);
    } catch (error) {
      console.error("Error fetching marks data:", error);
    }
  };
  const fetchMarksData = async (srNo2, academicYear2, examName) => {
    const url = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo2}/result/${academicYear2}/${examName}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      return data || {};
    } catch (error) {
      console.error("Error fetching marks data:", error);
      return {};
    }
  };
  const [selectedStudentForSr, setSelectedStudentForSr] = useState("");
  const calculateGradeEnglish = (total) => {
    if (total >= 91) return "A1";
    if (total >= 81) return "A2";
    if (total >= 71) return "B1";
    if (total >= 61) return "B2";
    if (total >= 51) return "C1";
    if (total >= 41) return "C2";
    if (total >= 33) return "D1";
    if (total >= 21) return "D2";
    return "Absent";
  };
  const calculateGradeMarathi = (total) => {
    if (total >= 91) return "अ-1";
    if (total >= 81) return "अ-2";
    if (total >= 71) return "ब-1";
    if (total >= 61) return "ब-2";
    if (total >= 51) return "क-1";
    if (total >= 41) return "क-2";
    if (total >= 33) return "ड-1";
    if (total >= 21) return "ड-2";
    return "अनुपस्थित";
  };
  const calculateGrade = (total) => {
    return language === "English" ? calculateGradeEnglish(total) : calculateGradeMarathi(total);
  };
  const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  const [attendance, setAttendance] = useState({
    Present: {},
    Absent: {},
    Leave: {}
  });
  useEffect(() => {
    const fetchAttendanceData = async () => {
      const srNo2 = selectedStudentForSr.serialNo;
      const startYear = academicYear.split("-")[0];
      const urlBase = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/Attendance/${srNo2}/Presenty/${startYear}`;
      try {
        const fetchedAttendance = {
          Present: {},
          Absent: {},
          Leave: {}
        };
        for (const month of months) {
          const url = `${urlBase}/${month}.json`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              let presentCount = 0;
              let absentCount = 0;
              let leaveCount = -1;
              for (const day in data) {
                const status = data[day]?.present;
                if (status === "present") {
                  presentCount++;
                } else if (status === "absent") {
                  absentCount++;
                } else if (status === null || status === void 0) {
                  leaveCount++;
                }
              }
              fetchedAttendance.Present[month] = presentCount;
              fetchedAttendance.Absent[month] = absentCount;
              fetchedAttendance.Leave[month] = leaveCount;
            } else {
              console.warn(`No data found for ${month}`);
            }
          } else {
            console.error(`Failed to fetch data for ${month}:`, response.statusText);
          }
        }
        setAttendance(fetchedAttendance);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
    fetchAttendanceData();
  }, [selectedStudentForSr, udiseNumber, academicYear]);
  const handleInputChange = async (type, month, value) => {
    const srNo2 = selectedStudentForSr.serialNo;
    const updatedAttendance = { ...attendance };
    updatedAttendance[type][month] = value;
    setAttendance(updatedAttendance);
    const url = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo2}/Attendance/${academicYear}/${month}/${type}.json`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        // Use PUT to set the value
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(value)
      });
      if (!response.ok) {
        console.error("Failed to save data:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  const [summerVacationDate, setSummerVacationDate] = useState("");
  const [winterVacationDate, setWinterVacationDate] = useState("");
  const firstSemesterMonths = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const secondSemesterMonths = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  const getMonthName = (month) => {
    const marathiMonths = {
      Jun: "जून",
      Jul: "जुलै",
      Aug: "ऑगस्ट",
      Sep: "सप्टेंबर",
      Oct: "ऑक्टोबर",
      Nov: "नोव्हेंबर",
      Dec: "डिसेंबर",
      Jan: "जानेवारी",
      Feb: "फेब्रुवारी",
      Mar: "मार्च",
      Apr: "एप्रिल",
      May: "मे"
    };
    return language === "English" ? month : marathiMonths[month];
  };
  const getAttendanceType = (type) => {
    const marathiTypes = {
      Present: "उपस्थित",
      Absent: "गैरहजर",
      Leave: "रजा"
    };
    return language === "English" ? type : marathiTypes[type];
  };
  const handlePrint = () => {
    const printContent = document.querySelector(".modal-body");
    if (printContent) {
      const printWindow = window.open("", "", "height=600,width=800");
      printWindow.document.write(`
      <html>
        <head>
          <title>Print Student Report</title>
          <style>
            /* General body styles */
            body {
              font-family: 'Poppins', sans-serif;
              margin: 0;
              padding: 0;
              color: black;
            }
            @page {
                size: A4 Landscape; /* auto is the initial value */
              margin: 3mm; /* this affects the margin in the printer settings */
            }
            .container {
              width: 297mm;
              height: 200mm;
              margin: 0 auto;
              box-sizing: border-box;
              padding: 3mm;
              border: 3px solid #0e0303;
              overflow: hidden;
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }

            .left, .right {
              width: 48%;
              border: 2px solid black;
              padding: 10px;
              box-sizing: border-box;
            }
.gradable{
position: absolute; /* add this */
bottom: 2px; /* add this */
left: 1%; /* add this */
width: 98%; /* add this */
}
         


.grad{
position: absolute; /* add this */
bottom: 0; /* add this */
left: 20px; /* add this */
width: 100%; /* add this */
}



            .left-box {
              background-color: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 10px;
            }

            .school-info {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
            }

            .school-info img {
              width: 100px;
              height: 100px;
              object-fit: cover;
              margin-right: 20px;
            }

            .school-info h2 {
              font-size: 18px;
              font-weight: bold;
              margin: 0;
            }

            .student-info {
              margin-top: 20px;
            }

            .student-info h3 {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
            }

            .student-info ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }

            .student-info li {
              margin-bottom: 10px;
            }

            .student-info label {
              font-weight: bold;
              margin-right: 10px;
            }

            .student-info span {
              font-size: 14px;
              color: #666;
            }

            .student-info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .student-info-grid section {
              background-color: #ffffff;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .student-info-grid h2 {
              font-size: 1em;
              margin-bottom: 10px;
              color: #333;
              border-bottom: 2px solid #ddd;
              padding-bottom: 5px;
            }

            .student-info-grid p {
              margin: 1px 0;
              font-size: 0.9em;
            }

            .student-info-grid label {
              font-weight: bold;
              color: #555;
            }

            .student-info-grid span {
              margin-left: 5px;
              color: #666;
            }

            .student-info-grid p:last-child {
              margin-bottom: 0;
            }

            .left {
              border: 2px solid #0f0202;
              padding: 20px;
              position: relative;
            }

            .right {
              position: relative;
              width: 48% !important;
              border: 2px solid #0e0101;
              padding: 10px;
              overflow: hidden;
            }

            /* Table styles */
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }

            th, td {
              border: 1px solid #130606;
              padding: 5px;
              text-align: left;
              word-wrap: break-word;
              box-sizing: border-box;
            }

            .table-striped tbody tr:nth-of-type(odd) {
              background-color: rgba(0, 0, 0, 0.05); /* Stripe effect */
            }

            .table-bordered {
              border: 1px solid #130606;
            }

           .grade-table {
margin-top: 20px;
}

.grade-table table {
width: 100%;
border-collapse: collapse;
}

.grade-table th, .grade-table td {
border: 1px solid #ccc;
padding: 5px;
text-align: center;
box-sizing: border-box;
}

.grade-table thead th {
background-color: #f4f4f4;
}

.grade-table tbody td {
text-align: center;
}


            .attendance-table th, .attendance-table td {
              width: 33%;
            }
              /* General Table Styles */
table {
width: 100%;
border-collapse: collapse;
margin-top: 20px; /* Adds space above the table */
}

thead {
background-color: #f2f2f2; /* Light grey background for header */
}

th, td {
border: 1px solid #ddd; /* Light grey border */
padding: 8px; /* Space within cells */
text-align: left; /* Align text to the left */
}

th {
background-color: #f4f4f4; /* Slightly darker grey background for header cells */
font-weight: bold; /* Bold text in header */
}

input[type="text"] {
width: 100%; /* Full width of cell */
box-sizing: border-box; /* Include padding and border in element's total width and height */
border: 1px solid #ccc; /* Light grey border for input */
padding: 4px; /* Space inside input field */
font-size: 14px; /* Text size inside input */
}

input[type="text"]:focus {
outline: none; /* Remove default focus outline */
border-color: #007bff; /* Border color on focus */
box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); /* Shadow effect on focus */
}

/* Zebra striping for table rows */
tbody tr:nth-child(odd) {
background-color: #fafafa; /* Light grey background for odd rows */
}

            /* Ensure the right container does not overflow */
            .right {
              overflow: hidden; /* Clipping any content that exceeds the container bounds */
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      console.error("Print content not found");
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(AlertMessage, { message: alertMessage, show: showAlert }),
    /* @__PURE__ */ jsxs("div", { className: " main-content-of-page", style: { top: 0 }, children: [
      /* @__PURE__ */ jsxs(Modal, { show: showModal, dialogClassName: "modal-80w", children: [
        /* @__PURE__ */ jsx(Modal.Body, { children: selectedExamName === "Second Semester" && selectedStudentResults ? /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "container ", children: [
            /* @__PURE__ */ jsxs("div", { className: "left", children: [
              /* @__PURE__ */ jsx("div", { className: "left-box", children: /* @__PURE__ */ jsxs("div", { className: "school-info", children: [
                schoolLogo && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", { src: schoolLogo, alt: `$Logo` }) }),
                /* @__PURE__ */ jsx("h2", { children: schoolName })
              ] }) }),
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsxs("div", { class: "student-info-grid", children: [
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Name :" : "नाव :" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    selectedStudentResults?.studentName || " ",
                    " ",
                    selectedStudentResults?.stdFather || " ",
                    " ",
                    selectedStudentResults?.stdSurname || " "
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Roll No :" : "हजेरी क्रमांक :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.rollNo || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Exam :" : "परीक्षा सत्र :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedExamName || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Year :" : "वर्ष :" }),
                  /* @__PURE__ */ jsx("span", { children: academicYear || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Class :" : "वर्ग :" }),
                  /* @__PURE__ */ jsx("span", { children: classValue || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Mother Name :" : "आईचे नाव :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.stdMother || "" })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "DOB :" : "जन्मतारीख :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.dob || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Division :" : "तुकडी :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.division || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Mother Tongue :" : "मातृभाषा :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.motherTounge || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Student ID :" : "विद्यार्थी आयडी :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.studentId || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Gender :" : "लिंग :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.gender || " " })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "gradable", children: /* @__PURE__ */ jsxs("table", { children: [
                /* @__PURE__ */ jsxs("thead", { children: [
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("th", { rowspan: "2", children: language === "English" ? "Subject :" : "विषय" }),
                    /* @__PURE__ */ jsx("th", { colspan: "2", children: language === "English" ? "First Semester" : "प्रथम सत्र" }),
                    /* @__PURE__ */ jsx("th", { colspan: "2", children: language === "English" ? "Second Semester" : "द्वितीय सत्र" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("th", { children: "Kg" }),
                    /* @__PURE__ */ jsx("th", { children: "Cm" }),
                    /* @__PURE__ */ jsx("th", { children: "Kg" }),
                    /* @__PURE__ */ jsx("th", { children: "Cm" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("tbody", { children: [
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "Weight" : "वजन" }),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {})
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "Hight " : "उंची" }),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {})
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "right", children: [
              /* @__PURE__ */ jsx("h2", { children: language === "English" ? "Attendance:" : "हजेरी" }),
              /* @__PURE__ */ jsxs("table", { children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("th", { children: language === "English" ? "Type:" : "प्रकार" }),
                  firstSemesterMonths.map((month, index) => /* @__PURE__ */ jsx("th", { children: getMonthName(month) }, index))
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { children: ["Present", "Absent", "Leave"].map((type) => /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("td", { children: getAttendanceType(type) }),
                  firstSemesterMonths.map((month, index) => /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: type === "Leave" && attendance[type][month] < 0 ? "" : attendance[type][month] || "",
                      onChange: (e) => handleInputChange(type, month, e.target.value)
                    }
                  ) }, index))
                ] }, type)) })
              ] }),
              /* @__PURE__ */ jsx("h5", { style: { marginTop: "10px" }, children: language === "English" ? "Second Semester Attendance:" : "द्वितीय सत्राची हजेरी:" }),
              /* @__PURE__ */ jsxs("table", { children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("th", { children: language === "English" ? "Type:" : "प्रकार" }),
                  secondSemesterMonths.map((month, index) => /* @__PURE__ */ jsx("th", { children: getMonthName(month) }, index))
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { children: ["Present", "Absent", "Leave"].map((type) => /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("td", { children: getAttendanceType(type) }),
                  secondSemesterMonths.map((month, index) => /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: type === "Leave" && attendance[type][month] < 0 ? "" : attendance[type][month] || "",
                      onChange: (e) => handleInputChange(type, month, e.target.value)
                    }
                  ) }, index))
                ] }, type)) })
              ] }),
              /* @__PURE__ */ jsx("p", { style: { marginTop: "5px" }, children: language === "English" ? "After the summer vacation school will start from." : "उन्हाळी सुटीनंतर शाळा दि. पासून सुरू होईल." }),
              /* @__PURE__ */ jsx("div", { style: { width: "150px" }, children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  value: summerVacationDate,
                  onChange: (e) => setSummerVacationDate(e.target.value)
                }
              ) }),
              /* @__PURE__ */ jsx("div", { className: "grad", children: /* @__PURE__ */ jsxs("p", { children: [
                language === "English" ? " Instructions for parents:" : "पालकांसाठी सूचना",
                /* @__PURE__ */ jsxs("li", { children: [
                  "  ",
                  language === "English" ? " Students should wear school uniform every day." : "विद्यार्थ्यांनी दररोज शालेय गणवेश परिधान करावा."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  " ",
                  language === "English" ? "  A student should do the study given in school every day." : "विद्यार्थ्याने शाळेत दिलेला अभ्यास दररोज करावा."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  " ",
                  language === "English" ? " Students should attend school on time and regularly every day." : "विद्यार्थ्यांनी दररोज वेळेवर व नियमितपणे शाळेत हजर राहावे."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  " ",
                  language === "English" ? " Students should not carry valuables, money. " : "विद्यार्थ्यांनी मौल्यवान वस्तू, पैसे घेऊन जाऊ नये."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "  ",
                  language === "English" ? " Students should follow the rules and discipline of the school. " : "विद्यार्थ्यांनी शाळेचे नियम व शिस्तीचे पालन करावे."
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("p", { style: { marginTop: "70px", marginLeft: "350px" }, children: language === "English" ? "Parents Signature " : "पालकांची सही" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "container mt-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "left", children: [
              /* @__PURE__ */ jsx("h2", { children: language === "English" ? "Student Progress Report " : "विद्यार्थी प्रगती अहवाल" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "roll-no", children: language === "English" ? "Roll No: " : "हजेरी क्रमांक" }),
                /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.rollNo || " " })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "student-name", children: language === "English" ? "Student Name: " : "विद्यार्थ्याचे नाव" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  selectedStudentResults?.studentName || " ",
                  " ",
                  selectedStudentResults?.stdFather || " ",
                  " ",
                  selectedStudentResults?.stdSurname || " "
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "class", children: language === "English" ? "Class: " : "वर्ग" }),
                /* @__PURE__ */ jsx("span", { children: classValue || " " })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "exam-roll-no", children: language === "English" ? "Exam: " : "परीक्षा" }),
                /* @__PURE__ */ jsx("span", { children: selectedExamName || " " })
              ] }),
              selectedStudentResults?.results ? /* @__PURE__ */ jsxs("table", { className: "table table-striped table-bordered", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("th", { children: language === "English" ? "Subject " : "विषय" }),
                  /* @__PURE__ */ jsx("th", { children: language === "English" ? "First Semester " : "पहिली सत्र" }),
                  /* @__PURE__ */ jsx("th", { children: language === "English" ? "Second Semester " : "द्वितीय सत्र" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { children: subjectSequence.filter((subject, index) => subject && index !== 0).map((subject) => {
                  const grades = selectedStudentResults.results[subject] || {};
                  return /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("b", { children: subject }) }),
                    /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("b", { children: grades.firstSemesterGrade || "Absent" }) }),
                    " ",
                    /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("b", { children: grades.grade || "Absent" }) }),
                    " "
                  ] }, subject);
                }) })
              ] }) : /* @__PURE__ */ jsx("p", { children: language === "English" ? "No results available." : "कोणतेही प्रगतीपत्रक उपलब्ध नाहीत." }),
              /* @__PURE__ */ jsx("div", {}),
              /* @__PURE__ */ jsxs("div", { className: "grad", style: { display: "flex", alignItems: "center" }, children: [
                /* @__PURE__ */ jsx("label", { style: { marginRight: "20px", marginBottom: "2px", marginLeft: "20px" }, htmlFor: "class-teacher", children: language === "English" ? "Class Teacher" : "वर्गशिक्षक" }),
                /* @__PURE__ */ jsx("label", { style: { marginRight: "20px", marginBottom: "2px", marginLeft: "45%" }, htmlFor: "principal", children: language === "English" ? "Principal " : "प्राचार्य" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "right", children: [
              /* @__PURE__ */ jsx("h2", { style: { textAlign: "center", color: "black", fontFamily: "Arial, sans-serif", fontWeight: "bold", marginBottom: "20px" }, children: language === "English" ? "Nondi " : "नोंदी" }),
              /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontFamily: "Arial, sans-serif" }, children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { style: { color: "black", textAlign: "center" }, children: [
                  /* @__PURE__ */ jsxs("th", { colSpan: "", style: { padding: "2px", border: "1px solid #ddd", fontSize: "16px" }, children: [
                    language === "English" ? "First Semester " : "पहिली सत्र",
                    " "
                  ] }),
                  /* @__PURE__ */ jsxs("th", { colSpan: "", style: { padding: "2px", border: "1px solid #ddd", fontSize: "16px" }, children: [
                    language === "English" ? "Second Semester " : "दुसरी सत्र",
                    " "
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxs("tbody", { children: [
                  /* @__PURE__ */ jsx("tr", { style: { color: "black", textAlign: "center" }, children: /* @__PURE__ */ jsx("th", { colSpan: "2", style: { padding: "2px", border: "1px solid #ddd", fontSize: "16px" }, children: language === "English" ? "Special Progress" : "विशेष प्रगती" }) }),
                  /* @__PURE__ */ jsxs("tr", { style: { backgroundColor: "#ffffff" }, children: [
                    /* @__PURE__ */ jsx("td", { style: { width: "50%", padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }, children: /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        id: "special-progress",
                        style: {
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                          resize: "none",
                          fontSize: "14px",
                          height: "100px"
                        },
                        value: selectedStudentResults?.firstSemester?.specialEntries || "No data available",
                        readOnly: true
                      }
                    ) }),
                    /* @__PURE__ */ jsx("td", { style: { width: "50%", padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }, children: /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        id: "special-progress",
                        style: {
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                          resize: "none",
                          fontSize: "14px",
                          height: "100px"
                        },
                        value: selectedStudentResults?.nondi?.specialEntries || "No data available",
                        readOnly: true
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsx("tr", { style: { color: "black", textAlign: "center" }, children: /* @__PURE__ */ jsx("th", { colSpan: "2", style: { padding: "2px", border: "1px solid #ddd", fontSize: "16px" }, children: language === "English" ? "Hobbies" : "छंद" }) }),
                  /* @__PURE__ */ jsxs("tr", { style: { backgroundColor: "#ffffff" }, children: [
                    /* @__PURE__ */ jsx("td", { style: { width: "33%", padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }, children: /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        id: "special-progress",
                        style: {
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                          resize: "none",
                          fontSize: "14px",
                          height: "100px"
                        },
                        value: selectedStudentResults?.firstSemester?.interestsAndHobbies || "No data available",
                        readOnly: true
                      }
                    ) }),
                    /* @__PURE__ */ jsx("td", { style: { padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }, children: /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        id: "hobbies",
                        style: {
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                          resize: "none",
                          fontSize: "14px",
                          height: "100px"
                        },
                        value: selectedStudentResults?.nondi?.interestsAndHobbies || "No data available",
                        readOnly: true
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsx("tr", { style: { color: "black", textAlign: "center" }, children: /* @__PURE__ */ jsx("th", { colSpan: "2", style: { padding: "2px", border: "1px solid #ddd", fontSize: "16px" }, children: language === "English" ? "Required Improvements" : "आवश्यक सुधारणा" }) }),
                  /* @__PURE__ */ jsxs("tr", { style: { backgroundColor: "#ffffff" }, children: [
                    /* @__PURE__ */ jsx("td", { style: { width: "33%", padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }, children: /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        id: "special-progress",
                        style: {
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                          resize: "none",
                          fontSize: "14px",
                          height: "100px"
                        },
                        value: selectedStudentResults?.firstSemester?.necessaryCorrections || "No data available",
                        readonly: true
                      }
                    ) }),
                    /* @__PURE__ */ jsx("td", { style: { padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }, children: /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        id: "improvements",
                        style: {
                          width: "100%",
                          padding: "10px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                          resize: "none",
                          fontSize: "14px",
                          height: "100px"
                        },
                        value: selectedStudentResults?.nondi?.necessaryCorrections || "No data available",
                        readOnly: true
                      }
                    ) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grade-table", children: [
                /* @__PURE__ */ jsx("h2", { children: language === "English" ? "Grade Table" : "श्रेणी टेबल" }),
                /* @__PURE__ */ jsxs("table", { children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "Marks" : "मार्क्स" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "A1" : "अ1" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "A2" : "अ2" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "B1" : "ब1" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "B2" : "ब2" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "C1" : "क1" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "C2" : "क2" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "D1" : "ड1" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "D2" : "ड2" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "Absent" : "अनुपस्थित" })
                  ] }) }),
                  /* @__PURE__ */ jsx("tbody", { children: /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { children: "%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "91% to 100%" : "91% ते 100%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "81% to 90%" : "81% ते 90%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "71% to 80%" : "71% ते 80%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "61% to 70%" : "61% ते 70%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "51% to 60%" : "51% ते 60%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "41% to 50%" : "41% ते 50%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "33% to 40%" : "33% ते 40%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "21% to 32%" : "21% ते 32%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "less than 20%" : "20% पेक्षा कमी" })
                  ] }) })
                ] })
              ] })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "container mt-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "left", children: [
              /* @__PURE__ */ jsx("div", { className: "left-box", children: /* @__PURE__ */ jsxs("div", { className: "school-info", children: [
                schoolLogo && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", { src: schoolLogo, alt: `$Logo` }) }),
                /* @__PURE__ */ jsx("h2", { children: schoolName })
              ] }) }),
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsxs("div", { class: "student-info-grid", children: [
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Name :" : "विद्यार्थ्याचे नाव :" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    selectedStudentResults?.studentName || "-",
                    " ",
                    selectedStudentResults?.stdFather || " ",
                    " ",
                    selectedStudentResults?.stdSurname || " "
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Roll No :" : "हजेरी क्रमांक :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.rollNo || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Exam :" : "परीक्षा सत्र :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedExamName || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Year :" : "वर्ष :" }),
                  /* @__PURE__ */ jsx("span", { children: academicYear || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Class :" : "वर्ग :" }),
                  /* @__PURE__ */ jsx("span", { children: classValue || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Mother Name :" : "आईचे नाव :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.stdMother || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "DOB :" : "जन्मतारीख :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.dob || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Division :" : "तुकडी :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.division || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Mother Tongue :" : "मातृभाषा :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.motherTounge || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Student ID :" : "विद्यार्थी आयडी :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.studentId || " " })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("label", { children: language === "English" ? "Gender :" : "लिंग :" }),
                  /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.gender || " " })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "gradable", children: /* @__PURE__ */ jsxs("table", { children: [
                /* @__PURE__ */ jsxs("thead", { children: [
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("th", { rowspan: "2", children: language === "English" ? "Subject :" : "विषय" }),
                    /* @__PURE__ */ jsx("th", { colspan: "2", children: language === "English" ? "First Semester" : "प्रथम सत्र" }),
                    /* @__PURE__ */ jsx("th", { colspan: "2", children: language === "English" ? "Second Semester" : "द्वितीय सत्र" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("th", { children: "Kg" }),
                    /* @__PURE__ */ jsx("th", { children: "Cm" }),
                    /* @__PURE__ */ jsx("th", { children: "Kg" }),
                    /* @__PURE__ */ jsx("th", { children: "Cm" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("tbody", { children: [
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "Weight" : "वजन" }),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {})
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "Hight" : "उंची" }),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {}),
                    /* @__PURE__ */ jsx("td", {})
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "right", children: [
              /* @__PURE__ */ jsx("h2", { children: language === "English" ? "Attendance:" : "हजेरी" }),
              /* @__PURE__ */ jsxs("table", { children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("th", { children: language === "English" ? "Type:" : "प्रकार" }),
                  firstSemesterMonths.map((month, index) => /* @__PURE__ */ jsx("th", { children: getMonthName(month) }, index))
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { children: ["Present", "Absent", "Leave"].map((type) => /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("td", { children: getAttendanceType(type) }),
                  firstSemesterMonths.map((month, index) => /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: type === "Leave" && attendance[type][month] < 0 ? "" : attendance[type][month] || "",
                      onChange: (e) => handleInputChange(type, month, e.target.value)
                    }
                  ) }, index))
                ] }, type)) })
              ] }),
              /* @__PURE__ */ jsx("p", { style: { marginTop: "5px" }, children: language === "English" ? "After the winter vacation the school will start from." : "हिवाळी सुटीनंतर शाळा दि. पासून सुरू होईल." }),
              /* @__PURE__ */ jsx("div", { style: { width: "150px" }, children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  value: winterVacationDate,
                  onChange: (e) => setWinterVacationDate(e.target.value)
                }
              ) }),
              /* @__PURE__ */ jsx("div", { className: "grad", children: /* @__PURE__ */ jsxs("p", { children: [
                language === "English" ? " Instructions for parents:" : "पालकांसाठी सूचना",
                /* @__PURE__ */ jsxs("li", { children: [
                  "  ",
                  language === "English" ? " Students should wear school uniform every day." : "विद्यार्थ्यांनी दररोज शालेय गणवेश परिधान करावा."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  " ",
                  language === "English" ? "  A student should do the study given in school every day." : "विद्यार्थ्याने शाळेत दिलेला अभ्यास दररोज करावा."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  " ",
                  language === "English" ? " Students should attend school on time and regularly every day." : "विद्यार्थ्यांनी दररोज वेळेवर व नियमितपणे शाळेत हजर राहावे."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  " ",
                  language === "English" ? " Students should not carry valuables, money. " : "विद्यार्थ्यांनी मौल्यवान वस्तू, पैसे घेऊन जाऊ नये."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "  ",
                  language === "English" ? " Students should follow the rules and discipline of the school. " : "विद्यार्थ्यांनी शाळेचे नियम व शिस्तीचे पालन करावे."
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("p", { style: { marginTop: "70px", marginLeft: "350px" }, children: language === "English" ? "Parents Signature " : "पालकांची सही" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "container mt-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "left", children: [
              /* @__PURE__ */ jsx("h2", { children: language === "English" ? " Student Progress Report" : "विद्यार्थी प्रगती अहवाल" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "roll-no", children: language === "English" ? " Roll No:" : "हजेरी क्रमांक:" }),
                /* @__PURE__ */ jsx("span", { children: selectedStudentResults?.rollNo || " " })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "student-name", children: language === "English" ? " Student Name:" : "विद्यार्थ्याचे नाव:" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  selectedStudentResults?.studentName || " ",
                  " ",
                  selectedStudentResults?.stdFather || " ",
                  " ",
                  selectedStudentResults?.stdSurname || " "
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "class", children: language === "English" ? " Class:" : "वर्ग:" }),
                /* @__PURE__ */ jsx("span", { children: classValue || " " })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "exam-roll-no", children: language === "English" ? " Exam:" : "परीक्षा:" }),
                /* @__PURE__ */ jsx("span", { children: selectedExamName || " " })
              ] }),
              selectedStudentResults?.results ? /* @__PURE__ */ jsxs("table", { className: "table table-striped table-bordered", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("th", { children: language === "English" ? "Subject" : "विषय" }),
                  /* @__PURE__ */ jsx("th", { children: language === "English" ? "Grade" : "श्रेणी" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { children: subjectSequence.filter((subject, index) => subject && index !== 0).map((subject) => {
                  const { grade } = selectedStudentResults.results[subject] || {};
                  return /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("b", { children: subject }) }),
                    /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("b", { children: grade || "Absent" }) })
                  ] }, subject);
                }) })
              ] }) : /* @__PURE__ */ jsx("p", { children: language === "English" ? "No results available." : "कोणतेही प्रगतीपत्रक उपलब्ध नाहीत." }),
              /* @__PURE__ */ jsx("div", {}),
              /* @__PURE__ */ jsxs("div", { className: "grad", style: { display: "flex", alignItems: "center" }, children: [
                /* @__PURE__ */ jsx("label", { style: { marginRight: "20px", marginBottom: "2px", marginLeft: "20px" }, htmlFor: "class-teacher", children: language === "English" ? "Class Teacher" : "वर्गशिक्षक" }),
                /* @__PURE__ */ jsx("label", { style: { marginRight: "20px", marginBottom: "2px", marginLeft: "45%" }, htmlFor: "principal", children: language === "English" ? "Principal" : "प्राचार्य" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "right", children: [
              /* @__PURE__ */ jsx("h2", { children: language === "English" ? "Nondi" : "नोंदी" }),
              /* @__PURE__ */ jsxs("table", { children: [
                /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("th", { style: { width: "33%" }, children: language === "English" ? "Special Progress:" : "विशेष प्रगती:" }),
                  /* @__PURE__ */ jsx("th", { style: { width: "33%" }, children: language === "English" ? "Hobbies:" : "छंद:" }),
                  /* @__PURE__ */ jsx("th", { style: { width: "33%" }, children: language === "English" ? "Required Improvements:" : "आवश्यक सुधारणा:" })
                ] }),
                /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("td", { style: { width: "33%" }, children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      id: "special-progress",
                      style: {
                        height: "150px",
                        overflowY: "auto",
                        padding: "10px",
                        border: "1px solid black"
                      },
                      contentEditable: "false",
                      suppressContentEditableWarning: true,
                      children: selectedStudentResults?.nondi?.specialEntries || ""
                    }
                  ) }),
                  /* @__PURE__ */ jsx("td", { style: { width: "33%" }, children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      id: "hobbies",
                      style: {
                        height: "150px",
                        overflowY: "auto",
                        padding: "10px",
                        border: "1px solid black"
                      },
                      contentEditable: "false",
                      suppressContentEditableWarning: true,
                      children: selectedStudentResults?.nondi?.interestsAndHobbies || ""
                    }
                  ) }),
                  /* @__PURE__ */ jsx("td", { style: { width: "33%" }, children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      id: "improvements",
                      style: {
                        height: "150px",
                        overflowY: "auto",
                        padding: "10px",
                        border: "1px solid black"
                      },
                      contentEditable: "false",
                      suppressContentEditableWarning: true,
                      children: selectedStudentResults?.nondi?.necessaryCorrections || ""
                    }
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grade-table", children: [
                /* @__PURE__ */ jsx("h2", { children: language === "English" ? "Grade Table" : "श्रेणी टेबल" }),
                /* @__PURE__ */ jsxs("table", { children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "Marks" : "मार्क्स" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "A1" : "अ-1" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "A2" : "अ-2" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "B1" : "ब-1" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "B2" : "ब-2" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "C1" : "क-1" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "C2" : "क-2" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "D1" : "ड-1" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "D2" : "ड-2" }),
                    /* @__PURE__ */ jsx("th", { children: language === "English" ? "Absent" : "अनुपस्थित" })
                  ] }) }),
                  /* @__PURE__ */ jsx("tbody", { children: /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { children: "%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "91% to 100%" : "91% ते 100%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "81% to 90%" : "81% ते 90%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "71% to 80%" : "71% ते 80%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "61% to 70%" : "61% ते 70%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "51% to 60%" : "51% ते 60%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "41% to 50%" : "41% ते 50%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "33% to 40%" : "33% ते 40%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "21% to 32%" : "21% ते 32%" }),
                    /* @__PURE__ */ jsx("td", { children: language === "English" ? "less than 20%" : "20% पेक्षा कमी" })
                  ] }) })
                ] })
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Modal.Footer, { children: /* @__PURE__ */ jsx(Button, { variant: "primary", onClick: handlePrint, children: language === "English" ? "Print" : "Print करा" }) })
      ] }),
      /* @__PURE__ */ jsx("style", { jsx: true, children: `
      .modal.show .modal-dialog {
  transform: auto; 
      }
      ` })
    ] })
  ] });
};
function WebResultRouteComponent() {
  const {
    udiseNumber,
    srNo,
    academicYear,
    classValue,
    selectedExamName
  } = Route.useParams();
  return /* @__PURE__ */ jsx(MemoryRouter, { initialEntries: [`/webResult/${udiseNumber}/${srNo}/${academicYear}/${classValue}/${selectedExamName}`], children: /* @__PURE__ */ jsx(Routes, { children: /* @__PURE__ */ jsx(Route$1, { path: "/webResult/:udiseNumber/:srNo/:academicYear/:classValue/:selectedExamName", element: /* @__PURE__ */ jsx(WebResult, {}) }) }) });
}
export {
  WebResultRouteComponent as component
};
