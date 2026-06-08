import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../result/nondibook.css';
// import Sidebar from '../../components/Sidebar';
import AlertMessage from "../../AlertMessage";


function DailyRegister() {
  const [academicYear, setAcademicYear] = useState('');
  const [classValue, setClassValue] = useState('');
  const [selectedExamName, setSelectedExamName] = useState('');
  const [studentData, setStudentData] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [classes, setClasses] = useState([]);
  const [selectedStudentResults, setSelectedStudentResults] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');
  const [subjects, setSubjects] = useState({});

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'English';
    setLanguage(storedLanguage);
  }, []);

  const udiseNumber = localStorage.getItem("udiseNumber");
  const examNames = [ 'Second Semester'];
  const examNameTranslations = {
    "Second Semester": "द्वितीय सत्र",
  };

  const [subjectSequence, setSubjectSequence] = useState([]); // New state for subject sequence
  useEffect(() => {
    if (academicYear && classValue) {
      fetchSubjectSequence();
    }
  }, [academicYear, classValue]);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  useEffect(() => {
    if (alertMessage) {
      setShowAlert(true);
      const timeoutId = setTimeout(() => {
        setShowAlert(false);
        setAlertMessage(""); 
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [alertMessage]);

useEffect(() => {
    const fetchDefaultSettings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/defaultSettings.json`);
        if (response.ok) {
          const data = await response.json();
          
          if (data) {
            setAcademicYear(data.defaultYear || ""); 
          }
        } else {
          console.error("Failed to fetch default settings.");
        }
      } catch (error) {
        console.error("Error fetching default settings:", error);
      }
    };
  
    fetchDefaultSettings();
  }, [udiseNumber]);

  const fetchSubjectSequence = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/${academicYear}/${classValue}.json`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch subject sequence');
      }
      const data = await response.json();
      // Assuming the data is an object with numeric keys
      const orderedSubjects = Object.keys(data)
        .sort((a, b) => parseInt(a) - parseInt(b)) // Sort by numeric keys
        .map((key) => data[key]); // Map keys to subject names
      setSubjectSequence(orderedSubjects);
    } catch (error) {
      console.error('Error fetching subject sequence:', error);
    }
  };



  const fetchSchoolName = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/schoolData.json`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch school name');
      }
      const data = await response.json();
      setSchoolName(data.schoolName || 'N/A');
      setSchoolLogo(data.schoolLogo || ''); // Add this line
    } catch (error) {
      console.error('Error fetching school name:', error);
    }
  };
  useEffect(() => {
    fetchSchoolName();
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (selectedExamName && classValue && academicYear) {
      fetchMarksForSelectedSubject();
    }
  }, [selectedExamName, classValue, academicYear]);

  const handleAcademicYearChange = (e) => setAcademicYear(e.target.value);
  const handleClassChange = (e) => {
    setClassValue(e.target.value);
    fetchSubjectsForClass(e.target.value);
  };
  const handleExamNameChange = (e) => {
    setSelectedExamName(e.target.value);
  }
  const fetchStudentData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData.json`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      const filteredData = Object.keys(data)
        .filter(key => data[key] !== null)
        .map(key => ({ srNo: key, ...data[key]}));

            const activeStudents = filteredData.filter(student => 
          student.isActive !== false
        );

      setStudentData(activeStudents);
      const classSet = new Set();
      activeStudents.forEach((student) => {
        if (student.currentClass) {
          classSet.add(String(student.currentClass));
        }
      });
      setClasses([...classSet]);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  
  const fetchSubjectsForClass = async (classValue) => {
    try {
      if (!academicYear) {
        console.error("Academic year is not set");
        return;
      }
  
      const subjects = {};
      for (const student of studentData) {
        if (student.currentClass === classValue) {
          for (const examName of examNames) {
            const response = await fetch(
              `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${student.srNo}/result/${academicYear}/${examName}.json`
            );
            if (!response.ok) {
              throw new Error(`Network response was not ok for student ${student.srNo}`);
            }
            const studentResult = await response.json();
            if (studentResult) {
              Object.keys(studentResult).forEach((subject) => {
                if (subject !== "nondi") { // Add this condition to exclude "nondi" subject
                  subjects[subject] = true;
                }
              });
            }
          }
        }
      }
  
      setSubjects(subjects);
    } catch (error) {
      console.error(`Error fetching subjects for class ${classValue} and academic year ${academicYear}:`, error);
    }
  };

  const fetchMarksForSelectedSubject = async () => {
    try {
      const selectedStudents = studentData.filter(
        (student) => student.currentClass === classValue
      );
      setSelectedStudents(selectedStudents);
      const marksDataPromises = selectedStudents.map(async (student) => {
        const studentMarks = await fetchMarksData(
          student.srNo,
          academicYear,
          selectedExamName
        );
        return { srNo: student.srNo, marks: studentMarks };
      });

      const marksDataArray = await Promise.all(marksDataPromises);
      const marksData = marksDataArray.reduce((acc, { srNo, marks }) => {
        acc[srNo] = marks;
        return acc;
      }, {});

      setMarksData(marksData);
    } catch (error) {
      console.error('Error fetching marks data:', error);
    }
  };

  const fetchMarksData = async (srNo, academicYear, examName) => {
    const url = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/${examName}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      return data || {};
    } catch (error) {
      console.error('Error fetching marks data:', error);
      return {};
    }
  };

  const [selectedStudentForSr, setSelectedStudentForSr] = useState('')
  const viewResult = async (srNo) => {
    try {
      const student = selectedStudents.find((student) => student.srNo === srNo);
      setSelectedStudentForSr(student);
      if (!student) {
        throw new Error("Student not found");
      }
  
      // Fetch data for both semesters
      const [firstSemesterResponse, secondSemesterResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/First Semester.json`),
        fetch(`${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/Second Semester.json`)
      ]);
  
      if (!firstSemesterResponse.ok || !secondSemesterResponse.ok) {
        throw new Error("Network response was not ok");
      }
  
      const firstSemesterData = await firstSemesterResponse.json();
      const secondSemesterData = await secondSemesterResponse.json();
  
  
      const resultsWithTotal = {};
  
      // Process first semester data
      Object.keys(firstSemesterData).forEach((subject) => {
        const akarikFields = {

          Activity: firstSemesterData[subject]?.Akarik?.Activity || 0,
          DailyMonitoring: firstSemesterData[subject]?.Akarik?.['Daily Monitoring'] || 0,
          Demonstration: firstSemesterData[subject]?.Akarik?.Demonstration || 0,
          Homework: firstSemesterData[subject]?.Akarik?.Homework || 0,
          OralWork: firstSemesterData[subject]?.Akarik?.['Oral Work'] || 0,
          Others: firstSemesterData[subject]?.Akarik?.Others || 0,
          Project: firstSemesterData[subject]?.Akarik?.Project || 0,
          Test: firstSemesterData[subject]?.Akarik?.Test || 0,
          Total: firstSemesterData[subject]?.Akarik?.Total || 0,
        };
  
        const sankalikFields = {
          Demonstration: firstSemesterData[subject]?.Sanklik?.Demonstration || 0,
          Orally: firstSemesterData[subject]?.Sanklik?.Orally || 0,
          Writing: firstSemesterData[subject]?.Sanklik?.Writing || 0,
          Total: firstSemesterData[subject]?.Sanklik?.Total || 0,
        };
  
        const total = akarikFields.Total + sankalikFields.Total;
        const grade = calculateGrade(total);

// Process second semester data for the same subject
const secondSemesterAkarikFields = {
  Activity: secondSemesterData[subject]?.Akarik?.Activity || 0,
  DailyMonitoring: secondSemesterData[subject]?.Akarik?.['Daily Monitoring'] || 0,
  Demonstration: secondSemesterData[subject]?.Akarik?.Demonstration || 0,
  Homework: secondSemesterData[subject]?.Akarik?.Homework || 0,
  OralWork: secondSemesterData[subject]?.Akarik?.['Oral Work'] || 0,
  Others: secondSemesterData[subject]?.Akarik?.Others || 0,
  Project: secondSemesterData[subject]?.Akarik?.Project || 0,
  Test: secondSemesterData[subject]?.Akarik?.Test || 0,
  Total: secondSemesterData[subject]?.Akarik?.Total || 0,
};

const secondSemesterSankalikFields = {
  Demonstration: secondSemesterData[subject]?.Sanklik?.Demonstration || 0,
  Orally: secondSemesterData[subject]?.Sanklik?.Orally || 0,
  Writing: secondSemesterData[subject]?.Sanklik?.Writing || 0,
  Total: secondSemesterData[subject]?.Sanklik?.Total || 0,
};

// Calculate total marks and grade for the second semester
const totalSecondSemester = secondSemesterAkarikFields.Total + secondSemesterSankalikFields.Total;
const gradeSecondSemester = calculateGrade(totalSecondSemester);

// Store the results with totals and grades for both semesters
resultsWithTotal[subject] = {
  akarikFields,
  sankalikFields,
  total,
  grade,
secondSemester: secondSemesterData[subject] && {
    Akarik: secondSemesterAkarikFields,
    Sanklik: secondSemesterSankalikFields,
    total: totalSecondSemester,
    grade: gradeSecondSemester,
  },
};
});
     
  
// Fetch nondi data and subjects for both semesters
const nondiFirstSemesterResponse = await fetch(
  `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/First Semester/nondi.json`
);

const nondiSecondSemesterResponse = await fetch(
  `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/${selectedExamName}/nondi.json`
);

const subjectsFirstSemesterResponse = await fetch(
  `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/First Semester.json`
);

const subjectsSecondSemesterResponse = await fetch(
  `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/${selectedExamName}.json`
);

if (!nondiFirstSemesterResponse.ok || !nondiSecondSemesterResponse.ok || !subjectsFirstSemesterResponse.ok || !subjectsSecondSemesterResponse.ok) {
  throw new Error("Failed to fetch data");
}

const nondiFirstSemesterData = await nondiFirstSemesterResponse.json();
const nondiSecondSemesterData = await nondiSecondSemesterResponse.json();
const subjectsFirstSemesterData = await subjectsFirstSemesterResponse.json();
const subjectsSecondSemesterData = await subjectsSecondSemesterResponse.json();

// Set state with both semester data
setSelectedStudentResults({
  studentName: student.stdName + " " + student.stdFather+ " " +student.stdSurname,
  results: resultsWithTotal,
  nondi: {
    firstSemester: nondiFirstSemesterData || {},
    secondSemester: nondiSecondSemesterData || {}
  },
  subjects: {
    firstSemester: subjectsFirstSemesterData || {},
    secondSemester: subjectsSecondSemesterData || {}
  },
  stdMother: student.stdMother,
  stdFather: student.stdFather,
  stdSurname: student.stdSurname,
  dob: student.dob,
  division: student.division,
  motherTounge: student.motherTounge,
  studentId: student.studentId,
  gender: student.gender,
});
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching student results:", error);
    }
  };
  

  const calculateGrade = (total) => {
    if (total >= 91) return 'A1';
    if (total >= 81) return 'A2';
    if (total >= 71) return 'B1';
    if (total >= 61) return 'B2';
    if (total >= 51) return 'C1';
    if (total >= 41) return 'C2';
    if (total >= 33) return 'D1';
    if (total >= 21) return 'D2';
    return 'Fail';
  };
 

  
  const handleCloseModal = () => setShowModal(false);
  const fetchNondiData = async (srNo, semester) => {
    try {
      // Construct URLs for Firebase GET requests
      const firstSemesterUrl = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/First Semester.json`;
      const secondSemesterUrl = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/${selectedExamName}.json`;
  
      // Fetch data from Firebase
      const response = await fetch(semester === "firstSemester" ? firstSemesterUrl : secondSemesterUrl);
      const data = await response.json();
  
      // If data is present, update the state with the fetched subNondi data
      if (data) {
        const fetchedNondiData = Object.keys(data).reduce((acc, subject) => {
          if (data[subject].subNondi) {
            acc[subject] = data[subject].subNondi;
          }
          return acc;
        }, {});
  
        setSubjectNondi(prevState => ({
          ...prevState,
          [semester]: fetchedNondiData
        }));
      }
    } catch (error) {
      console.error("Error fetching nondi data:", error);
    }
  };
  
  useEffect(() => {
    if (selectedStudentForSr && selectedStudentForSr.srNo) {
      fetchNondiData(selectedStudentForSr.srNo, "firstSemester");
      fetchNondiData(selectedStudentForSr.srNo, "secondSemester");
    }
  }, [selectedStudentForSr, academicYear, selectedExamName]);
  
  const saveNondiData = async (srNo, semester) => {
    try {
      // Construct URLs for Firebase PATCH requests
      const firstSemesterUrl = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/First Semester.json`;
      const secondSemesterUrl = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData/${srNo}/result/${academicYear}/${selectedExamName}.json`;
      const semesterUrl = semester === "firstSemester" ? firstSemesterUrl : secondSemesterUrl;
  
      // Fetch the current data from Firebase
      const response = await fetch(semesterUrl);
      const currentData = await response.json();
  
      // Merge the existing data with the new subNondi data
      const dataToSend = Object.keys(subjectNondi[semester]).reduce((acc, subject) => {
        acc[subject] = {
          ...currentData?.[subject], // Merge with existing data
          subNondi: subjectNondi[semester][subject]
        };
        return acc;
      }, {});
  
      // Patch the merged data back to Firebase
      await fetch(semesterUrl, {
        method: 'PATCH',
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
    } catch (error) {
      console.error("Error saving nondi data:", error);
    }
  };
  
  
  const [subjectNondi, setSubjectNondi] = useState({
    firstSemester: {},
    secondSemester: {}
  });
  
  const handleNondiChange = async (event, subject, semester) => {
    const newNondi = event.target.value;
    // Update local state
    setSubjectNondi(prevState => ({
      ...prevState,
      [semester]: {
        ...prevState[semester],
        [subject]: newNondi
      }
    }));
  
    // Save data to Firebase immediately
    try {
      const srNo = selectedStudentForSr.srNo;
      await saveNondiData(srNo, semester);
    } catch (error) {
      console.error("Error saving nondi data:", error);
    }
  };
  
  const handlePrint = () => {
    const printContent = document.querySelector('.modal-body'); // Select the modal body content

    if (printContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Student Report</title>
            <style>
               @page {
                size: A4 Landscape; /* auto is the initial value */
              margin: 3mm; /* this affects the margin in the printer settings */
            }
              body {
                font-family: 'Poppins', sans-serif;
                margin: 0;
                padding: 0;
                color: black;
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

             
  
              /* Added custom styles for student info grid */
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
  
              .gradable {
                position: absolute;
                bottom: 0;
                left: 0px;
                width: 100%;
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
                
             .right {
  position: relative; /* add this */
  width: 48%;
}
  
.grad{
  position: absolute; /* add this */
  bottom: 0; /* add this */
  left: 20px; /* add this */
  width: 100%; /* add this */
}

.semtwograd{
  position: absolute; /* add this */
  bottom: 5px; /* add this */
  left: 5px; /* add this */
  width: 98%; /* add this */
}
    .right {
  width: 48% ! important;
  border: 2px solid #0e0101;
  padding: 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
  table2 {
  width: 40%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #130606;
  padding: 5px;
  text-align: left;
}
.grade-table {
  margin-top: 20px;
}
table {
  table-layout: fixed; /* Ensures columns do not expand beyond the table width */
  width: 100%; /* Ensures the table occupies 100% of the container width */
}

/* Ensure content within cells wraps to avoid expanding the cell's width */
th, td {
   padding: 0px; /* Reduce padding to make cells smaller */
  word-wrap: break-word;
  box-sizing: border-box;
}
/* Specific adjustments for the attendance table */
.attendance-table th, .attendance-table td {
  width: 33%; /* Ensures even distribution of columns across the table width */
}
/* Ensure the right container does not overflow */
.right {
  overflow: hidden; /* Clipping any content that exceeds the container bounds */
}

/* Styling for the table */
.styled-table {
  font-size: 0.8em;
  border-collapse: collapse;
  width: 100%;
}

.styled-table th, .styled-table td {
  font-weight: normal;
  font-size: 0.8em;
  padding: 2px 4px;
  border: 1px solid #130606;
  text-align: left;
}

/* Specific widths for columns */
.styled-table th {
  width: 30px;
}

/* Ensures columns do not expand beyond the table width */
.styled-table {
  table-layout: fixed;
}

/* Specific styles for rotated headings */
.rotate-90 {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

/* Reduce padding for smaller cells */
.styled-table th, .styled-table td {
  padding: 2px 4px;
  word-wrap: break-word;
  box-sizing: border-box;
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
      console.error('Print content not found');
    }
  };


  return (
    <div>
<AlertMessage message={alertMessage} show={showAlert}/>
      <div className=' main-content-of-page'>
      <h3 style={{color:'rgb(3, 54, 94)'}} className="title">  {language === "English" ? "Daily register" : "दैंनंदिन नोंदवही"}</h3>
        <table className="table table-striped table-bordered">
          <tbody>
            <tr>
            <th>{language === "English" ? "Academic Year" : "शैक्षणिक वर्ष"}</th>              <td>
                <select id="academicYear" value={academicYear} onChange={handleAcademicYearChange} className="form-control custom-select"
                >
                  <option >{language === "English" ? "Select Year " : "वर्ष निवडा"}</option>
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </td>
            </tr>
            <tr>
            <th>{language === "English" ? "Class " : "वर्ग"}</th>
            <td>
                <select id="class" value={classValue} onChange={handleClassChange} className="form-control custom-select" defaultValue={examNames[0]}
                >
                                    <option value="">{language === "English" ? "Select Class " : "वर्ग निवडा"}</option>
                                    {classes.map((cls, index) => (
                    <option key={index} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
            <th>{language === "English" ? "Exam Name " : "परीक्षेचे नाव"}</th> 
            <td>
                <select id="examName" value={selectedExamName} onChange={handleExamNameChange} className="form-control custom-select" defaultValue={examNames[0]}
                >
                                    <option value="">{language === "English" ? "Select Exam " : "परीक्षा निवडा"}</option>
                                    {examNames.map((examName, index) => (
                    <option key={index} value={examName}>
                                        {language === "English" ? examName : examNameTranslations[examName]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
       
        {selectedStudents.length > 0 && (
          <div className="mt-4">
            <table className="table table-striped table-bordered custom-table">
              <thead>
                <tr>
                  <th className="custom-width">Roll No</th>
                  <th>Student Name</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>


              {[...selectedStudents]
  .sort((a, b) => a.rollNo - b.rollNo)
  .map((student) => (

                  <tr key={student.srNo}>
                    <td>{student.rollNo}</td>
                    <td>{student.stdName} {student.stdFather} {student.stdSurname}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => viewResult(student.srNo)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}


                
              </tbody>
            </table>
          </div>
        )}
        <Modal show={showModal} onHide={handleCloseModal} dialogClassName='modal-80w'>
          <Modal.Header closeButton>
            <Modal.Title>Nondi Book</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <div>
              {/* Second semester modal content */}
              <div className="container" >
                <div className="left" style={{ width: '49.5%' }}>
                <div style={{marginTop: '-15px'}}>
                    <label htmlFor="student-name">{language === "English" ? " Student Name:" : "विध्यर्थीचे नाव :"}</label>
                    <span>{selectedStudentResults?.studentName || 'N/A'} {selectedStudentResults?.stdFather || 'N/A'} {selectedStudentResults?.stdSurname || 'N/A'}</span>
                  </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial, sans-serif" , marginTop: '5px'}}>
                
  <thead>
    <tr style={{ color: "black", textAlign: "center" }}>
      <th style={{ padding: "2px", border: "1px solid #ddd", fontSize: "16px" }}>{language === "English" ? " First semester" : "प्रथम सत्र"}</th>
      <th style={{ padding: "2px", border: "1px solid #ddd", fontSize: "16px" }}>{language === "English" ? " Second semester" : "द्वितीय सत्र"}</th>
    </tr>
  </thead>
  </table>

  <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
  {/* First Semester */}
  <div style={{ flex: 1 }}>
 
 
 
  {Object.keys(selectedStudentResults?.subjects?.firstSemester || {})
  .filter(subject => subject !== "nondi")
  .map(subject => (
    <div key={subject} style={{ marginBottom: "1px", textAlign: "left" }}>
        <strong>{subject}</strong>
        <textarea
          value={subjectNondi.firstSemester[subject] || ""}
          onChange={(e) => handleNondiChange(e, subject, "firstSemester")}
          placeholder="Enter subject nondi"
          style={{
            width: "100%",
            padding: "5px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
            resize: "none",
            fontSize: "13px",
            height: "65px"
          }}
        />
      </div>
    ))}



  </div>

  {/* Second Semester */}
  <div style={{ flex: 1 }}>
  {Object.keys(selectedStudentResults?.subjects?.secondSemester || {})
  .filter(subject => subject !== "nondi")
  .map(subject => (
    <div key={subject} style={{ marginBottom: "25px", marginTop: "24px" }}>
        {/* <strong>{subject}</strong> */}
        <textarea
          value={subjectNondi.secondSemester[subject] || ""}
          onChange={(e) => handleNondiChange(e, subject, "secondSemester")}
          placeholder="Enter subject nondi"
          style={{
            width: "100%",
            padding: "5px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
            resize: "none",
            fontSize: "13px",
            height: "65px"
          }}
        />
      </div>
    ))}


    
  </div>
</div>
                </div>


                <div className="right" style={{ width: '49.5%' }}>
                  <div className="school-info">
                    {schoolLogo && (
                      <div>
                        <img  src={schoolLogo}  alt={`$Logo`} style={{width: '70px' , height: '70px'}}/>
                      </div>
                    )}
                    <h2>{schoolName}</h2>
                  </div>
<div style={{ marginTop: '-15px'}}>
                  <div >
                    <label htmlFor="student-name">{language === "English" ? " Student Name:" : "विध्यर्थीचे नाव :"}</label>
                    <span>{selectedStudentResults?.studentName || 'N/A'} {selectedStudentResults?.stdFather || 'N/A'} {selectedStudentResults?.stdSurname || 'N/A'}</span>
                  </div>
                  <div>
                    <label htmlFor="class">{language === "English" ? " Class :" : "वर्ग :"}</label>
                    <span>{classValue || 'N/A'}</span>
                  </div>
                  <div>    
                    <label htmlFor="roll-no"> {language === "English" ? " Roll No :" : "वर्ग :"}</label>
                    <span>{selectedStudentResults?.studentName || 'N/A'}</span>
                  </div>
</div>
                  <h5> {language === "English" ? " First semester" : "प्रथम सत्र"}</h5>
                  {selectedStudentResults?.results ? (
                    
   <table className="nonditable mt-1" style={{ fontSize: '0.8em', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ fontWeight: 'normal', fontSize: '1em', padding: '2px 4px' }}>Subject</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Activity" : "उपक्रम/कृती"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Daily Monitoring" : "दैनंदिन निरीक्षण"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Demonstration" : "प्रात्यक्षिके"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Homework" : "गृहपाठ"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Oral Work" : "तोंडी काम"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Others" : "इतर"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Project" : "प्रकल्प"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Test" : "चाचणी"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Demonstration" : "प्रात्यक्षिके"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Orally" : "तोंडी"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Writing" : "लेखन"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? "Grade " : "गराडे"}</th>
      </tr>
    </thead>
    <tbody>



    {subjectSequence.map((subject) => {
  const subjectData = Object.entries(selectedStudentResults.results).find(([key]) => key === subject);
  if (!subjectData) return null; // Skip if the subject is not in results
  const [subjectKey, { akarikFields, sankalikFields, grade }] = subjectData;
  return (
    <tr key={subjectKey}>
      <td style={{ padding: '2px 4px' }}>{subjectKey}</td>
      <td style={{ padding: '2px 4px' }}>{akarikFields.Activity}</td>
      <td style={{ padding: '2px 4px' }}>{akarikFields.DailyMonitoring}</td>
      <td style={{ padding: '2px 4px' }}>{akarikFields.Demonstration}</td>
      <td style={{ padding: '2px 4px' }}>{akarikFields.Homework}</td>
      <td style={{ padding: '2px 4px' }}>{akarikFields.OralWork}</td>
      <td style={{ padding: '2px 4px' }}>{akarikFields.Others}</td>
      <td style={{ padding: '2px 4px' }}>{akarikFields.Project}</td>
      <td style={{ padding: '2px 4px' }}>{akarikFields.Test}</td>
      <td style={{ padding: '2px 4px' }}>{sankalikFields.Demonstration}</td>
      <td style={{ padding: '2px 4px' }}>{sankalikFields.Orally}</td>
      <td style={{ padding: '2px 4px' }}>{sankalikFields.Writing}</td>
      <td style={{ padding: '2px 4px' }}>{grade}</td>
    </tr>
  );
})}




    </tbody>
  </table>
) : (
  <p>No results available.</p>
)}
{language === "English" ? " Second semester" : "द्वितीय सत्र"}
    {selectedStudentResults?.results ? (
  <table className="nonditable mt-1" style={{ fontSize: '0.8em', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ fontWeight: 'normal', fontSize: '1em', padding: '2px 4px' }}>Subject</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Activity" : "उपक्रम/कृती"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90"> {language === "English" ? " Daily Monitoring" : "दैनंदिन निरीक्षण"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Demonstration" : "प्रात्यक्षिके"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Homework" : "गृहपाठ"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Oral Work" : "तोंडी काम"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Others" : "इतर"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Project" : "प्रकल्प"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Test" : "चाचणी"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Demonstration" : "प्रात्यक्षिके"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Orally" : "तोंडी"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? " Writing" : "लेखन"}</th>
        <th style={{ fontWeight: 'normal', fontSize: '0.8em', padding: '2px 4px', width: '30px' }} className="rotate-90">{language === "English" ? "Grade " : "गराडे"}</th>
      </tr>
    </thead>
    <tbody>



  {subjectSequence.map((subject) => {
  const subjectData = Object.entries(selectedStudentResults.results).find(([key]) => key === subject);
  if (!subjectData) return null; // Skip if the subject is not in results
  const [subjectKey, { secondSemester }] = subjectData;

  if (!secondSemester) {
    setAlertMessage(`No data available for ${subject} in the second semester.`);
    return null;
  }

  const { Akarik = {}, Sanklik = {}, grade } = secondSemester;

  return (
    <tr key={subjectKey}>
      <td style={{ padding: '2px 4px' }}>{subjectKey}</td>
      <td style={{ padding: '2px 4px' }}>{Akarik.Activity || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Akarik?.['Daily Monitoring'] || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Akarik.Demonstration || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Akarik.Homework || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Akarik?.['Oral Work'] || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Akarik.Others || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Akarik.Project || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Akarik.Test || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Sanklik.Demonstration || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Sanklik.Orally || 0}</td>
      <td style={{ padding: '2px 4px' }}>{Sanklik.Writing || 0}</td>
      <td style={{ padding: '2px 4px' }}>{grade}</td>
    </tr>
  );
})}

    </tbody>
  </table>
) : (
  <p>No results available for the second semester.</p>
)}
                </div>
              </div>
              <br />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              Print
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
};

export default DailyRegister;


