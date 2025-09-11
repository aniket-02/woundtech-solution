import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function ClinicianDashboard() {
  const [clinicianName, setClinicianName] = useState("Clinician");
  const [clinicianId, setClinicianId] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const navigate = useNavigate();

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const generateSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const start = hour.toString().padStart(2, "0") + ":00";
      const end = (hour + 1).toString().padStart(2, "0") + ":00";
      slots.push(`${start}-${end}`);
    }
    return slots;
  };
  const slots = generateSlots();

  // -------------------- Auth --------------------
  useEffect(() => {
    const clinicianData = localStorage.getItem("clinician");
    if (clinicianData) {
      const parsed = JSON.parse(clinicianData);
      setClinicianName(parsed.name);
      setClinicianId(parsed.id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  // -------------------- Fetch Booked Slots --------------------
  const fetchBookedSlots = async () => {
    if (!clinicianId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/visits/clinician/${clinicianId}`
      );
      const data = await res.json();
      if (data.visits) {
        const newBookedSlots = {};
        const today = new Date();

        // start of current week (Monday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
        startOfWeek.setHours(0, 0, 0, 0);

        // end of week = next Monday (exclusive)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        data.visits.forEach((visit) => {
          const visitDate = new Date(visit.timestamp);
          if (visitDate >= startOfWeek && visitDate < endOfWeek) {
            let dayIndex = (visitDate.getDay() + 6) % 7;

            const hour = visitDate.getHours();
            const slot = `${hour.toString().padStart(2, "0")}:00-${(
              hour + 1
            )
              .toString()
              .padStart(2, "0")}:00`;

            if (!newBookedSlots[dayIndex]) newBookedSlots[dayIndex] = [];
            newBookedSlots[dayIndex].push({
              slot,
              patientName: visit.patient_name,
              status: visit.status,
            });
          }
        });
        setBookedSlots(newBookedSlots);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- Fetch Appointments --------------------
  const fetchAppointments = async () => {
    if (!clinicianId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/visits/clinician/${clinicianId}`
      );
      const data = await res.json();
      if (data.visits) {
        setAppointments(data.visits);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // fetch both slots and appointments when clinicianId is set
  useEffect(() => {
    if (clinicianId) {
      fetchBookedSlots();
      fetchAppointments();
    }
  }, [clinicianId]);

  // -------------------- Open Modal --------------------
  const openAppointmentsModal = async () => {
    await fetchAppointments();
    setShowAppointmentsModal(true);
  };

  // -------------------- Update Appointment Status --------------------
  const updateStatus = async (visitId, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/visits/${visitId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchAppointments();
      await fetchBookedSlots();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- Sign Out --------------------
  const handleSignOut = () => {
    localStorage.removeItem("clinician");
    navigate("/");
  };

  // -------------------- Derived Upcoming Appointments --------------------
  const upcomingAppointments = appointments.filter(
    (appt) => appt.status === "booked" || appt.status === "in_progress"
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Hi {clinicianName}, welcome to your dashboard!</h2>
        <div>
          <button
            className={`appointments-btn ${
              upcomingAppointments.length === 0 ? "disabled-btn" : ""
            }`}
            onClick={openAppointmentsModal}
            disabled={upcomingAppointments.length === 0}
            title={
              upcomingAppointments.length === 0
                ? "You do not have any upcoming appointments"
                : "View your upcoming appointments"
            }
          >
            View Appointments
          </button>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Appointments Modal */}
      {showAppointmentsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAppointmentsModal(false)}
        >
          <div
            className="appointments-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Your Appointments</h3>
            <div className="appointments-horizontal">
              {appointments.map((appt) => (
                <div key={appt.id} className={`appointment-card ${appt.status}`}>
                  <div className="appointment-time">
                    {new Date(appt.timestamp).toLocaleString()}
                  </div>
                  <div className="appointment-details">
                    <strong>Patient:</strong> {appt.patient_name}
                    {appt.notes && (
                      <span className="appointment-notes">
                        Notes: {appt.notes}
                      </span>
                    )}
                  </div>
                  <div className="appointment-status">
                    {appt.status.replace("_", " ")}
                  </div>
                  <div className="appointment-actions">
                    {appt.status === "booked" && (
                      <button
                        className="inprogress-btn"
                        onClick={() => updateStatus(appt.id, "in_progress")}
                      >
                        Mark In Progress
                      </button>
                    )}
                    {appt.status === "in_progress" && (
                      <button
                        className="completed-btn"
                        onClick={() => updateStatus(appt.id, "completed")}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Slots */}
      <p>Here are your slots for the current week:</p>
      <div className="week-grid">
        {weekDays.map((day, index) => (
          <div key={index} className="week-day-column">
            <h4>{day}</h4>
            {slots.map((slot, i) => {
              const bookedForSlot = bookedSlots[index]?.find(
                (s) => s.slot === slot
              );
              const statusClass = bookedForSlot
                ? bookedForSlot.status === "booked"
                  ? "booked"
                  : bookedForSlot.status === "in_progress"
                  ? "in-progress"
                  : "completed"
                : "available";
              return (
                <button
                  key={i}
                  className={`slot-btn ${statusClass}`}
                  disabled
                  title={
                    bookedForSlot
                      ? `${bookedForSlot.patientName} (${bookedForSlot.status.replace(
                          "_",
                          " "
                        )})`
                      : ""
                  }
                >
                  {slot}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
