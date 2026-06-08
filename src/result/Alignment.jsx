import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function Alignment({ onClose }) {
  const [academicYear, setAcademicYear] = useState("");
  const [classValue, setClassValue] = useState("");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const udiseNumber = localStorage.getItem("udiseNumber");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAcademicYearChange = (e) => {
    setAcademicYear(e.target.value);
    setClassValue("");
  };
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
  const handleClassChange = (e) => {
    setClassValue(e.target.value);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      if (!academicYear) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/${academicYear}.json`
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

    fetchClasses();
  }, [academicYear, udiseNumber]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!academicYear || !classValue) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/${academicYear}/${classValue}.json`
        );
        if (!response.ok) throw new Error("Failed to fetch subjects");

        const data = await response.json();

        const mappedSubjects = data
          ? Object.keys(data)
              .filter((key) => parseInt(key) >= 1)
              .map((key) => data[key])
          : [];

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

    fetchSubjects();
  }, [academicYear, classValue, udiseNumber]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedSubjects = Array.from(subjects);
    const [movedItem] = reorderedSubjects.splice(result.source.index, 1);
    reorderedSubjects.splice(result.destination.index, 0, movedItem);

    setSubjects(reorderedSubjects);

    updateSubjectSequence(reorderedSubjects);
  };

  const updateSubjectSequence = async (newSequence) => {
    if (!academicYear || !classValue) return;

    try {
      await fetch(
        `${process.env.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${udiseNumber}/subjectSequence/${academicYear}/${classValue}.json`,
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

  return (
    
      <div
        className="modal fade show d-block  "
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
                <div className="col-md-6">
                  <select
                    value={academicYear}
                    onChange={handleAcademicYearChange}
                    className="form-select"
                  >
                    <option value="">Select Academic Year</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2027-2028">2027-2028</option>
                    <option value="2028-2029">2028-2029</option>
                  </select>
                </div>
                <div className="col-md-6">
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
              </div>
              {loading && <div className="text-center">Loading...</div>}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
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
   
  );
}

export default Alignment;