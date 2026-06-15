import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import "../result/result.css";
// import Sidebar from '../../components/Sidebar';
import AlertMessage from "../../AlertMessage";


const ProgressSheet = ({ initialClass, initialYear }) => {
  const [academicYear, setAcademicYear] = useState(initialYear || localStorage.getItem("cce_academic_year") || '');
  const [classValue, setClassValue] = useState(initialClass || localStorage.getItem("cce_selected_class") || '');

  useEffect(() => {
    const targetClass = initialClass || localStorage.getItem("cce_selected_class");
    if (targetClass) {
      setClassValue(targetClass);
      // Also filter students
      const filtered = studentData.filter((student) => student.currentClass === targetClass);
      setSelectedStudents(filtered);
    }
  }, [initialClass, studentData]);

  useEffect(() => {
    if (initialYear) {
      setAcademicYear(initialYear);
    }
  }, [initialYear]);
  const [selectedExamName, setSelectedExamName] = useState('');
  const [studentData, setStudentData] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [classes, setClasses] = useState([]);
  const [selectedStudentResults, setSelectedStudentResults] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');
  const [division, setDivision] = useState("");
  const [divisions, setDivisions] = useState(["A", "B", "C", "D"]);
  const udiseNumber = localStorage.getItem("udiseNumber");
  const examNames = ['First Semester', 'Second Semester', 'Extra Template'];
  const [previousYearClass, setPreviousYearClass] = useState('');
  const examNameTranslations = {
    "First Semester": "प्रथम सत्र",
    "Second Semester": "द्वितीय सत्र",
    "Extra Template": "अतिरिक्त टेम्पलेट"
  };

  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);


  const [subjectSequence, setSubjectSequence] = useState([]); // New state for subject sequence
  useEffect(() => {
    if (academicYear && (classValue || previousYearClass)) {
      fetchSubjectSequence();
    }
  }, [academicYear, classValue, previousYearClass]);

  // Keep your original path structure exactly as you had it
  const fetchSubjectSequence = async () => {
    try {
      const classToUse = previousYearClass || classValue;
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/${academicYear}/${classToUse}.json`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch subject sequence');
      }

      const data = await response.json();
      const orderedSubjects = Object.keys(data)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((key) => data[key]);

      setSubjectSequence(orderedSubjects);
    } catch (error) {
      console.error('Error fetching subject sequence:', error);
      setSubjectSequence([]);
    }
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
    const storedLanguage = localStorage.getItem('language') || 'English';
    setLanguage(storedLanguage);
  }, []);


  const fetchSchoolName = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(SCHOOL_STORE, 'readonly');
      const store = transaction.objectStore(SCHOOL_STORE);

      // Get the school data using the udiseNumber as key
      const request = store.get(udiseNumber);

      request.onsuccess = (event) => {
        const schoolData = event.target.result;
        if (schoolData) {
          // Set school name and logo from IndexedDB
          setSchoolName(schoolData.schoolName || '-');
          setSchoolLogo(schoolData.schoolLogo || '');

          // Update language if available in school data
          if (schoolData.language) {
            setLanguage(schoolData.language);
            localStorage.setItem('language', schoolData.language);
          }
        } else {
          console.log('No school data found in IndexedDB');
          // Fallback to empty values if no data found
          setSchoolName('-');
          setSchoolLogo('');
        }
      };

      request.onerror = (event) => {
        console.error('Error fetching school data from IndexedDB:', event.target.error);
        // Fallback to empty values on error
        setSchoolName('-');
        setSchoolLogo('');
      };
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      // Fallback to empty values on error
      setSchoolName('-');
      setSchoolLogo('');
    }
  };

  useEffect(() => {
    fetchSchoolName();
    fetchStudentData();
  }, [udiseNumber]); // Add udiseNumber as dependency



  useEffect(() => {
    if (selectedExamName && classValue && academicYear) {
      fetchMarksForSelectedSubject();
    }
  }, [selectedExamName, classValue, academicYear]);

  const handleAcademicYearChange = (e) => setAcademicYear(e.target.value);

  const handleExamNameChange = (e) => {
    setSelectedExamName(e.target.value);

  }



  // IndexedDB constants
  const DB_NAME = 'SchoolManagementDB';
  const STUDENT_STORE = 'studentData';
  const DB_VERSION = 1;
  const ATTENDANCE_STORE = 'attendance';
  const SCHOOL_STORE = 'schoolData';



  // Function to open IndexedDB
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STUDENT_STORE)) {
          db.createObjectStore(STUDENT_STORE, { keyPath: "id" });
        }

        // Add SCHOOL_STORE if it doesn't exist
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

  // Function to fetch student data from IndexedDB
  // const fetchStudentData = async (db) => {
  //   return new Promise((resolve, reject) => {
  //     const transaction = db.transaction(STUDENT_STORE, "readonly");
  //     const store = transaction.objectStore(STUDENT_STORE);
  //     const request = store.getAll();

  //     request.onsuccess = (event) => {
  //       const students = event.target.result;
  //       setStudentData(students);


  //       const classesAndDivisions = {};
  //       students.forEach((student) => {
  //         if (student && student.currentClass) {
  //           if (!classesAndDivisions[student.currentClass]) {
  //             classesAndDivisions[student.currentClass] = {};
  //           }

  //           const division = student.division || "";
  //           if (!classesAndDivisions[student.currentClass][division]) {
  //             classesAndDivisions[student.currentClass][division] = [];
  //           }

  //           // Use the ID as the serial number equivalent
  //           classesAndDivisions[student.currentClass][division].push(student.id);
  //         }
  //       });

  //       // Extract class, division, and srNo from key
  //       const updatedStudents = students.map(student => {
  //         const keyParts = student.id.split("-"); // Split by "-"
  //         const className = keyParts[0]; // First part is class
  //         const division = keyParts[1]; // Second part is division
  //         const srNo = keyParts[keyParts.length - 1]; // Last part is srNo
  //         return { ...student, className, division, srNo };
  //       });

  //       setClasses(Object.keys(classesAndDivisions));
  //       setStudentData(updatedStudents); // Store updated students
  //       resolve(updatedStudents);
  //     };

  //     request.onerror = (event) => {
  //       console.error("Error fetching student data from IndexedDB:", event.target.error);
  //       reject(event.target.error);

  //     };
  //   });
  // };


  // Load student data and marks from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await openDB();
        await fetchStudentData(db);
      } catch (error) {
        console.error("Error loading data from IndexedDB:", error);
      }
    };

    loadData();
  }, []);


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





  // const fetchStudentData = async () => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/studentData.json`
  //     );
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }
  //     const data = await response.json();

  //     const filteredData = Object.keys(data)
  //       .filter(key => data[key] !== null)
  //       .map(key => ({ srNo: key, ...data[key] }));

  //     setStudentData(filteredData);
  //     const classSet = new Set();
  //     filteredData.forEach((student) => {
  //       if (student.currentClass) {
  //         classSet.add(String(student.currentClass));
  //       }
  //     });
  //     setClasses([...classSet]);
  //   } catch (error) {
  //     console.error('Error fetching student data:', error);
  //   }
  // };
  const fetchSubjectsForClass = async (classValue) => {
    try {
      if (!academicYear) {
        console.error('Academic year is not set');
        return;
      }
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

  const fetchMarksData = async (key, academicYear, examName) => {
    try {
      console.log('Fetching Marks Data with:', {
        key,
        academicYear,
        examName
      });

      const db = await openDB();
      const transaction = db.transaction(STUDENT_STORE, "readonly");
      const store = transaction.objectStore(STUDENT_STORE);

      // Find the correct key based on the numeric identifier
      const allKeys = await new Promise((resolve, reject) => {
        const keysRequest = store.getAllKeys();
        keysRequest.onsuccess = (event) => resolve(event.target.result);
        keysRequest.onerror = (event) => reject(event.target.error);
      });

      // Improved key matching to handle more flexible key formats
      const matchingKey = allKeys.find(storeKey =>
        typeof storeKey === 'string' &&
        (storeKey.endsWith(`-${key}`) || storeKey === key)
      );

      console.log('Matching Key:', matchingKey);

      if (!matchingKey) {
        console.warn('No matching key found for:', key);
        return null;
      }

      const request = store.get(matchingKey);

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const studentData = event.target.result;

          console.log('Raw Student Data:', studentData);

          // More robust nested structure checking
          if (!studentData || !studentData.result) {
            console.warn('No result data found for student');
            resolve(null);
            return;
          }

          const academicYearData = studentData.result[academicYear];
          if (!academicYearData) {
            console.warn(`No data found for academic year: ${academicYear}`);
            resolve(null);
            return;
          }

          const examData = academicYearData[examName];
          if (!examData) {
            console.warn(`No exam data found for: ${examName}`);
            resolve(null);
            return;
          }

          const result = {
            studentInfo: {
              name: studentData.stdName,
              surname: studentData.stdSurname,
              class: studentData.currentClass,
              rollNo: studentData.rollNo
            }
          };

          // Dynamically process subjects, including specialized structures
          Object.keys(examData).forEach((subject) => {
            // Skip 'remark' and other non-subject keys
            if (subject === 'remark') {
              result.remark = examData[subject];
              return;
            }

            // Explicitly handle 'nondi' key
            if (subject === 'nondi') {
              result.nondi = examData[subject];
              return;
            }

            // Handle different subject mark structures
            const subjectData = examData[subject];

            // Check for Akarik/Sanklik type structures (like in Physics, Maths)
            if (subjectData.Akarik || subjectData.Sanklik) {
              result[subject] = {
                Akarik: processSubjectSection(subjectData.Akarik),
                Sanklik: processSubjectSection(subjectData.Sanklik),
                Total: {
                  Akarik: subjectData.Akarik?.Total || 0,
                  Sanklik: subjectData.Sanklik?.Total || 0
                }
              };
            }
            // Standard subject mark structure
            else {
              result[subject] = {
                outOf: subjectData.outOf,
                obtainMarks: subjectData.obtainMarks,
                minMarks: subjectData.minMarks,
                writtenMarks: subjectData.writtenMarks,
                oralMarks: subjectData.oralMarks,
                subtype: subjectData.subtype,
                graceMarks: subjectData.graceMarks
              };
            }
          });

          console.log('Processed Marks:', result);
          resolve(result);
        };

        request.onerror = (event) => {
          console.error("Error fetching marks from IndexedDB:", event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error in fetchMarksData:', error);
      return null;
    }
  };

  // Helper function to process Akarik/Sanklik subject sections
  function processSubjectSection(section) {
    if (!section) return {};

    return {
      Activity: section.Activity || 0,
      'Daily Monitoring': section['Daily Monitoring'] || 0,
      Demonstration: section.Demonstration || 0,
      Homework: section.Homework || 0,
      'Oral Work': section['Oral Work'] || 0,
      Others: section.Others || 0,
      Project: section.Project || 0,
      Test: section.Test || 0,
      Total: section.Total || 0,
      Orally: section.Orally || 0,
      Writing: section.Writing || 0
    };
  }

  const [selectedStudentForSr, setSelectedStudentForSr] = useState('')


  const fetchHeightWeightData = async (srNo, academicYear) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STUDENT_STORE, "readonly");
      const store = transaction.objectStore(STUDENT_STORE);

      const request = store.get(srNo); // Fetch student data by srNo

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const studentData = event.target.result;

          if (!studentData || !studentData.weightandHeight) {
            console.warn('No height and weight data found for student');
            resolve(null);
            return;
          }

          const heightWeight = studentData.weightandHeight[academicYear] || {};
          resolve(heightWeight);
        };

        request.onerror = (event) => {
          console.error("Error fetching height and weight from IndexedDB:", event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error in fetchHeightWeightData:', error);
      return null;
    }
  };

  const viewResult = async (srNo) => {
    try {
      // Find the student in the selected students array
      const student = selectedStudents.find((student) => student.srNo === srNo);

      if (!student) {
        throw new Error("Student not found");
      }

      // Set the selected student
      setSelectedStudentForSr(student);

      // Fetch height and weight data
      const heightWeightData = await fetchHeightWeightData(student.id || srNo, academicYear);


      // Fetch First Semester marks
      const firstSemesterData = await fetchMarksData(
        student.id || srNo,
        academicYear,
        'First Semester'
      );

      // Fetch Selected Exam marks (If Extra Template is selected, we want Second Semester data)
      const secondSemesterData = await fetchMarksData(
        student.id || srNo,
        academicYear,
        selectedExamName === 'Extra Template' ? 'Second Semester' : selectedExamName
      );

      // Validate data
      const firstSemesterResults = firstSemesterData || {};
      const secondSemesterResults = secondSemesterData || {};
      const resultsWithTotal = {};

      subjectSequence.forEach((subject) => {
        const firstSemesterMarks = firstSemesterResults[subject] || {};
        const firstSemesterTotal = calculateSubjectTotal(firstSemesterMarks);
        const firstSemesterGrade = calculateGrade(firstSemesterTotal);

        const secondSemesterMarks = secondSemesterResults[subject] || {};
        const total = calculateSubjectTotal(secondSemesterMarks);
        const grade = calculateGrade(total);

        resultsWithTotal[subject] = {
          firstSemesterMarks,
          firstSemesterTotal,
          firstSemesterGrade,
          secondSemesterMarks,
          total,
          grade,
        };
      });

      // Prepare height and weight data for display
      const heightSeptember = heightWeightData?.September || {};
      const heightMarch = heightWeightData?.March || {};
      console.log("heightSeptember", heightSeptember);
      console.log("heightMarch", heightMarch);


      // Extract nondi data
      const firstSemesterNondi = firstSemesterData?.nondi || {};
      const secondSemesterNondi = secondSemesterData?.nondi || {};

      // Set state with both semester data
      setSelectedStudentResults({
        studentName: student.stdName,
        results: resultsWithTotal,
        heightSeptember: heightSeptember.height || '',
        weightSeptember: heightSeptember.weight || '',
        heightMarch: heightMarch.height || '',
        weightMarch: heightMarch.weight || '',
        nondi: secondSemesterNondi,
        firstSemester: firstSemesterNondi,
        stdMother: student.stdMother,
        stdFather: student.stdFather,
        stdSurname: student.stdSurname,
        dob: student.dob,
        division: student.division,
        motherTounge: student.motherTounge,
        studentId: student.studentId,
        gender: student.gender,
        rollNo: student.rollNo,
      });

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching student results:", error);
      setAlertMessage("Failed to fetch student results. Please try again.");
    }
  };


  const calculateGradeEnglish = (total) => {
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

  const calculateGradeMarathi = (total) => {
    if (total >= 91) return 'अ-1';
    if (total >= 81) return 'अ-2';
    if (total >= 71) return 'ब-1';
    if (total >= 61) return 'ब-2';
    if (total >= 51) return 'क-1';
    if (total >= 41) return 'क-2';
    if (total >= 33) return 'ड-1';
    if (total >= 21) return 'ड-2';
    return 'अनुपस्थित';
  };

  // Function to calculate grade based on the current language
  const calculateGrade = (total) => {
    return language === 'English' ? calculateGradeEnglish(total) : calculateGradeMarathi(total);
  };

  // Helper to calculate total for a subject entry
  const calculateSubjectTotal = (marks) => {
    if (!marks) return 0;
    if (marks.Akarik || marks.Sanklik) {
      return (marks.Akarik?.Total || 0) + (marks.Sanklik?.Total || 0);
    }
    return marks.obtainMarks || 0;
  };

  const handleCloseModal = () => setShowModal(false);

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const [attendance, setAttendance] = useState({
    Present: {},
    Absent: {},
    Leave: {}
  });

  const fetchAttendanceFromIndexedDB = async (srNo, academicYear) => {
    try {
      console.log('Fetching Attendance Data with:', { srNo, academicYear });

      const db = await openDB();
      const transaction = db.transaction(ATTENDANCE_STORE, "readonly");
      const store = transaction.objectStore(ATTENDANCE_STORE);

      // Find all keys and log them
      const allKeys = await new Promise((resolve, reject) => {
        const keysRequest = store.getAllKeys();
        keysRequest.onsuccess = (event) => {
          const keys = event.target.result;
          console.log('ALL KEYS IN ATTENDANCE STORE:', keys);
          resolve(keys);
        };
        keysRequest.onerror = (event) => reject(event.target.error);
      });

      // Improved key matching with extensive logging
      const matchingKey = allKeys.find(storeKey => {
        const storeKeyStr = String(storeKey).trim();
        const srNoStr = String(srNo).trim();

        const isMatch = storeKeyStr === srNoStr;

        if (isMatch) {
          console.log('MATCHING KEY FOUND:', {
            storeKey,
            srNo,
            match: isMatch
          });
        }

        return isMatch;
      });


      console.log('Matching Attendance Key:', matchingKey);

      if (!matchingKey) {
        console.warn('No matching attendance key found for:', srNo);
        console.warn('Available keys:', allKeys);
        return null;
      }

      const request = store.get(matchingKey);

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const attendanceData = event.target.result;

          console.log('RAW ATTENDANCE DATA:', JSON.stringify(attendanceData, null, 2));

          // Extract the year from academic year
          const startYear = academicYear.split('-')[0];
          const endYear = academicYear.split('-')[1];

          // Process the attendance based on the months
          const fetchedAttendance = {
            Present: {},
            Absent: {},
            Leave: {}
          };

          // Define the first and second semester months
          const firstSemesterMonths = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',];
          const secondSemesterMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

          // Process each month
          [...firstSemesterMonths, ...secondSemesterMonths].forEach(month => {
            let yearForMonth = firstSemesterMonths.includes(month) ? startYear : endYear;

            // Get the attendance for the month
            const monthData = attendanceData.Presenty?.Presenty?.[yearForMonth]?.[month] || {};

            let presentCount = 0;
            let absentCount = 0;
            let leaveCount = 0;

            // Count attendance status for each day in the month
            Object.keys(monthData).forEach(day => {
              const statusObj = monthData[day];
              let status;

              if (statusObj && typeof statusObj === 'object') {
                status = statusObj.present || statusObj.status;
              } else {
                status = statusObj;
              }

              if (status === 'present' || status === true) {
                presentCount++;
              } else if (status === 'absent' || status === false) {
                absentCount++;
              } else if (status === null || status === undefined) {
                leaveCount++;
              }
            });

            // Store the counts in the fetched attendance data
            fetchedAttendance.Present[month] = presentCount;
            fetchedAttendance.Absent[month] = absentCount;
            fetchedAttendance.Leave[month] = leaveCount - 1;
          });

          console.log('PROCESSED ATTENDANCE:', fetchedAttendance);
          resolve(fetchedAttendance);
        };

        request.onerror = (event) => {
          console.error("Error fetching attendance from IndexedDB:", event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error in fetchAttendanceFromIndexedDB:', error);
      return null;
    }
  };




  useEffect(() => {
    const fetchAttendanceData = async () => {
      console.log('FETCH ATTENDANCE EFFECT TRIGGERED');
      console.log('Selected Student:', selectedStudentForSr);
      console.log('Academic Year:', academicYear);

      if (!selectedStudentForSr) {
        console.warn('No student selected');
        return;
      }

      const srNo = selectedStudentForSr.serialNo;
      console.log('Student SR No:', srNo);
      const academicYearParts = academicYear.split('-');

      try {
        const attendanceData = await fetchAttendanceFromIndexedDB(srNo, academicYearParts[0] + '-' + academicYearParts[1]);

        if (attendanceData) {
          setAttendance(attendanceData);
          console.log('FINAL ATTENDANCE SET:', attendanceData);
        } else {
          console.warn('No attendance data found');
          setAttendance({
            Present: {},
            Absent: {},
            Leave: {}
          });
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendance({
          Present: {},
          Absent: {},
          Leave: {}
        });
      }
    };

    fetchAttendanceData();
  }, [selectedStudentForSr, academicYear]);


  const [summerVacationDate, setSummerVacationDate] = useState('');
  const [winterVacationDate, setWinterVacationDate] = useState('');

  // Define the English month names
  const firstSemesterMonths = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const secondSemesterMonths = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

  // Function to translate month to Marathi if needed
  const getMonthName = (month) => {
    const marathiMonths = {
      Jun: 'जून', Jul: 'जुलै', Aug: 'ऑगस्ट', Sep: 'सप्टेंबर', Oct: 'ऑक्टोबर', Nov: 'नोव्हेंबर',
      Dec: 'डिसेंबर', Jan: 'जानेवारी', Feb: 'फेब्रुवारी', Mar: 'मार्च', Apr: 'एप्रिल', May: 'मे'
    };
    return language === "English" ? month : marathiMonths[month];
  };

  const getAttendanceType = (type) => {
    const marathiTypes = {
      Present: 'उपस्थित',
      Absent: 'गैरहजर',
      Leave: 'रजा'
    };
    return language === "English" ? type : marathiTypes[type];
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
              size: ${selectedExamName === 'Extra Template' ? 'A4 Portrait' : 'A4 Landscape'}; /* auto is the initial value */
            margin: 3mm; /* this affects the margin in the printer settings */
          }
          .extra-template-container {
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 20mm !important;
            background-color: #fff !important;
            border: 2px solid #000 !important;
            margin: 0 auto !important;
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
.gradient-background {
background: linear-gradient(to bottom, rgb(240, 217, 228), rgb(245, 255, 255), rgb(250, 230, 240));
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
         

.attendance-table th {
  font-weight: normal;
  font-size: 14px;
}
  .attendance-table td:first-child {
  font-size: 13px;
  font-weight: normal;
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
              border: 1px solid #130606;
            }

            th, td {
              border: 1px solid #130606;
              padding: 5px;
              text-align: left;
              word-wrap: break-word;
              box-sizing: border-box;
            }

             table th {
              border: 1px solid #130606;
            }

            .student-info-grid {
              border: 1px solid #130606;
            }

            .left-box  {
              border: 1px solid #130606;
            }

            .table-striped tbody tr:nth-of-type(odd) {
              background-color: rgba(0, 0, 0, 0.05); /* Stripe effect */
            }

            .table-bordered ,tr , th, td {
              border: 1px solid #130606;
            }

            .table-striped th ,td , tbody td {
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
              border: 1px solid #130606;
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
      console.error('Print content not found');
    }
  };


  return (
    <div>
      {/* <Sidebar /> */}
      <AlertMessage message={alertMessage} show={showAlert} />

      <div className=' main-content-of-page'>
        <h2 style={{ color: '#0c2a52', textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}> {language === "English" ? "Progress Sheet" : "प्रगति पत्र"}</h2>

        <table className="table table-striped table-bordered" >
          <tbody>
            <tr>
              <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}> {language === "English" ? "Academic Year " : "शैक्षणिक वर्ष"}</th>
              <td>
                <select id="academicYear" value={academicYear} onChange={handleAcademicYearChange} className="form-control custom-select" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">{language === "English" ? "Select Year " : "वर्ष निवडा"}</option>
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
              <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}> {language === "English" ? "Class " : "वर्ग"} </th>
              <td>
                <select id="class" value={classValue} onChange={handleClassChange} className="form-control custom-select" defaultValue={examNames[0]} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">{language === "English" ? " Select Class " : "वर्ग निवडा"}</option>
                  {(() => {
                    const defaultClasses = language === "English" 
                      ? ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"]
                      : ["इयत्ता पहिली", "इयत्ता दुसरी", "इयत्ता तिसरी", "इयत्ता चौथी", "इयत्ता पाचवी", "इयत्ता सहावी", "इयत्ता सातवी", "इयत्ता आठवी", "इयत्ता नववी", "इयत्ता दहावी"];
                    const classesToRender = classes.length > 0 ? classes : defaultClasses;
                    return classesToRender.map((cls, index) => (
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
              <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{language === "English" ? "Exam Name " : "परीक्षेचे नाव"}</th>
              <td>
                <select id="examName" value={selectedExamName} onChange={handleExamNameChange} className="form-control custom-select" defaultValue={examNames[0]} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
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

            {academicYear && academicYear !== "2025-2026" && (
              <tr>
                <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{language === "English" ? "Previous Year Class" : "मागील वर्षाचा वर्ग"}</th>
                <td>
                  <select
                    value={previousYearClass}
                    onChange={(e) => setPreviousYearClass(e.target.value)}
                    className="form-control custom-select"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value="">{language === "English" ? "Select Previous Year Class" : "मागील वर्षाचा वर्ग निवडा"}</option>
                    {(() => {
                      const defaultClasses = language === "English" 
                        ? ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"]
                        : ["इयत्ता पहिली", "इयत्ता दुसरी", "इयत्ता तिसरी", "इयत्ता चौथी", "इयत्ता पाचवी", "इयत्ता सहावी", "इयत्ता सातवी", "इयत्ता आठवी", "इयत्ता नववी", "इयत्ता दहावी"];
                      const classesToRender = classes.length > 0 ? classes : defaultClasses;
                      return classesToRender.map((cls, index) => (
                        <option key={index} value={cls}>
                          {cls}
                        </option>
                      ));
                    })()}
                  </select>
                </td>
              </tr>
            )}

          </tbody>

        </table>
        {selectedStudents.length > 0 && (
          <div className="mt-4">
            <table className="table table-striped table-bordered custom-table">
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }} className="custom-width">{language === "English" ? "Roll No" : "हजेरी क्र."}</th>
                  <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{language === "English" ? "Student Name " : "विद्यार्थ्याचे नाव: "}</th>
                  <th style={{ backgroundColor: '#b5d3f2', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{language === "English" ? "Result " : "प्रगतीपत्रक"}</th>
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
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button className="btn btn-primary" onClick={() => viewResult(student.srNo)}>
                            {language === "English" ? "View Result" : "प्रगति पत्रक"}
                          </button>
                          <button
                            className="btn btn-success"
                            onClick={() => {
                              const udise = localStorage.getItem("udiseNumber") || "default";
                              const academicYr = academicYear || "default";
                              const clsVal = classValue || "default";
                              const examName = selectedExamName || "First Semester";
                              window.open(`/webResult/${udise}/${student.srNo}/${academicYr}/${clsVal}/${examName}`, "_blank");
                            }}
                          >
                            {language === "English" ? "Web View" : "वेब व्ह्यू"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        <Modal show={showModal} onHide={handleCloseModal} dialogClassName='modal-80w'>
          <Modal.Header closeButton>
            <Modal.Title>{language === "English" ? "Student Results " : "विद्यार्थ्यांचे निकाल"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedExamName === 'Second Semester' && selectedStudentResults ? (
              <div>


                <div className="container ">
                  <div className="left">
                    <div className="left-box" style={{ border: '1px solid black' }}>
                      <div className="school-info">
                        {schoolLogo && (
                          <div>
                            <img src={schoolLogo} alt={`$Logo`} />
                          </div>
                        )}
                        <h2>{schoolName}</h2>
                      </div>
                    </div>
                    <br />

                    <div class="student-info-grid" style={{ border: '1px solid black' }}>
                      <p>
                        <label>{language === "English" ? "Name :" : "नाव :"}</label>
                        <span>
                          {selectedStudentResults?.studentName || ' '}{' '}
                          {selectedStudentResults?.stdFather || ' '}{' '}
                          {selectedStudentResults?.stdSurname || ' '}
                        </span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Roll No :" : "हजेरी क्र. :"}</label>
                        <span>{selectedStudentResults?.rollNo || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Exam :" : "परीक्षा सत्र :"}</label>
                        <span>{selectedExamName || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Year :" : "वर्ष :"}</label>
                        <span>{academicYear || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Class :" : "वर्ग :"}</label>
                        <span>{classValue || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Mother's Name :" : "आईचे नाव :"}</label>
                        <span>{selectedStudentResults?.stdMother || ''}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "DOB :" : "जन्मतारीख :"}</label>
                        <span>{selectedStudentResults?.dob || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Division :" : "तुकडी :"}</label>
                        <span>{selectedStudentResults?.division || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Mother Tongue :" : "मातृभाषा :"}</label>
                        <span>{selectedStudentResults?.motherTounge || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Student ID :" : "विद्यार्थी आयडी :"}</label>
                        <span>{selectedStudentResults?.studentId || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Gender :" : "लिंग :"}</label>
                        <span>{selectedStudentResults?.gender || ' '}</span>
                      </p>
                    </div>
                    <div className="gradable" >
                      <table>
                        <thead>
                          <tr>
                            <th rowspan="2"></th>
                            <th colspan="1">{language === "English" ? "First Semester" : "प्रथम सत्र"}</th>
                            <th colspan="1">{language === "English" ? "Second Semester" : "द्वितीय सत्र"}</th>
                          </tr>

                        </thead>
                        <tbody>
                          <tr>
                            <td>{language === "English" ? "Weight" : "वजन"} (Kg)</td>
                            <td><span>{selectedStudentResults.weightSeptember !== undefined ? selectedStudentResults.weightSeptember : ''}</span>
                            </td>
                            <td><span>{selectedStudentResults.weightMarch !== undefined ? selectedStudentResults.weightMarch : ''}</span>
                            </td>

                          </tr>
                          <tr>
                            <td>{language === "English" ? "Height" : "उंची"} (Cm)</td>

                            <td> <span>{selectedStudentResults.heightSeptember !== undefined ? selectedStudentResults.heightSeptember : ''}</span>
                            </td>
                            <td><span>{selectedStudentResults.heightMarch !== undefined ? selectedStudentResults.heightMarch : ''}</span>
                            </td>

                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="right" >
                    {/* First Semester Attendance Table */}
                    <h2>{language === "English" ? "Attendance:" : "हजेरी"}</h2>
                    <table className="attendance-table">
                      <thead >
                        <tr>
                          <th >{language === "English" ? "Type:" : "प्रकार"}</th>
                          {firstSemesterMonths.map((month, index) => (
                            <th key={index}>{getMonthName(month)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['Present', 'Absent', 'Leave'].map((type) => (
                          <tr key={type}>
                            <td>{getAttendanceType(type)}</td>
                            {firstSemesterMonths.map((month, index) => (
                              <td key={index}>
                                <input
                                  type="text"
                                  value={type === 'Leave' && attendance[type][month] < 0 ? '' : attendance[type][month] || ''}

                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Second Semester Attendance Table */}
                    <h5 style={{ marginTop: '10px' }}>{language === "English" ? "Second Semester Attendance:" : "द्वितीय सत्राची हजेरी:"}</h5>
                    <table className="attendance-table">
                      <thead>
                        <tr>
                          <th>{language === "English" ? "Type:" : "प्रकार"}</th>
                          {secondSemesterMonths.map((month, index) => (
                            <th key={index}>{getMonthName(month)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['Present', 'Absent', 'Leave'].map((type) => (
                          <tr key={type}>
                            <td>{getAttendanceType(type)}</td>
                            {secondSemesterMonths.map((month, index) => (
                              <td key={index}>
                                <input
                                  type="text"
                                  value={type === 'Leave' && attendance[type][month] < 0 ? '' : attendance[type][month] || ''}
                                // onChange={(e) => handleInputChange(type, month, e.target.value)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>


                    <p style={{ marginTop: '5px' }}>{language === "English" ? "After the summer vacation school will start from." : "उन्हाळी सुटीनंतर शाळा दि. पासून सुरू होईल."}</p>
                    <div style={{ width: '150px' }}>
                      <input
                        type="date"
                        value={summerVacationDate}
                        onChange={(e) => setSummerVacationDate(e.target.value)}
                      />
                    </div>

                    <div className="grad">
                      <p>
                        {language === "English" ? " Instructions for parents:" : "पालकांसाठी सूचना"}
                        <li>  {language === "English" ? " Students should wear school uniform every day." : "विद्यार्थ्यांनी दररोज शालेय गणवेश परिधान करावा."}</li>
                        <li> {language === "English" ? "  A student should do the study given in school every day." : "विद्यार्थ्याने शाळेत दिलेला अभ्यास दररोज करावा."}</li>
                        <li> {language === "English" ? " Students should attend school on time and regularly every day." : "विद्यार्थ्यांनी दररोज वेळेवर व नियमितपणे शाळेत हजर राहावे."}</li>
                        <li> {language === "English" ? " Students should not carry valuables, money. " : "विद्यार्थ्यांनी मौल्यवान वस्तू, पैसे घेऊन जाऊ नये."}</li>
                        <li>  {language === "English" ? " Students should follow the rules and discipline of the school. " : "विद्यार्थ्यांनी शाळेचे नियम व शिस्तीचे पालन करावे."}</li>
                      </p>
                    </div>


                    <p style={{ marginTop: '40px', marginLeft: '350px' }}>{language === "English" ? "Parents Signature " : "पालकांची सही"}</p>
                  </div>
                </div>


                <div className="container mt-1">
                  <div className="left">
                    <h2 style={{ textDecoration: 'underline' }}>{language === "English" ? "Student Progress Report " : "विद्यार्थी प्रगती अहवाल"}</h2>

                    <div>
                      <label htmlFor="roll-no">{language === "English" ? "Roll No: " : "हजेरी क्रमांक: "}</label>
                      <span>{selectedStudentResults?.rollNo || ' '}</span>
                    </div>
                    <div>
                      <label htmlFor="student-name">{language === "English" ? "Student Name: " : "विद्यार्थ्याचे नाव: "}</label>
                      <span>{selectedStudentResults?.studentName || ' '} {selectedStudentResults?.stdFather || ' '} {selectedStudentResults?.stdSurname || ' '}</span>
                    </div>
                    <div>
                      <label htmlFor="class">{language === "English" ? "Class: " : "वर्ग: "}</label>
                      <span>{classValue || ' '}</span>
                    </div>

                    <div>
                      <label htmlFor="exam-roll-no">{language === "English" ? "Exam: " : "परीक्षा: "}</label>
                      <span>{selectedExamName || ' '}</span>
                    </div>

                    {selectedStudentResults?.results ? (
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th>{language === "English" ? "Subject " : "विषय"}</th>
                            <th>{language === "English" ? "First Semester " : "पहिली सत्र"}</th>
                            <th>{language === "English" ? "Second Semester " : "द्वितीय सत्र"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectSequence
                            .filter((subject, index) => subject && index !== 0) // Skip first null or empty subject
                            .map((subject) => {
                              const grades = selectedStudentResults.results[subject] || {}; // Get grades for the subject
                              return (
                                <tr key={subject}>
                                  <td><b>{subject}</b></td>
                                  <td><b>{grades.firstSemesterGrade || "Ab"}</b></td> {/* First semester grade */}
                                  <td><b>{grades.grade || "Ab"}</b></td> {/* Second semester grade */}
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    ) : (
                      <p>{language === "English" ? "No results available." : "कोणतेही प्रगतीपत्रक उपलब्ध नाहीत."}</p>
                    )}


                    <div>

                    </div>
                    <div className="grad" style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ marginRight: '20px', marginBottom: '2px', marginLeft: '20px' }} htmlFor="class-teacher">{language === "English" ? "Class Teacher" : "वर्गशिक्षक"}</label>
                      <label style={{ marginRight: '20px', marginBottom: '2px', marginLeft: '45%' }} htmlFor="principal">{language === "English" ? "Principal " : "प्राचार्य"}</label>
                    </div>
                  </div>
                  <div className="right">
                    <h2 style={{ textAlign: "center", color: "black", fontFamily: "Arial, sans-serif", fontWeight: "bold", marginBottom: "20px" }}>
                      {language === "English" ? "Remark" : "नोंदी"}
                    </h2>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial, sans-serif" }}>

                      <thead>
                        <tr style={{ color: "black", textAlign: "center" }}>
                          <th colSpan="" style={{ padding: "2px", border: "1px solid #ddd", fontSize: "16px" }}>{language === "English" ? "First Semester " : "पहिली सत्र"} </th>
                          <th colSpan="" style={{ padding: "2px", border: "1px solid #ddd", fontSize: "16px" }}>{language === "English" ? "Second Semester " : "दुसरी सत्र"} </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr style={{ color: "black", textAlign: "center" }}>
                          <th colSpan="2" style={{ padding: "2px", border: "1px solid #ddd", fontSize: "16px" }}>{language === "English" ? "Special Progress" : "विशेष प्रगती"}</th>

                        </tr>
                        <tr style={{ backgroundColor: "#ffffff" }}>
                          <td style={{ width: "50%", padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }}>
                            <textarea
                              id="special-progress"
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                resize: "none",
                                fontSize: "14px",
                                height: "100px"
                              }}
                              value={selectedStudentResults?.firstSemester?.specialEntries || "No data available"}
                              readOnly
                            />
                          </td>

                          <td style={{ width: "50%", padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }}>
                            <textarea
                              id="special-progress"
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                resize: "none",
                                fontSize: "14px",
                                height: "100px"
                              }}
                              value={selectedStudentResults?.nondi?.specialEntries || "No data available"}
                              readOnly
                            />
                          </td>

                        </tr>
                        <tr style={{ color: "black", textAlign: "center" }}>
                          <th colSpan="2" style={{ padding: "2px", border: "1px solid #ddd", fontSize: "16px" }}>{language === "English" ? "Hobbies" : "छंद"}</th>
                        </tr>
                        <tr style={{ backgroundColor: "#ffffff" }}>
                          <td style={{ width: "33%", padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }}>
                            <textarea
                              id="special-progress"
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                resize: "none",
                                fontSize: "14px",
                                height: "100px"
                              }}
                              value={selectedStudentResults?.firstSemester?.interestsAndHobbies || "No data available"}
                              readOnly />
                          </td>
                          <td style={{ padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }}>
                            <textarea
                              id="hobbies"
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                resize: "none",
                                fontSize: "14px",
                                height: "100px"
                              }}
                              value={selectedStudentResults?.nondi?.interestsAndHobbies || "No data available"}
                              readOnly
                            />
                          </td>

                        </tr>
                        <tr style={{ color: "black", textAlign: "center" }}>
                          <th colSpan="2" style={{ padding: "2px", border: "1px solid #ddd", fontSize: "16px" }}>{language === "English" ? "Required Improvements" : "आवश्यक सुधारणा"}</th>
                        </tr>
                        <tr style={{ backgroundColor: "#ffffff" }}>
                          <td style={{ width: "33%", padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }}>
                            <textarea
                              id="special-progress"
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                resize: "none",
                                fontSize: "14px",
                                height: "100px"
                              }}
                              value={selectedStudentResults?.firstSemester?.necessaryCorrections || "No data available"}
                              readonly />
                          </td>
                          <td style={{ padding: "2px", border: "1px solid #ddd", verticalAlign: "top" }}>
                            <textarea
                              id="improvements"
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                                resize: "none",
                                fontSize: "14px",
                                height: "100px"
                              }}
                              value={selectedStudentResults?.nondi?.necessaryCorrections || "No data available"}
                              readOnly
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="grade-table" >
                      <h2>{language === "English" ? "Grade Table" : "श्रेणी टेबल"}</h2>
                      <table >
                        <thead>
                          <tr>
                            <th>{language === "English" ? "Marks" : "मार्क्स"}</th>
                            <th>{language === "English" ? "A1" : "अ1"}</th>
                            <th>{language === "English" ? "A2" : "अ2"}</th>
                            <th>{language === "English" ? "B1" : "ब1"}</th>
                            <th>{language === "English" ? "B2" : "ब2"}</th>
                            <th>{language === "English" ? "C1" : "क1"}</th>
                            <th>{language === "English" ? "C2" : "क2"}</th>
                            <th>{language === "English" ? "D1" : "ड1"}</th>
                            <th>{language === "English" ? "D2" : "ड2"}</th>
                            <th>{language === "English" ? "Absent" : "अनुपस्थित"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>%</td>
                            <td>{language === "English" ? "91% to 100%" : "91% ते 100%"}</td>
                            <td>{language === "English" ? "81% to 90%" : "81% ते 90%"}</td>
                            <td>{language === "English" ? "71% to 80%" : "71% ते 80%"}</td>
                            <td>{language === "English" ? "61% to 70%" : "61% ते 70%"}</td>
                            <td>{language === "English" ? "51% to 60%" : "51% ते 60%"}</td>
                            <td>{language === "English" ? "41% to 50%" : "41% ते 50%"}</td>
                            <td>{language === "English" ? "33% to 40%" : "33% ते 40%"}</td>
                            <td>{language === "English" ? "21% to 32%" : "21% ते 32%"}</td>
                            <td>{language === "English" ? "less than 20%" : "20% पेक्षा कमी"}</td>
                          </tr>
                        </tbody>
                      </table>

                    </div>
                  </div>
                </div>
              </div>

            ) : selectedExamName === 'Extra Template' && selectedStudentResults ? (
              <div style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '12mm',
                background: 'linear-gradient(to bottom, #fdfbfb 0%, #ebedee 100%)',
                fontFamily: '"Nirmala UI", Arial, sans-serif',
                border: '12px double #1a237e',
                margin: '20px auto',
                boxSizing: 'border-box',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                lineHeight: '1.2',
                color: '#000',
                boxShadow: '0 0 20px rgba(0,0,0,0.3)'
              }} className="extra-template-container">

                {/* SSA Header and Grade Box */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div style={{ flex: 1.2 }}>
                    <div style={{ fontSize: '13px', color: '#1a237e', fontWeight: 'bold' }}>{language === "English" ? "|| Sarva Shiksha Abhiyan ||" : "।। सर्व शिक्षा अभियान ।।"}</div>
                    <div style={{ fontSize: '11px', color: '#1a237e' }}>{language === "English" ? "Education for All" : "सब पढे सब बढे"}</div>
                  </div>
                  <div style={{ flex: 2, textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#1a237e', textDecoration: 'underline' }}>{language === "English" ? "Continuous Comprehensive Evaluation Form A" : "सातत्यपूर्ण सर्वंकष मूल्यमापन प्रपत्र अ"}</h2>
                    <div style={{ fontSize: '17px', marginTop: '10px', fontWeight: 'bold' }}>
                      {language === "English" ? "School" : "शाळा"} : <span style={{ borderBottom: '2px solid #1a237e', minWidth: '350px', display: 'inline-block', color: '#b71c1c' }}>{schoolName}</span>
                    </div>
                    <div style={{ fontSize: '15px', marginTop: '8px', color: '#333' }}>
                      {language === "English" ? "Tal." : "ता."} <span style={{ borderBottom: '1px solid #000', minWidth: '80px', display: 'inline-block' }}></span>
                      {language === "English" ? "Dist." : "जि."} <span style={{ borderBottom: '1px solid #000', minWidth: '80px', display: 'inline-block' }}></span>
                      {language === "English" ? "Year" : "सन"} : २०<span style={{ borderBottom: '1px solid #000', width: '30px', display: 'inline-block' }}>{academicYear.split('-')[0].slice(-2)}</span>-२०<span style={{ borderBottom: '1px solid #000', width: '30px', display: 'inline-block' }}>{academicYear.split('-')[1].slice(-2)}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1.2, border: '2.5px solid #1a237e', padding: '5px', fontSize: '11px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', borderBottom: '2px solid #1a237e', marginBottom: '5px', color: '#b71c1c', fontSize: '13px' }}>{language === "English" ? "Grade" : "श्रेणी"}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1px', fontWeight: 'bold' }}>
                      {language === "English" ? (
                        <>
                          <div>91 to 100 - A1</div>
                          <div>81 to 90 - A2</div>
                          <div>71 to 80 - B1</div>
                          <div>61 to 70 - B2</div>
                          <div>51 to 60 - C1</div>
                          <div>41 to 50 - C2</div>
                          <div>33 to 40 - D</div>
                          <div>21 to 32 - E1</div>
                          <div>20 & below - E2</div>
                        </>
                      ) : (
                        <>
                          <div>९१ ते १०० - अ १</div>
                          <div>८१ ते ९० - अ २</div>
                          <div>७१ ते ८० - ब १</div>
                          <div>६१ ते ७० - ब २</div>
                          <div>५१ ते ६० - क १</div>
                          <div>४१ ते ५० - क २</div>
                          <div>३३ ते ४० - ड</div>
                          <div>२१ ते ३२ - इ १</div>
                          <div>२० व खाली - इ २</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Info */}
                <div style={{ marginBottom: '15px', fontSize: '16px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '10px', border: '2px solid #1a237e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ flex: 3 }}>{language === "English" ? "Student's Name" : "विद्यार्थ्याचे नांव"} : <span style={{ borderBottom: '2.5px solid #1a237e', minWidth: '380px', display: 'inline-block', fontWeight: 'bold', color: '#1a237e', fontSize: '18px' }}>{selectedStudentResults.studentName} {selectedStudentResults.stdFather} {selectedStudentResults.stdSurname}</span></div>
                    <div style={{ flex: 1 }}>{language === "English" ? "Class" : "इयत्ता"} : <span style={{ borderBottom: '2.5px solid #1a237e', minWidth: '90px', display: 'inline-block', fontWeight: 'bold', textAlign: 'center', color: '#b71c1c' }}>{classValue}</span></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>{language === "English" ? "Reg. No." : "रजि.नं."} : <span style={{ border: '2px solid #1a237e', padding: '2px 15px', backgroundColor: '#fff', borderRadius: '5px', fontWeight: 'bold', color: '#1a237e' }}>{selectedStudentResults.studentId || ''}</span></div>
                    <div>{language === "English" ? "Division" : "तुकडी"} : <span style={{ borderBottom: '2.5px solid #1a237e', minWidth: '90px', display: 'inline-block', textAlign: 'center', fontWeight: 'bold', color: '#b71c1c' }}>{selectedStudentResults.division || '-'}</span></div>
                  </div>
                </div>

                {/* Horizontal Subjects Table */}
                <div style={{ marginBottom: '15px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '2.5px solid #1a237e', fontSize: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1a237e', color: '#fff' }}>
                        <th style={{ border: '1.5px solid #fff', padding: '12px 5px', textAlign: 'center', width: '12%', backgroundColor: '#0d47a1', color: '#fff' }}>{language === "English" ? "Subject" : "विषय"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e' }}>{language === "English" ? "Language" : "मराठी"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e' }}>{language === "English" ? "Hindi" : "हिंदी"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e' }}>{language === "English" ? "English" : "इंग्रजी"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e' }}>{language === "English" ? "Maths" : "गणित"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e', fontSize: '10px' }}>{language === "English" ? "Sci/EVS" : "विज्ञान/ प.अभ्यास"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e' }}>{language === "English" ? "S.S." : "स.शास्त्र"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e' }}>{language === "English" ? "Art" : "कला"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e' }}>{language === "English" ? "Work Exp." : "कार्यानुभव"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e', fontSize: '10px' }}>{language === "English" ? "Phy. Edu." : "शा.शि.व आरोग्य"}</th>
                        <th style={{ border: '1.5px solid #fff', padding: '8px', textAlign: 'center', color: '#fff', backgroundColor: '#1a237e' }}>{language === "English" ? "Remark" : "शेरा"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ backgroundColor: '#fff' }}>
                        <td style={{ border: '2px solid #1a237e', padding: '12px 8px', fontWeight: 'bold', textAlign: 'center', color: '#1a237e', backgroundColor: '#e3f2fd', fontSize: '14px' }}>{language === "English" ? "First Semester Grade" : "प्रथम सत्र श्रेणी"}</td>
                        {[
                          ['मराठी', 'भाषा'], 'हिंदी', ['इंग्रजी', 'English'], 'गणित', ['विज्ञान', 'प.अभ्यास'], 'समाजशास्त्र', 'कला', 'कार्यानुभव', 'शा.शिक्षण'
                        ].map((key, i) => {
                          const subjectName = Array.isArray(key)
                            ? subjectSequence.find(s => key.some(k => s && s.includes(k)))
                            : subjectSequence.find(s => s && s.includes(key));
                          const total = selectedStudentResults.results[subjectName]?.firstSemesterTotal;
                          return (
                            <td key={i} style={{ border: '2px solid #1a237e', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '20px', color: '#b71c1c' }}>
                              {total !== undefined ? calculateGrade(total) : '-'}
                            </td>
                          );
                        })}
                        <td style={{ border: '2px solid #1a237e', padding: '8px' }}></td>
                      </tr>
                      <tr style={{ backgroundColor: '#f9f9f9' }}>
                        <td style={{ border: '2px solid #1a237e', padding: '12px 8px', fontWeight: 'bold', textAlign: 'center', color: '#1a237e', backgroundColor: '#e3f2fd', fontSize: '14px' }}>{language === "English" ? "Second Semester Grade" : "द्वितीय सत्र श्रेणी"}</td>
                        {[
                          ['मराठी', 'भाषा'], 'हिंदी', ['इंग्रजी', 'English'], 'गणित', ['विज्ञान', 'प.अभ्यास'], 'समाजशास्त्र', 'कला', 'कार्यानुभव', 'शा.शिक्षण'
                        ].map((key, i) => {
                          const subjectName = Array.isArray(key)
                            ? subjectSequence.find(s => key.some(k => s && s.includes(k)))
                            : subjectSequence.find(s => s && s.includes(key));
                          const total = selectedStudentResults.results[subjectName]?.total;
                          return (
                            <td key={i} style={{ border: '2px solid #1a237e', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '20px', color: '#b71c1c' }}>
                              {total !== undefined ? calculateGrade(total) : '-'}
                            </td>
                          );
                        })}
                        <td style={{ border: '2px solid #1a237e', padding: '8px' }}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Remarks Section */}
                <div style={{ marginTop: '15px', fontSize: '16px', padding: '15px', border: '2.5px dashed #1a237e', borderRadius: '15px', backgroundColor: 'rgba(255,255,255,0.6)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1a237e', textDecoration: 'underline', fontSize: '17px' }}>{language === "English" ? "Descriptive Remarks -" : "वर्णनात्मक नोंदणी -"}</div>
                  <div style={{ marginBottom: '12px' }}>
                    {language === "English" ? "1) Special Progress :" : "१) विशेष प्रगती :"} <span style={{ borderBottom: '1.5px solid #1a237e', minWidth: '500px', display: 'inline-block', paddingLeft: '10px', color: '#0d47a1', fontWeight: 'bold' }}>{selectedStudentResults?.nondi?.specialEntries || ''}</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    {language === "English" ? "2) Interests / Hobbies :" : "२) आवड / छंद :"} <span style={{ borderBottom: '1.5px solid #1a237e', minWidth: '500px', display: 'inline-block', paddingLeft: '10px', color: '#0d47a1', fontWeight: 'bold' }}>{selectedStudentResults?.nondi?.interestsAndHobbies || ''}</span>
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    {language === "English" ? "3) Improvements Needed :" : "३) सुधारणा आवश्यक :"} <span style={{ borderBottom: '1.5px solid #1a237e', minWidth: '500px', display: 'inline-block', paddingLeft: '10px', color: '#0d47a1', fontWeight: 'bold' }}>{selectedStudentResults?.nondi?.necessaryCorrections || ''}</span>
                  </div>
                </div>

                <div style={{ marginTop: '15px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#1a237e' }}>
                  {language === "English" ? "School Reopening Date -" : "शाळा सुरु दिनांक -"} <span style={{ borderBottom: '2.5px solid #1a237e', minWidth: '40px', display: 'inline-block' }}></span> / <span style={{ borderBottom: '2.5px solid #1a237e', minWidth: '45px', display: 'inline-block' }}></span> / २०<span style={{ borderBottom: '2.5px solid #1a237e', minWidth: '45px', display: 'inline-block' }}>{academicYear.split('-')[1].slice(-2)}</span>
                </div>

                {/* Bottom Signatures */}
                <div style={{ marginTop: 'auto', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <strong>{language === "English" ? "Class Teacher Signature" : "वर्गशिक्षक स्वाक्षरी"}</strong>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <strong>{language === "English" ? "Principal Signature" : "मुख्याध्यापक स्वाक्षरी"}</strong>
                  </div>
                </div>
              </div>

            ) : (


              <div>
                {/* First semester modal content */}
                <div className="container mt-1">
                  <div className="left">
                    <div className="left-box" style={{ border: '1px solid black' }} >
                      <div className="school-info" >
                        {schoolLogo && (
                          <div>
                            <img src={schoolLogo} alt={`$Logo`} />
                          </div>
                        )}
                        <h2>{schoolName}</h2>
                      </div>
                    </div>
                    <br />

                    <div class="student-info-grid" style={{ border: '1px solid black' }}>
                      <p>
                        <label>{language === "English" ? "Name :" : "विद्यार्थ्याचे नाव :"}</label>
                        <span>
                          {selectedStudentResults?.studentName || '-'}{' '}
                          {selectedStudentResults?.stdFather || ' '}{' '}
                          {selectedStudentResults?.stdSurname || ' '}
                        </span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Roll No :" : "हजेरी क्रमांक :"}</label>
                        <span>{selectedStudentResults?.rollNo || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Exam :" : "परीक्षा सत्र :"}</label>
                        <span>{selectedExamName || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Year :" : "वर्ष :"}</label>
                        <span>{academicYear || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Class :" : "वर्ग: "}</label>
                        <span>{classValue || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Mother Name :" : "आईचे नाव :"}</label>
                        <span>{selectedStudentResults?.stdMother || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "DOB :" : "जन्मतारीख :"}</label>
                        <span>{selectedStudentResults?.dob || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Division :" : "तुकडी :"}</label>
                        <span>{selectedStudentResults?.division || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Mother Tongue :" : "मातृभाषा :"}</label>
                        <span>{selectedStudentResults?.motherTounge || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Student ID :" : "विद्यार्थी आयडी :"}</label>
                        <span>{selectedStudentResults?.studentId || ' '}</span>
                      </p>
                      <p>
                        <label>{language === "English" ? "Gender :" : "लिंग :"}</label>
                        <span>{selectedStudentResults?.gender || ' '}</span>
                      </p>
                    </div>
                    <div className="gradable">
                      <table>
                        <thead>
                          <tr>
                            <th rowspan="2"></th>
                            <th colspan="1">{language === "English" ? "First Semester" : "प्रथम सत्र"}</th>
                            <th colspan="1">{language === "English" ? "Second Semester" : "द्वितीय सत्र"}</th>
                          </tr>

                        </thead>
                        <tbody>
                          <tr>
                            <td>{language === "English" ? "Weight" : "वजन"} (Kg)</td>
                            <td><span>{selectedStudentResults?.weightSeptember !== undefined ? selectedStudentResults?.weightSeptember : ''}</span>
                            </td>
                            <td><span>{selectedStudentResults?.weightMarch !== undefined ? selectedStudentResults?.weightMarch : ''}</span>
                            </td>

                          </tr>
                          <tr>
                            <td>{language === "English" ? "Height" : "उंची"} (Cm)</td>

                            <td> <span>{selectedStudentResults?.heightSeptember !== undefined ? selectedStudentResults?.heightSeptember : ''}</span>
                            </td>
                            <td><span>{selectedStudentResults?.heightMarch !== undefined ? selectedStudentResults?.heightMarch : ''}</span>
                            </td>

                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="right">
                    {/* First Semester Attendance Table */}
                    <h2>{language === "English" ? "Attendance:" : "हजेरी"}</h2>
                    <table className="attendance-table">
                      <thead>
                        <tr>
                          <th>{language === "English" ? "Type:" : "प्रकार"}</th>
                          {firstSemesterMonths.map((month, index) => (
                            <th key={index}>{getMonthName(month)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['Present', 'Absent', 'Leave'].map((type) => (
                          <tr key={type}>
                            <td>{getAttendanceType(type)}</td>
                            {firstSemesterMonths.map((month, index) => (
                              <td key={index}>
                                <input
                                  type="text"
                                  value={type === 'Leave' && attendance[type][month] < 0 ? '' : attendance[type][month] || ''}
                                // onChange={(e) => handleInputChange(type, month, e.target.value)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p style={{ marginTop: '5px' }}>{language === "English" ? "After the winter vacation the school will start from." : "हिवाळी सुटीनंतर शाळा दि. पासून सुरू होईल."}</p>
                    <div style={{ width: '150px' }}>

                      <input
                        type="date"
                        value={winterVacationDate}
                        onChange={(e) => setWinterVacationDate(e.target.value)}
                      />
                    </div>

                    <div className="grad">
                      <p>
                        {language === "English" ? " Instructions for parents:" : "पालकांसाठी सूचना"}
                        <li>  {language === "English" ? " Students should wear school uniform every day." : "विद्यार्थ्यांनी दररोज शालेय गणवेश परिधान करावा."}</li>
                        <li> {language === "English" ? "  A student should do the study given in school every day." : "विद्यार्थ्याने शाळेत दिलेला अभ्यास दररोज करावा."}</li>
                        <li> {language === "English" ? " Students should attend school on time and regularly every day." : "विद्यार्थ्यांनी दररोज वेळेवर व नियमितपणे शाळेत हजर राहावे."}</li>
                        <li> {language === "English" ? " Students should not carry valuables, money. " : "विद्यार्थ्यांनी मौल्यवान वस्तू, पैसे घेऊन जाऊ नये."}</li>
                        <li>  {language === "English" ? " Students should follow the rules and discipline of the school. " : "विद्यार्थ्यांनी शाळेचे नियम व शिस्तीचे पालन करावे."}</li>
                      </p>
                    </div>
                    <p style={{ marginTop: '70px', marginLeft: '350px' }}>{language === "English" ? "Parents Signature " : "पालकांची सही"}</p>

                  </div>
                </div>

                <div className="container mt-1">
                  <div className="left">
                    <h2 style={{ textDecoration: 'underline' }}>{language === "English" ? " Student Progress Report" : "विद्यार्थी प्रगती अहवाल"}</h2>
                    <div>
                      <label htmlFor="roll-no">{language === "English" ? " Roll No: " : "हजेरी क्रमांक: "}</label>
                      <span>{selectedStudentResults?.rollNo || ' '}</span>
                    </div>
                    <div>
                      <label htmlFor="student-name">{language === "English" ? " Student Name:" : "विद्यार्थ्याचे नाव: "}</label>
                      <span>{selectedStudentResults?.studentName || ' '} {selectedStudentResults?.stdFather || ' '} {selectedStudentResults?.stdSurname || ' '}</span>
                    </div>
                    <div>
                      <label htmlFor="class">{language === "English" ? " Class: " : "वर्ग: "}</label>
                      <span>{classValue || ' '}</span>
                    </div>
                    <div>
                      <label htmlFor="exam-roll-no">{language === "English" ? " Exam: " : "परीक्षा: "}</label>
                      <span>{selectedExamName || ' '}</span>
                    </div>







                    {selectedStudentResults?.results ? (
                      <table className="table table-striped table-bordered" >
                        <thead>
                          <tr>
                            <th>{language === "English" ? "Subject" : "विषय"}</th>
                            <th>{language === "English" ? "Grade" : "श्रेणी"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectSequence
                            .filter((subject, index) => subject && index !== 0) // Skip first null or empty subject
                            .map((subject) => {
                              const { grade } = selectedStudentResults.results[subject] || {}; // Get grade for the subject
                              return (
                                <tr key={subject}>
                                  <td><b>{subject}</b></td>
                                  <td><b>{grade || "Ab"}</b></td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    ) : (
                      <p>{language === "English" ? "No results available." : "कोणतेही प्रगतीपत्रक उपलब्ध नाहीत."}</p>
                    )}


                    <div>
                    </div>
                    <div className="grad" style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ marginRight: '20px', marginBottom: '2px', marginLeft: '20px' }} htmlFor="class-teacher">{language === "English" ? "Class Teacher" : "वर्गशिक्षक"}</label>
                      <label style={{ marginRight: '20px', marginBottom: '2px', marginLeft: '45%' }} htmlFor="principal">{language === "English" ? "Principal" : "प्राचार्य"}</label>
                    </div>
                  </div>
                  <div className="right">
                    <h2>{language === "English" ? "Remark" : "नोंदी"}</h2>
                    <table>
                      <tr>
                        <th style={{ width: "33%" }}>{language === "English" ? "Special Progress:" : "विशेष प्रगती:"}</th>
                        <th style={{ width: "33%" }}>{language === "English" ? "Hobbies:" : "छंद:"}</th>
                        <th style={{ width: "33%" }}>{language === "English" ? "Required Improvements:" : "आवश्यक सुधारणा:"}</th>
                      </tr>
                      <tr>
                        <td style={{ width: "33%" }}>
                          <textarea
                            id="special-progress"
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "4px",
                              border: "1px solid #ccc",
                              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                              resize: "none",
                              fontSize: "14px",
                              height: "130px"
                            }}
                            value={selectedStudentResults?.nondi?.specialEntries || ""}
                            readOnly
                          />
                        </td>
                        <td style={{ width: "33%" }}>
                          <textarea
                            id="hobbies"
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "4px",
                              border: "1px solid #ccc",
                              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                              resize: "none",
                              fontSize: "14px",
                              height: "130px"
                            }}
                            value={selectedStudentResults?.nondi?.interestsAndHobbies || ""}
                            readOnly
                          />
                        </td>
                        <td style={{ width: "33%" }}>
                          <textarea
                            id="improvements"
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "4px",
                              border: "1px solid #ccc",
                              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                              resize: "none",
                              fontSize: "14px",
                              height: "130px"
                            }}
                            value={selectedStudentResults?.nondi?.necessaryCorrections || ""}
                            readOnly
                          />
                        </td>
                      </tr>
                    </table>

                    <div className="grade-table">
                      <h2>{language === "English" ? "Grade Table" : "श्रेणी टेबल"}</h2>
                      <table>
                        <thead>
                          <tr>
                            <th>{language === "English" ? "Marks" : "मार्क्स"}</th>
                            <th>{language === "English" ? "A1" : "अ-1"}</th>
                            <th>{language === "English" ? "A2" : "अ-2"}</th>
                            <th>{language === "English" ? "B1" : "ब-1"}</th>
                            <th>{language === "English" ? "B2" : "ब-2"}</th>
                            <th>{language === "English" ? "C1" : "क-1"}</th>
                            <th>{language === "English" ? "C2" : "क-2"}</th>
                            <th>{language === "English" ? "D1" : "ड-1"}</th>
                            <th>{language === "English" ? "D2" : "ड-2"}</th>
                            <th>{language === "English" ? "Absent" : "अनुपस्थित"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>%</td>
                            <td>{language === "English" ? "91% to 100%" : "91% ते 100%"}</td>
                            <td>{language === "English" ? "81% to 90%" : "81% ते 90%"}</td>
                            <td>{language === "English" ? "71% to 80%" : "71% ते 80%"}</td>
                            <td>{language === "English" ? "61% to 70%" : "61% ते 70%"}</td>
                            <td>{language === "English" ? "51% to 60%" : "51% ते 60%"}</td>
                            <td>{language === "English" ? "41% to 50%" : "41% ते 50%"}</td>
                            <td>{language === "English" ? "33% to 40%" : "33% ते 40%"}</td>
                            <td>{language === "English" ? "21% to 32%" : "21% ते 32%"}</td>
                            <td>{language === "English" ? "less than 20%" : "20% पेक्षा कमी"}</td>
                          </tr>
                        </tbody>
                      </table>

                    </div>
                  </div>
                </div>

              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {language === "English" ? " Close " : "Close करा"}
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              {language === "English" ? "Print" : "Print करा"}
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
};

export default ProgressSheet;
