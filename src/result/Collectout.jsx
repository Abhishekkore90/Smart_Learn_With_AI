import React, { useState, useEffect } from "react";
import "../result/result.css";
// import Sidebar from "../../components/Sidebar";

function Collectout() {
        const [academicYear, setAcademicYear] = useState("");
        const [classValue, setClassValue] = useState("");
        const [subject, setSubject] = useState("");
        const [selectedExamName, setSelectedExamName] = useState("");
        const [studentData, setStudentData] = useState([]);
        const [selectedStudents, setSelectedStudents] = useState([]);
        const [marksData, setMarksData] = useState({});
        const [classes, setClasses] = useState([]);
        const [subjects, setSubjects] = useState({});
        const examNames = ["First Semester", "Second Semester"];
         const [division, setDivision] = useState("");
          const [divisions, setDivisions] = useState(["A", "B", "C", "D"]);
        const examNameTranslations = {
            "First Semester": "प्रथम सत्र",
            "Second Semester": "द्वितीय सत्र",
          };
        const udiseNumber = localStorage.getItem("udiseNumber");
      
        const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');
//8+5?
        useEffect(() => {
          const storedLanguage = localStorage.getItem('language') || 'English';
          setLanguage(storedLanguage);
        }, []);

        useEffect(() => {
            if (udiseNumber) {
                fetchStudentData();
            }
        }, [udiseNumber]);
  
    
        
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

          
        const handleAcademicYearChange = (e) => setAcademicYear(e.target.value);
        // const handleClassChange = (e) => {
        //     setClassValue(e.target.value);
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

  // Function to fetch student data from IndexedDB
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
  
    // Filter students based on the selected class and division
    const filteredStudents = studentData.filter((student) => student.currentClass === classValue && student.division === selectedDivision);
    setSelectedStudents(filteredStudents);
  };

   
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
      
        
    
       
       
         // fetched the marks from the indexeddb 
       
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
            return 'Ab';
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
              const schoolLogo = schoolData?.schoolLogo || " ";
          
              const printWindow = window.open("", "", "height=600,width=800");
              printWindow.document.write("<html><head><title>Print</title>");
          
              // Include your styles here
              printWindow.document.write(`
                <style>
                  @page {
                    size: A4 Landscape;
                    margin: 3mm;
                  }
                  body {
                    font-family: Arial, sans-serif;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                  }
                  th, td {
                    border: 1px solid black !important;
                    padding: 2px;
                    text-align: center;
                  }
                  thead th {
                    background-color: #f4f4f4;
                    font-weight: bold;
                  }
                  .school-header {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    margin-bottom: 15px;
                    padding: 10px;
                    border-bottom: 2px solid #ccc;
                  }
                  .school-header img {
                    max-height: 70px;
                    margin-right: 15px;
                  }
                  .school-header h1 {
                    font-size: 24px;
                    margin: 0;
                    text-align: left;
                    flex: 1;
                  }
                  .school-header p {
                    margin: 0 0 0 15px;
                    font-size: 16px;
                  }
                  
                  /* Rotated headers for print */
                  .rotate-print-header {
                    height: 120px;
                    white-space: nowrap;
                    position: relative;
                    padding: 5px !important;
                    vertical-align: bottom;
                  }
                  .rotate-print-header div {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%) rotate(-90deg);
                    transform-origin: center center;
                    width: 100px;
                  }
                  .student-name-cell {
                    text-align: left !important;
                    min-width: 200px;
                    max-width: 200px;
                  }
                  .fixed-column {
                    position: sticky;
                    left: 0;
                    background-color: white !important;
                    z-index: 10;
                  }
                </style>
              `);
          
              printWindow.document.write("</head><body>");
          
              // Add school header with logo and name
              const img = printWindow.document.createElement("img");
              img.src = schoolLogo;
              img.alt = "School Logo";
          
              img.onload = function() {
                printHeader();
              };
          
              img.onerror = function() {
                printHeader(false);
              };
          
              function printHeader(includeLogo = true) {
                printWindow.document.write(`
                  <div class="school-header">
                    ${includeLogo ? `<img src="${schoolLogo}" alt="School Logo">` : ''}
                    <h1>${schoolName}</h1>
                    <p>Class: ${classValue} | ${selectedExamName}</p>
                  </div>
                `);
          
                // Process table content to add print-specific classes
                let processedTableContent = tableContent
                  .replace(/<th class="rotate-90"/g, '<th class="rotate-print-header"')
                  .replace(/<th class="rotate-90">(.*?)<\/th>/g, 
                          '<th class="rotate-print-header"><div>$1</div></th>')
                  .replace(/<td style="[^"]*text-align: left[^"]*"/g, 
                          '<td class="student-name-cell"')
                  .replace(/<th colspan="2"/g, '<th colspan="2" class="fixed-column"')
                  .replace(/<td[^>]*>(.*?<\/td>)/g, function(match, p1) {
                    // Add fixed-column class to first two cells in each row
                    return match.replace(/<td/, '<td class="fixed-column"');
                  });
          
                // Add the processed table content
                printWindow.document.write(processedTableContent);
          
                printWindow.document.write("</body></html>");
                printWindow.document.close();
                
                // Small delay to ensure all content is loaded before printing
                setTimeout(() => {
                  printWindow.print();
                }, 500);
              }
            } else {
              console.error("Table element with ID 'printableTable' not found.");
            }
          };


          return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
              {/* <Sidebar /> */}
              <div 
                className="p-3 main-content-of-page" 
                style={{ 
                  marginLeft: '0', // Adjust if sidebar is enabled
                  transition: 'all 0.3s',
                  padding: '20px',
                  maxWidth: '100%',
                  overflowX: 'auto'
                }}
              >
                <h3 
                  style={{
                    color: '#0c2a52',
                    marginBottom: '25px',
                    textAlign: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }} 
                  className="title"
                >
                  {language === "English" ? "Collect out" : "एकत्रित निकाल"}
                </h3>
                
                {/* Form Table */}
                <table 
                  className="table table-striped table-bordered"
                  style={{
                    width: '100%',
                    marginBottom: '25px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <tbody>
                    {[
                      {
                        label: language === "English" ? "Academic Year " : "शैक्षणिक वर्ष",
                        id: "academicYear",
                        value: academicYear,
                        onChange: handleAcademicYearChange,
                        options: [
                          { value: "", label: language === "English" ? "Select Year " : "वर्ष निवडा" },
                          { value: "2023-2024", label: "2023-2024" },
                          { value: "2024-2025", label: "2024-2025" },
                          { value: "2025-2026", label: "2025-2026" },
                          { value: "2026-2027", label: "2026-2027" }
                        ]
                      },
                      {
                        label: language === "English" ? "Class " : "वर्ग",
                        id: "class",
                        value: classValue,
                        onChange: handleClassChange,
                        options: [
                          { value: "", label: language === "English" ? "Select Class " : "वर्ग निवडा" },
                          ...(() => {
                            const defaultClasses = language === "English" 
                              ? ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"]
                              : ["इयत्ता पहिली", "इयत्ता दुसरी", "इयत्ता तिसरी", "इयत्ता चौथी", "इयत्ता पाचवी", "इयत्ता सहावी", "इयत्ता सातवी", "इयत्ता आठवी", "इयत्ता नववी", "इयत्ता दहावी"];
                            const classesToRender = classes.length > 0 ? classes : defaultClasses;
                            return classesToRender.map(cls => ({ value: cls, label: cls }));
                          })()
                        ]
                      },
                      {
                        label: language === "English" ? "Division" : "तुकडी",
                        value: division,
                        onChange: handleDivisionChange,
                        options: [
                          { value: "", label: language === "English" ? "Select Division" : "तुकडी निवडा" },
                          ...(() => {
                            const divisionsToRender = divisions.length > 0 ? divisions : ["A", "B", "C", "D"];
                            return divisionsToRender.map(div => ({ value: div, label: div }));
                          })()
                        ]
                      },
                      {
                        label: language === "English" ? "Exam Name " : "परीक्षेचे नाव",
                        id: "examName",
                        value: selectedExamName,
                        onChange: handleExamNameChange,
                        options: [
                          { value: "", label: language === "English" ? "Select Exam " : "परीक्षा निवडा" },
                          ...examNames.map(examName => ({ 
                            value: examName, 
                            label: language === "English" ? examName : examNameTranslations[examName] 
                          }))
                        ]
                      }
                    ].map((field, index) => (
                      <tr key={index}>
                        <th style={{ 
                          padding: '12px 15px',
                          backgroundColor: '#b5d3f2',
                          width: '30%',
                          verticalAlign: 'middle',
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          {field.label}
                        </th>
                        <td style={{ padding: '10px' }}>
                          <select
                            id={field.id}
                            value={field.value}
                            onChange={field.onChange}
                            className="form-control custom-select"
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '6px',
                              border: '1px solid #ced4da',
                              fontSize: '1rem',
                              transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                              backgroundColor: '#fff',
                              cursor: 'pointer',
                              appearance: 'none',
                              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.7rem center',
                              backgroundSize: '0.65rem auto'
                            }}
                          >
                            {field.options.map((option, i) => (
                              <option key={i} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: '15px' }}>
                        <button 
                          onClick={handlePrint} 
                          className="btn btn-primary"
                          style={{
                            backgroundColor: '#0d6efd',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 25px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            borderRadius: '6px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s',
                            minWidth: '150px'
                          }}
                        >
                          {language === "English" ? "Print " : "Print करा"}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                {/* Results Table */}
                <div style={{ 
                  width: '100%',
                  overflowX: 'auto',
                  boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  marginBottom: '30px',
                  backgroundColor: '#fff'
                }}>
                  <table 
                    className="table table-striped table-bordered" 
                    id="printableTable"
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      margin: '0',
                      fontSize: '0.95rem'
                    }}
                  >
                    <thead style={{ 
                      border: '3px solid gray',
                      backgroundColor: '#b5d3f2'
                    }}>
                      <tr>
                        <th style={{
                          padding: '8px',
                          textAlign: 'center',
                          position: 'sticky',
                          left: '0',
                          backgroundColor: '#b5d3f2',
                          zIndex: '10',
                          minWidth: '80px',
                          fontWeight: 'bold'
                        }}>
                          {language === "English" ? "Roll No " : "रजिस्टर नंबर"}
                        </th>
                        <th style={{
                          padding: '8px',
                          textAlign: 'left',
                          position: 'sticky',
                          left: '80px',
                          backgroundColor: '#b5d3f2',
                          zIndex: '10',
                          minWidth: '200px',
                          fontWeight: 'bold'
                        }}>
                          {language === "English" ? "Student Name " : "विद्यार्थ्याचे नाव"}
                        </th>
                        {Object.keys(subjects).map((subject, index) => (
                          <th 
                            key={index} 
                            colSpan="4" 
                            className="text-center"
                            style={{
                              padding: '8px',
                              textAlign: 'center',
                              backgroundColor: '#b5d3f2',
                              borderLeft: '1px solid black',
                              fontWeight: 'bold'
                            }}
                          >
                            {subject}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        <th colSpan="2" className="text-center" style={{ 
                          backgroundColor: '#b5d3f2',
                          position: 'sticky',
                          left: '0',
                          zIndex: '10'
                        }}>
                        </th>
                        {Object.keys(subjects).map((subject, index) => (
                          <React.Fragment key={index}>
                            <th 
                              className="rotate-90"
                              style={{
                                padding: '7px 3px',
                                textAlign: 'center',
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                width: '30px',
                                height: '120px',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                                backgroundColor: '#b5d3f2',
                                borderLeft: '1px solid black',
                                fontWeight: 'bold'
                              }}
                            >
                              {language === "English" ? "Akarik " : "आकारिक"}
                            </th>
                            <th 
                              className="rotate-90"
                              style={{
                                padding: '7px 3px',
                                textAlign: 'center',
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                width: '30px',
                                height: '120px',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                                backgroundColor: '#b5d3f2',
                                fontWeight: 'bold'
                              }}
                            >
                              {language === "English" ? "Sanklit " : "संकलित"}
                            </th>
                            <th 
                              className="rotate-90"
                              style={{
                                padding: '7px 3px',
                                textAlign: 'center',
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                width: '30px',
                                height: '120px',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                                backgroundColor: '#b5d3f2',
                                fontWeight: 'bold'
                              }}
                            >
                              {language === "English" ? "Total " : "एकूण"}
                            </th>
                            <th 
                              className="rotate-90"
                              style={{
                                padding: '7px 3px',
                                textAlign: 'center',
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                width: '30px',
                                height: '120px',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                                backgroundColor: '#b5d3f2',
                                borderRight: index === Object.keys(subjects).length - 1 ? '1px solid black' : '1px solid black',
                                fontWeight: 'bold'
                              }}
                            >
                              {language === "English" ? "Grade " : "श्रेणी"}
                            </th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
          
                    <tbody>
                      {[...selectedStudents]
                        .sort((a, b) => a.rollNo - b.rollNo)
                        .map((student) => (
                          <tr key={student.srNo} style={{ borderBottom: '1px solid black' }}>
                            <td style={{
                              padding: '6px',
                              textAlign: 'center',
                              backgroundColor: '#fff',
                              position: 'sticky',
                              left: '0',
                              zIndex: '5',
                              borderRight: '1px solid black'
                            }}>
                              {student.rollNo}
                            </td>
                            <td style={{
                              padding: '7px 10px',
                              textAlign: 'left',
                              backgroundColor: '#fff',
                              position: 'sticky',
                              left: '80px',
                              zIndex: '5',
                              borderRight: '1px solid black'
                            }}>
                              {student.stdName} {student.stdFather} {student.stdSurname}
                            </td>
                            {Object.keys(subjects).map((subject, index) => (
                              <React.Fragment key={index}>
                                <td style={{
                                  padding: '6px',
                                  textAlign: 'center',
                                  backgroundColor: index % 2 === 0 ? '#f8fafc' : '#fff',
                                  borderLeft: '1px solid black'
                                }}>
                                  {marksData[student.srNo]?.[subject]?.Akarik?.Total ?? '-'}
                                </td>
                                <td style={{
                                  padding: '6px',
                                  textAlign: 'center',
                                  backgroundColor: index % 2 === 0 ? '#f8fafc' : '#fff'
                                }}>
                                  {marksData[student.srNo]?.[subject]?.Sanklik?.Total ?? '-'}
                                </td>
                                <td style={{
                                  padding: '6px',
                                  textAlign: 'center',
                                  backgroundColor: index % 2 === 0 ? '#f8fafc' : '#fff',
                                  fontWeight: '500'
                                }}>
                                  {(marksData[student.srNo]?.[subject]?.Akarik?.Total ?? 0) + (marksData[student.srNo]?.[subject]?.Sanklik?.Total ?? 0) ?? '-'}
                                </td>
                                <td style={{
                                  padding: '6px',
                                  textAlign: 'center',
                                  backgroundColor: index % 2 === 0 ? '#f8fafc' : '#fff',
                                  borderRight: index === Object.keys(subjects).length - 1 ? '1px solid black' : 'none',
                                  fontWeight: '500',
                                  color: getGradeColor(
                                    (marksData[student.srNo]?.[subject]?.Akarik?.Total ?? 0) + 
                                    (marksData[student.srNo]?.[subject]?.Sanklik?.Total ?? 0)
                                  )
                                }}>
                                  {getGrade(
                                    (marksData[student.srNo]?.[subject]?.Akarik?.Total ?? 0) + 
                                    (marksData[student.srNo]?.[subject]?.Sanklik?.Total ?? 0)
                                  )}
                                </td>
                              </React.Fragment>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <style jsx>
                  {
                    `
                      td, th{
                        width:auto;
                        border:1px solid black;
                      }
                    `
                  }
                </style>
              </div>
            </div>
          );
          
          // Add this helper function somewhere in your component
          function getGradeColor(total) {
            if (total >= 91) return '#28a745'; // Green for A1
            if (total >= 81) return '#5cb85c'; // Light green for A2
            if (total >= 71) return '#5bc0de'; // Blue for B1
            if (total >= 61) return '#0275d8'; // Darker blue for B2
            if (total >= 51) return '#f0ad4e'; // Orange for C1
            if (total >= 41) return '#ff9800'; // Dark orange for C2
            if (total >= 33) return '#ff5722'; // Red-orange for D1
            if (total >= 21) return '#e53935'; // Red for D2
            return '#dc3545'; // Dark red for Ab
          }

    };
    
  

export default Collectout;