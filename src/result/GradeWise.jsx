import React, { useState, useEffect, Fragment  } from "react";
import "../result/result.css";
// import Sidebar from "../../components/Sidebar";

function GradeWise({ initialClass, initialYear }) {
    const [academicYear, setAcademicYear] = useState(initialYear || localStorage.getItem("cce_academic_year") || "");
    const [classValue, setClassValue] = useState(initialClass || localStorage.getItem("cce_selected_class") || "");

    useEffect(() => {
        const targetClass = initialClass || localStorage.getItem("cce_selected_class");
        if (targetClass) {
            setClassValue(targetClass);
            fetchSubjectsForClass(targetClass);
            const filtered = studentData.filter((student) => student.currentClass === targetClass);
            setSelectedStudents(filtered);
        }
    }, [initialClass, studentData]);

    useEffect(() => {
        const targetYear = initialYear || localStorage.getItem("cce_academic_year");
        if (targetYear) {
            setAcademicYear(targetYear);
        }
    }, [initialYear]);
    const [subject, setSubject] = useState("");
    const [selectedExamName, setSelectedExamName] = useState("");
    const [studentData, setStudentData] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [marksData, setMarksData] = useState({});
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState({});
         const [division, setDivision] = useState("");
              const [divisions, setDivisions] = useState(["A", "B", "C", "D"]);
    const examNames = ["First Semester", "Second Semester"];
    const examNameTranslations = {
        "First Semester": "प्रथम सत्र",
        "Second Semester": "द्वितीय सत्र",
      };
    const udiseNumber = localStorage.getItem("udiseNumber");
  
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');

    useEffect(() => {
      const storedLanguage = localStorage.getItem('language') || 'English';
      setLanguage(storedLanguage);
    }, []);

    useEffect(() => {
        if (udiseNumber) {
            fetchStudentData();
        }
    }, [udiseNumber]);

    // useEffect(() => {
    //     if (selectedExamName && classValue && academicYear) {
    //         fetchMarksForSelectedSubject();
    //     }
    // }, [subject, selectedExamName, classValue, academicYear]);

    const handleAcademicYearChange = (e) => setAcademicYear(e.target.value);
    // const handleClassChange = (e) => {
    //     setClassValue(e.target.value);
    //     fetchSubjectsForClass(e.target.value);
    // };
    const handleSubjectChange = (e) => setSubject(e.target.value);
    const handleExamNameChange = (e) => setSelectedExamName(e.target.value);

    useEffect(() => {
      if (subject && selectedExamName && classValue && academicYear) {
        // Filter students by both class and division
        const filteredStudents = studentData.filter(
          (student) => 
            student.currentClass === classValue && 
            (division ? student.division === division : true)
        );
        setSelectedStudents(filteredStudents);

        // Only proceed with fetching marks if there are students
        if (filteredStudents.length > 0) {
          // Create a separate async function to fetch marks
          const fetchMarks = async () => {
            // Fetch marks for all subjects
            const marksDataPromises = filteredStudents.map((student) =>
              Object.keys(subjects).map((subject) =>
                fetchMarksData(student.srNo, academicYear, selectedExamName, subject)
              )
            );

            // Flatten the array of promises
            const flattenedPromises = marksDataPromises.flat();

            // Wait for all fetches to complete
            const marksDataArray = await Promise.all(flattenedPromises);

            // Map the results back to the student SR numbers and subjects
            const marksData = {};
            filteredStudents.forEach((student, index) => {
              Object.keys(subjects).forEach((subject, subjectIndex) => {
                const marks = marksDataArray[index * Object.keys(subjects).length + subjectIndex];
                if (!marksData[student.srNo]) {
                  marksData[student.srNo] = {};
                }
                marksData[student.srNo][subject] = marks;
              });
            });

            setMarksData(marksData);
          };

          fetchMarks();
        } else {
          // Reset marks data if no students found
          setMarksData({});
        }
      }
    }, [subject, selectedExamName, classValue, academicYear, division, studentData]);
   

  // IndexedDB constants
  const DB_NAME = 'SchoolManagementDB';
  const STUDENT_STORE = 'studentData';
  const DB_VERSION = 1;


const SCHOOL_STORE = 'schoolData'; // Add this with your other constants

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db) {
        console.error("Error: db object is not initialized");
        reject("Error: db object is not initialized");
      } else {
        resolve(db);
      }
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STUDENT_STORE)) {
        db.createObjectStore(STUDENT_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(SCHOOL_STORE)) {
        db.createObjectStore(SCHOOL_STORE, { keyPath: "udiseNumber" });
      }
    };
  });
};


  const sortClasses = (classesList, lang) => {
    const classOrder = {
      "Class I": 1,
      "Class II": 2,
      "Class III": 3,
      "Class IV": 4,
      "Class V": 5,
      "Class VI": 6,
      "Class VII": 7,
      "Class VIII": 8,
      "Class IX": 9,
      "Class X": 10,
      "Class XI": 11,
      "Class XII": 12,

      "1st": 1,
      "2nd": 2,
      "3rd": 3,
      "4th": 4,
      "5th": 5,
      "6th": 6,
      "7th": 7,
      "8th": 8,
      "9th": 9,
      "10th": 10,
      "11th": 11,
      "12th": 12,

      "इयत्ता पहिली": 1,
      "इयत्ता दुसरी": 2,
      "इयत्ता तिसरी": 3,
      "इयत्ता चौथी": 4,
      "इयत्ता पाचवी": 5,
      "इयत्ता सहावी": 6,
      "इयत्ता सातवी": 7,
      "इयत्ता आठवी": 8,
      "इयत्ता नववी": 9,
      "इयत्ता दहावी": 10,
      "इयत्ता अकरावी": 11,
      "इयत्ता बारावी": 12,

      "पहिली": 1,
      "दुसरी": 2,
      "तिसरी": 3,
      "चौथी": 4,
      "पाचवी": 5,
      "सहावी": 6,
      "सातवी": 7,
      "आठवी": 8,
      "नववी": 9,
      "दहावी": 10,
      "अकरावी": 11,
      "बारावी": 12,
    };

    return [...classesList].sort((a, b) => (classOrder[a] || 99) - (classOrder[b] || 99));
  };

  // Function to fetch student data from Firebase + IndexedDB
  const fetchStudentData = async () => {
    try {
      let fetchedStudents = [];

      // 1. Try to fetch from Firebase
      try {
        const response = await fetch(
          `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData.json`
        );
        if (response.ok) {
          const data = await response.json();
          if (data) {
            fetchedStudents = Object.keys(data)
              .filter(key => data[key] !== null)
              .map(key => ({ srNo: key, ...data[key] }));
          }
        }
      } catch (firebaseError) {
        console.warn('Firebase fetch student data failed, checking IndexedDB:', firebaseError);
      }

      // 2. Try to fetch from IndexedDB if Firebase was empty
      if (fetchedStudents.length === 0) {
        try {
          const db = await openDB();
          if (db) {
            const transaction = db.transaction(STUDENT_STORE, "readonly");
            const store = transaction.objectStore(STUDENT_STORE);
            const request = store.getAll();

            const idbStudents = await new Promise((resolve, reject) => {
              request.onsuccess = (event) => resolve(event.target.result || []);
              request.onerror = (event) => reject(event.target.error);
            });

            if (idbStudents && idbStudents.length > 0) {
              fetchedStudents = idbStudents.map((student) => {
                const keyParts = student.id ? student.id.split("-") : [];
                const className = keyParts[0] || "";
                const division = keyParts[1] || "";
                const srNo = keyParts[keyParts.length - 1] || "";
                return {
                  ...student,
                  currentClass: student.currentClass || className,
                  division: student.division || division,
                  srNo: student.srNo || srNo
                };
              });
            }
          }
        } catch (idbError) {
          console.warn('IndexedDB fetch student data failed:', idbError);
        }
      }

      // Process and set state
      const activeStudents = fetchedStudents.filter(student => student.isActive !== false);

      const classesAndDivisions = {};
      activeStudents.forEach((student) => {
        if (student && student.currentClass) {
          if (!classesAndDivisions[student.currentClass]) {
            classesAndDivisions[student.currentClass] = {};
          }
          const division = student.division || "";
          if (!classesAndDivisions[student.currentClass][division]) {
            classesAndDivisions[student.currentClass][division] = [];
          }
          classesAndDivisions[student.currentClass][division].push(student.id || student.srNo);
        }
      });

      const updatedStudents = activeStudents.map((student) => {
        const keyParts = student.id ? student.id.split("-") : [];
        const className = keyParts[0] || student.currentClass || "";
        const division = keyParts[1] || student.division || "";
        const srNo = keyParts[keyParts.length - 1] || student.srNo || "";
        return { 
          ...student, 
          className: student.currentClass || className, 
          division: student.division || division, 
          srNo: student.srNo || srNo 
        };
      });

      const classList = Object.keys(classesAndDivisions);
      setClasses(classList);
      setStudentData(updatedStudents); // Store updated students 
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const fetchDivisionsForClass = async (classValue) => {
    try {
      const divisionsForClass = new Set();
      studentData.forEach((student) => {
        if (student.currentClass === classValue && student.division) {
          divisionsForClass.add(student.division);
        }
      });

      if (divisionsForClass.size === 0) {
        try {
          const db = await openDB();
          if (db) {
            const transaction = db.transaction(STUDENT_STORE, "readonly");
            const store = transaction.objectStore(STUDENT_STORE);
            const request = store.getAll();

            await new Promise((resolve) => {
              request.onsuccess = (event) => {
                const students = event.target.result || [];
                students.forEach((student) => {
                  if (student.currentClass === classValue && student.division) {
                    divisionsForClass.add(student.division);
                  }
                });
                resolve();
              };
              request.onerror = () => resolve();
            });
          }
        } catch (err) {
          console.warn("Could not read divisions from IndexedDB:", err);
        }
      }

      if (divisionsForClass.size === 0) {
        setDivisions(["A", "B", "C", "D"]);
      } else {
        setDivisions(Array.from(divisionsForClass)); // Update divisions state
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };
  const handleClassChange = async (e) => {
    const selectedClass = e.target.value;
    setClassValue(selectedClass); // Update the class value
    setDivision(""); // Reset division when class changes
    fetchSubjectsForClass(e.target.value);
  
    if (selectedClass) {
      await fetchDivisionsForClass(selectedClass);
    }
  
    // Filter students based on the selected class
    const filteredStudents = studentData.filter((student) => student.currentClass === selectedClass);
    setSelectedStudents(filteredStudents);
  };

  const handleDivisionChange = (e) => {
    const selectedDivision = e.target.value;
    setDivision(selectedDivision); // Update division state
  
    let filteredStudents;
  
    if (selectedDivision === "") {
      // Show all students from the selected class if "All Student" is chosen
      filteredStudents = studentData.filter((student) => student.currentClass === classValue);
    } else {
      // Filter by class and division
      filteredStudents = studentData.filter(
        (student) => student.currentClass === classValue && student.division === selectedDivision
      );
    }
  
    setSelectedStudents(filteredStudents);
  };
  


useEffect(() => {
    const fetchDefaultSettings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/defaultSettings.json`);
        if (response.ok) {
          const data = await response.json();
          
          if (data && !initialYear && !localStorage.getItem("cce_academic_year")) {
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

  const fetchSubjectsForClass = async (classValue) => {
    try {
      if (!academicYear) {
        console.error("Academic year is not set");
        return;
      }

      // Construct the new URL for fetching subjects
      const url = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/${academicYear}/${classValue}.json`;

      // Fetch subjects directly from the `subjectSequence` node
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch subjects for class ${classValue}`);
      }

      const subjectsData = await response.json();
      if (subjectsData) {
        // Filter out null values and convert to array of valid subjects
        const validSubjects = Object.entries(subjectsData)
          .filter(([_, value]) => value !== null && value !== undefined)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([_, subject]) => subject);

        // Convert array to object with sequential numbering
        const formattedSubjects = validSubjects.reduce((acc, subject) => {
          acc[subject] = true;
          return acc;
        }, {});

        setSubjects(formattedSubjects); // Update state with the formatted subjects
        setSubject(Object.keys(formattedSubjects)[0] || ""); // Set the first subject as selected
      } else {
        console.warn("No subjects found for the specified class and academic year");
        setSubjects({});
      }
    } catch (error) {
      console.error(
        `Error fetching subjects for class ${classValue} and academic year ${academicYear}:`,
        error
      );
    }
  };

     const fetchMarksData = async (srNo, academicYear, examName, subject) => {
              try {
                const db = await openDB();
                const transaction = db.transaction(STUDENT_STORE, "readonly");
                const store = transaction.objectStore(STUDENT_STORE);
                const request = store.get(`${classValue}-${division}-${srNo}`);
                return new Promise((resolve) => {
                  request.onsuccess = (event) => {
                    const studentData = event.target.result;
                    if (
                      studentData &&
                      studentData.result &&
                      studentData.result[academicYear] &&
                      studentData.result[academicYear][examName] &&
                      studentData.result[academicYear][examName][subject]
                    ) {
                      const marks = studentData.result[academicYear][examName][subject];
                      resolve(marks);
                    } else {
                      resolve({});
                    }
                  };
                  request.onerror = () => {
                    console.error("Error fetching marks data:");
                    resolve({});
                  };
                });
              } catch (error) {
                console.error("Error fetching marks data:", error);
                return {};
              }
            };
            const fetchMarksForAllSubjects = async () => {
             try {
               const selectedStudents = studentData.filter(
                 (student) => student.currentClass === classValue
               );
               setSelectedStudents(selectedStudents);
           
               // Fetch marks for all subjects
               const marksDataPromises = selectedStudents.map((student) =>
                 Object.keys(subjects).map((subject) =>
                   fetchMarksData(student.srNo, academicYear, selectedExamName, subject)
                 )
               );
           
               // Flatten the array of promises
               const flattenedPromises = marksDataPromises.flat();
           
               // Wait for all fetches to complete
               const marksDataArray = await Promise.all(flattenedPromises);
           
               // Map the results back to the student SR numbers and subjects
               const marksData = {};
               selectedStudents.forEach((student, index) => {
                 Object.keys(subjects).forEach((subject, subjectIndex) => {
                   const marks = marksDataArray[index * Object.keys(subjects).length + subjectIndex];
                   if (!marksData[student.srNo]) {
                     marksData[student.srNo] = {};
                   }
                   marksData[student.srNo][subject] = marks;
                 });
               });
           
               setMarksData(marksData);
             } catch (error) {
               console.error("Error fetching marks data:", error);
             }
           };
            useEffect(() => {
              if (subject && selectedExamName && classValue && academicYear) {
               fetchMarksForAllSubjects();
              }
            }, [subject, selectedExamName, classValue, academicYear]);
          

    const getGrade = (total) => {
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

  

    const countGrades = (grade, subject) => {
        let count = 0;
        selectedStudents.forEach(student => {
            const total = (marksData[student.srNo]?.[subject]?.Akarik?.Total ?? 0) + (marksData[student.srNo]?.[subject]?.Sanklik?.Total ?? 0);
            if (getGrade(total) === grade) {
                count++;
            }
        });
        return count;
    };
    


    const [schoolData, setSchoolData] = useState(null); 
   const fetchSchoolData = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(SCHOOL_STORE, "readonly");
    const store = transaction.objectStore(SCHOOL_STORE);
    const udise = localStorage.getItem("udiseNumber");
    const request = store.get(udise);

    return new Promise((resolve) => {
      request.onsuccess = (event) => {
        const data = event.target.result;
        if (data) {
          console.log("School data from IndexedDB:", data);
          setSchoolData(data);
          resolve(data);
        } else {
          console.log("No school data found in IndexedDB, fetching from Firebase");
        }
      };

      request.onerror = (event) => {
        console.error("Error fetching school data from IndexedDB:", event.target.error);
      };
    });
  } catch (error) {
    console.error("Error accessing IndexedDB:", error);
  }
};

          useEffect(() => {
            fetchSchoolData(); 
          }, []); 


    const handlePrint = () => {
      const tableElement = document.getElementById("printableTable");
      if (tableElement) {
        const tableContent = tableElement.outerHTML;
    
        const schoolName = schoolData?.schoolName || " ";
        const schoolLogo = schoolData?.schoolLogo || " "; // Placeholder if no logo is available
    
        const printWindow = window.open("", "", "height=600,width=800");
        printWindow.document.write("<html><head><title>Print</title>");
    
        // Include your styles here
        printWindow.document.write(`
          <style>
           @page {
              size: A4 Landscape; /* auto is the initial value */
            margin: 3mm; /* this affects the margin in the printer settings */
          }
              table {
                  width: 100%;
                  border-collapse: collapse;
              }
              th, td {
                  border: 1px solid #ccc;
                  padding: 5px;
                  text-align: left;
                  width: calc(100% / 7); /* Adjust width to fit the number of columns */
              }
              thead th {
                  background-color: #f4f4f4;
                  font-weight: normal; /* Removes bold styling */
              }
              tbody td {
                  text-align: center;
                  font-weight: normal; /* Removes bold styling */
              }
              .grade-table table {
                  width: 100%;
                  border-collapse: collapse;
              }
              .grade-table th, .grade-table td {
                  border: 1px solid #ccc;
                  padding: 5px;
                  text-align: center;
                  width: calc(100% / 10); /* Adjust based on the number of columns */
              }
              .grade-table thead th {
                  background-color: #f4f4f4;
              }
              .grade-table tbody td {
                  text-align: center;
              }


              
                .school-header {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                margin-bottom: 20px;
                padding: 10px;
                border: 1px solid #ccc; /* Add border to the header */
              }
              .school-header img {
                max-height: 70px; /* Adjust as needed */
                margin-right: 15px; /* Spacing between logo and school name */
              }
              .school-header h1 {
                font-size: 24px; /* Increased font size for school name */
                margin: 0;
                text-align: left; /* Align text to the left */
                flex: 1; /* Take up remaining space */
                text-overflow: ellipsis; /* Add ellipsis if text overflows */
                white-space: nowrap; /* Prevent text from wrapping to next line */
              }
              .school-header h1.multi-line {
                text-align: center; /* Center text if it wraps to next line */
                white-space: normal; /* Allow text to wrap to next line */
              }
              .school-header-container {
                margin-bottom: 20px;
              }


          </style>
      `);
      printWindow.document.write("</head><body>");
        
      // Add school header with increased text size and logo to the left
      const img = printWindow.document.createElement("img");
      img.src = schoolLogo;
      img.alt = "School Logo";
  
      img.onload = function() {
        printWindow.document.write(`
          <div class="school-header-container">
            <div class="school-header">
              <img src="${schoolLogo}" alt="School Logo">
              <h1 class="${schoolName.length > 30 ? 'multi-line' : ''}">${schoolName}</h1>
                 <p>
                ${language === "English" ? 'Class':'वर्ग'} : ${classValue}, ${language==="English"?'Division': 'तुकडी'} : ${division || '-'}</p>
            </div>
          </div>
        `);
  
        // Add the table content
        printWindow.document.write(tableContent);
  
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
      };
  
      img.onerror = function() {
        // If the logo fails to load, proceed without the logo
        printWindow.document.write(`
          <div class="school-header-container">
            <div class="school-header">
              <h1 class="${schoolName.length > 30 ? 'multi-line' : ''}">${schoolName}</h1>
              <p>Class: ${classValue}</p>
            </div>
          </div>
        `);
  
        // Add the table content
        printWindow.document.write(tableContent);
  
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
      };
    } else {
      console.error("Table element with ID 'printableTable' not found.");
    }
  };


    return (
        <div>
            {/* <Sidebar /> */}
            <div className="p-3 main-content-of-page">
            <h2 style={{ color: '#0c2a52', textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }} className="title"> {language === "English" ? "Grade Wise" : "श्रेणी निहाय निकाल"}</h2>

                <table className="table table-striped table-bordered">
                    <tbody>
                        <tr>
                            <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{language === "English" ? "Academic Year" : "शैक्षणिक वर्ष"}</th>
                            <td>
                                <select
                                    id="academicYear"
                                    value={academicYear}
                                    onChange={handleAcademicYearChange}
                                    className="form-control custom-select"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                  <option >{language === "English" ? "Select Year " : "वर्ष निवडा"}</option>
                                    <option value="2020-2021">2020-2021</option>
                                    <option value="2021-2022">2021-2022</option>
                                    <option value="2023-2024">2023-2024</option>
                                    <option value="2024-2025">2024-2025</option>
                                    <option value="2025-2026">2025-2026</option>
                                    <option value="2026-2027">2026-2027</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{language === "English" ? "Class" : "वर्ग"}</th>
                            <td>
                                <select
                                    id="class"
                                    value={classValue}
                                    onChange={handleClassChange}
                                    className="form-control custom-select"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                <option value="">{language === "English" ? "Select Class" : "वर्ग निवडा"}</option>
                                    {(() => {
                                        const defaultClasses = language === "English" 
                                            ? ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"]
                                            : ["इयत्ता पहिली", "इयत्ता दुसरी", "इयत्ता तिसरी", "इयत्ता चौथी", "इयत्ता पाचवी", "इयत्ता सहावी", "इयत्ता सातवी", "इयत्ता आठवी", "इयत्ता नववी", "इयत्ता दहावी"];
                                        const classesToRender = classes.length > 0 ? classes : defaultClasses;
                                        return sortClasses(classesToRender.filter(cls => cls && cls.trim() !== ""), language).map((cls, index) => (
                                            <option key={index} value={cls}>
                                                {cls}
                                            </option>
                                        ));
                                    })()}
                                </select>
                            </td>
                        </tr>
                        <tr>
                  <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{language === "English" ? "Division" : "तुकडी"}</th>
                  <td>
                  <select
  value={division}
  onChange={handleDivisionChange}
  className="form-control custom-select"
  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
>
  <option value="">
    {language === "English" ? "All Student" : "सर्व विद्यार्थी"}
  </option>
  {divisions
    .filter((div) => div !== null && div !== undefined && div.trim() !== "")
    .map((div) => (
      <option key={div} value={div}>
        {div}
      </option>
    ))}
</select>
                  </td>
                </tr>
                        <tr>
                            <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{language === "English" ? "Exam Name" : "परीक्षेचे नाव"}</th>
                            <td>
                                <select
                                    id="examName"
                                    value={selectedExamName}
                                    onChange={handleExamNameChange}
                                    className="form-control custom-select"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                >
                                <option value="">{language === "English" ? "Select Exam" : "परीक्षा निवडा"}</option>
                                    {examNames.map((examName, index) => (
                                        <option key={index} value={examName}>
                                        {language === "English" ? examName : examNameTranslations[examName]}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2" style={{ textAlign: 'center', padding: '15px' }}>
                            <button onClick={handlePrint} className="btn btn-primary" style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '10px 25px', fontSize: '1rem', fontWeight: '500', borderRadius: '6px' }}>
                    {language === "English" ? "Print" : "Print करा"}
                </button>
                            </td>
                        </tr>
                      
                    </tbody>
                </table>  
              
                <br/>
                <table className="table table-striped table-bordered grdTable"  id="printableTable">
  <thead>
    <tr>
      <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}> {language === "English" ? "Grade" : "श्रेणी"}</th>
      {Object.keys(subjects).map((subject, index) => (
        <th key={index} style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{subject}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {['A1','A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'Fail'].map((grade, index) => (
      <tr key={index}>
        <td className="text-center">{grade}</td>
        {Object.keys(subjects).map((subject, subIndex) => (
          <td key={subIndex} className="text-center">
            {countGrades(grade, subject)}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
            </div>
            <style jsx>
              {
              `
                .grdTable td, .grdTable th{
                  width:auto;
                }
              `
              }
            </style>
        </div>
    );
}

export default GradeWise;
