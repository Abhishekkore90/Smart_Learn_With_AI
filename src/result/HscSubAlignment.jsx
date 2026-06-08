import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function HscSubAlignment({ onClose }) {
  const [academicYear, setAcademicYear] = useState("");
  const [classValue, setClassValue] = useState("");
  const [division, setDivision] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');
  const [alertMessage, setAlertMessage] = useState('');

  const udiseNumber = localStorage.getItem("udiseNumber");

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'English';
    setLanguage(storedLanguage);
  }, []);

  const handleAcademicYearChange = (e) => {
    setAcademicYear(e.target.value);
    setClassValue("");
  };

  const handleClassChange = (e) => {
    setClassValue(e.target.value);
  };

  const fetchClasses = async () => {
    if (!academicYear) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/hsc/${academicYear}.json`
      );
      if (!response.ok) throw new Error("Failed to fetch classes");

      const data = await response.json();
      setClasses(data ? Object.keys(data) : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to fetch classes");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    if (!academicYear || !classValue || !division) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/hsc/${academicYear}/${classValue}/${division}.json`
      );
      if (!response.ok) throw new Error("Failed to fetch subjects");

      const data = await response.json();
      const mappedSubjects = data ? Object.values(data) : [];

      setSubjects(mappedSubjects);
      setError(null);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Failed to fetch subjects");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const addDefaultSubject = async (subject) => {
    try {
      // First check if subject already exists
      const subjectSequencePath = `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/hsc/${academicYear}/${classValue}/${division}.json`;

      // Fetch existing subject sequence
      const existingSequenceResponse = await fetch(subjectSequencePath);
      const existingSequence = (await existingSequenceResponse.json()) || {};

      // Check if subject already exists by checking values
      const existingSubjects = Object.values(existingSequence);
      if (existingSubjects.includes(subject.name)) {
        setAlertMessage(`${subject.name} already exists in the subject list!`);
        return; // Exit the function if subject already exists
      }

      // If subject doesn't exist, proceed with adding it
      await fetch(subjectSequencePath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...existingSequence,
          [Object.keys(existingSequence).length + 1]: subject.name, // Add the new subject
        }),
      });

      setAlertMessage(`${subject.name} added successfully!`);
      // Re-fetch subjects after adding the new subject
      fetchSubjects();

    } catch (error) {
      console.error("Error adding subject:", error);
      setAlertMessage("Failed to add subject");
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedSubjects = Array.from(subjects);
    const [movedItem] = reorderedSubjects.splice(result.source.index, 1);
    reorderedSubjects.splice(result.destination.index, 0, movedItem);

    setSubjects(reorderedSubjects);
    updateSubjectSequence(reorderedSubjects);
  };

  const updateSubjectSequence = async (newSequence) => {
    if (!academicYear || !classValue || !division) return;

    try {
      await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/hsc/${academicYear}/${classValue}/${division}.json`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            newSequence.reduce((acc, subject, index) => {
              acc[index + 1] = subject;
              return acc;
            }, {})
          ),
        }
      );
    } catch (error) {
      console.error("Error updating subject sequence:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [academicYear, udiseNumber]);

  useEffect(() => {
    fetchSubjects();
  }, [academicYear, classValue, division, udiseNumber]);


  const fetchDivisions = async () => {
    if (!academicYear || !classValue) return;
  
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/hsc/${academicYear}/${classValue}.json`
      );
      if (!response.ok) throw new Error("Failed to fetch divisions");
  
      const data = await response.json();
      const fetchedDivisions = data ? Object.keys(data).filter((key) => isNaN(key)) : [];
      setDivisions(fetchedDivisions);
      setError(null);
    } catch (err) {
      console.error("Error fetching divisions:", err);
      setError("Failed to fetch divisions");
      setDivisions([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDivisions();
  }, [academicYear, classValue]);
  
    


  return (
    <div>
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Subject Alignment</h5>
              <button
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
             
            <div className="row mb-3">
  <div className="col-md-4">
    <select
      value={academicYear}
      onChange={handleAcademicYearChange}
      className="form-select"
    >
      <option value="">Select Academic Year</option>
      <option value="2023-2024">2023-2024</option>
      <option value="2024-2025">2024-2025</option>
      <option value="2025-2026">2025-2026</option>
      <option value="2026-2027">2026-2027</option>
      <option value="2027-2028">2027-2028</option>
      <option value="2028-2029">2028-2029</option>
    </select>
  </div>
  <div className="col-md-4">
    <select
      value={classValue}
      onChange={handleClassChange}
      className="form-select"
    >
      <option value="">Select Class</option>
      {classes.map((cls, index) => (
        <option key={index} value={cls}>
          {cls}
        </option>
      ))}
    </select>
  </div>
  <div className="col-md-4">
    <select
      id="division"
      value={division}
      onChange={(e) => setDivision(e.target.value)}
      className="form-select"
    >
      <option value="">
        {language === "English" ? "Select Division" : "तुकडी निवडा"}
      </option>
      {divisions.map((div, index) => (
        <option key={index} value={div}>
          {div}
        </option>
      ))}
    </select>
  </div>
</div>

              {loading && <div className="text-center">Loading...</div>}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {alertMessage && (
                <div className="alert alert-info" role="alert">
                  {alertMessage}
                </div>
              )}
              {subjects.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="subjects">
                    {(provided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="list-group"
                      >
                        {subjects.map((subject, index) => (
                          <Draggable
                            key={subject}
                            draggableId={subject}
                            index={index}
                          >
                            {(provided) => (
                              <li
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                {subject}
                                <span
                                  className="badge bg-primary rounded-pill"
                                  style={{ cursor: "pointer" }}
                                >
                                  Drag
                                </span>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HscSubAlignment;
