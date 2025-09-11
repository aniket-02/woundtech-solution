import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

import { weekDays, generateSlots } from "../constants";
import { getWeekRange, fetchClinicianVisits, deriveBookedSlotsClinician } from "../utils";
import AppointmentCard from "./modal";

export default function ClinicianDashboard() {
  const [clinicianName, setClinicianName] = useState("Clinician");
  const [clinicianId, setClinicianId] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  const navigate = useNavigate();
  const slots = generateSlots();

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

  const fetchVisits = useCallback(async () => {
    if (!clinicianId) return;

    const visits = await fetchClinicianVisits(clinicianId);
    setAppointments(visits);

    const { startOfWeek, endOfWeek } = getWeekRange();
    const newBookedSlots = deriveBookedSlotsClinician(visits, startOfWeek, endOfWeek);
    setBookedSlots(newBookedSlots);
  }, [clinicianId]);

  useEffect(() => {
    if (clinicianId) fetchVisits();
  }, [clinicianId, fetchVisits]);

  const openAppointmentsModal = () => setShowAppointmentsModal(true);

  const updateStatus = async (visitId, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/visits/${visitId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchVisits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("clinician");
    navigate("/");
  };

  const upcomingAppointments = appointments.filter(
    (appt) => appt.status === "booked" || appt.status === "in_progress"
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Hi {clinicianName}, welcome to your dashboard!</h2>
        <div>
          <button
            className={`appointments-btn ${upcomingAppointments.length === 0 ? "disabled-btn" : ""}`}
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

      {showAppointmentsModal && (
        <div
          className="modal-overlay"
          role="button"
          tabIndex={0}
          onClick={() => setShowAppointmentsModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setShowAppointmentsModal(false);
            }
          }}
        >
          <div className="appointments-modal">
            <h3>Your Appointments</h3>
            <div className="appointments-horizontal">
              {appointments.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} updateStatus={updateStatus} />
              ))}
            </div>
          </div>
        </div>
      )}

      <p>Here are your slots for the current week:</p>
      <div className="week-grid">
        {weekDays.map((day, index) => (
          <div key={index} className="week-day-column">
            <h4>{day}</h4>
            {slots.map((slot, i) => {
              const bookedForSlot = bookedSlots[index]?.find((s) => s.slot === slot);
              const statusClass = bookedForSlot
                ? bookedForSlot.status === "booked"
                  ? "booked"
                  : bookedForSlot.status === "in_progress"
                  ? "in_progress"
                  : "completed"
                : "available";
              return (
                <button
                  key={i}
                  className={`slot-btn ${statusClass}`}
                  disabled
                  title={bookedForSlot ? `${bookedForSlot.patientName} (${bookedForSlot.status.replace("_", " ")})` : ""}
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
