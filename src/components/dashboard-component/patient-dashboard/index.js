import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import AvailableCliniciansModal from "./modal";

import { weekDays, generateSlots } from "../constants";
import { getWeekRange, deriveBookedSlotsPatient } from "../utils";

export default function PatientDashboard() {
  const [patientName, setPatientName] = useState("Patient");
  const [bookedSlots, setBookedSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const slots = generateSlots();

  useEffect(() => {
    const patientData = localStorage.getItem("patient");
    if (patientData) {
      const parsed = JSON.parse(patientData);
      setPatientName(parsed.name);
      fetchPatientBookings(parsed.id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchPatientBookings = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/visits/patient/${id}`);
      const data = await res.json();
      const { startOfWeek, endOfWeek } = getWeekRange();
      const visits = data.visits || [];
      const newBookedSlots = deriveBookedSlotsPatient(visits, startOfWeek, endOfWeek);

      // Store slot, clinician name, and status
      const slotsByDay = {};
      Object.keys(newBookedSlots).forEach((dayIndex) => {
        slotsByDay[dayIndex] = newBookedSlots[dayIndex].map((v) => ({
          slot: v.slot,
          clinicianName: v.clinicianName || "Unknown",
          status: v.status || "booked", // fallback
        }));
      });

      setBookedSlots(slotsByDay);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("patient");
    navigate("/");
  };

  const handleSlotClick = (dayIndex, slot) => {
    const today = new Date();
    const dayDate = new Date(today.setDate(today.getDate() - today.getDay() + dayIndex + 1));
    const timestamp = `${dayDate.toISOString().split("T")[0]}T${slot.split("-")[0]}:00`;

    setSelectedSlot({ dayIndex, slot, timestamp });
    setShowModal(true);
  };

  const handleBookingConfirmed = (clinician) => {
    const { dayIndex, slot } = selectedSlot;
    setBookedSlots((prev) => {
      const daySlots = prev[dayIndex] || [];
      return {
        ...prev,
        [dayIndex]: [
          ...daySlots,
          { slot, clinicianName: clinician.name, status: "booked" },
        ],
      };
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="header">Hi {patientName}, welcome to your dashboard!!!</h2>
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      <p className="subtext">Select a slot below to book an appointment</p>
      <div className="week-grid">
        {weekDays.map((day, index) => (
          <div key={index} className="week-day-column">
            <h4 className="week-day">{day}</h4>
            {slots.map((slot, i) => {
              const bookedInfo = bookedSlots[index]?.find((s) => s.slot === slot);
              const isBooked = !!bookedInfo;
              return (
                <button
                  key={i}
                  className={`slot-btn ${
                    isBooked ? bookedInfo.status : "available"
                  }`}
                  onClick={() => !isBooked && handleSlotClick(index, slot)}
                  disabled={isBooked}
                  title={
                    isBooked
                      ? `Booked with ${bookedInfo.clinicianName} (${bookedInfo.status})`
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

      {showModal && selectedSlot && (
        <AvailableCliniciansModal
          timestamp={selectedSlot.timestamp}
          onClose={() => setShowModal(false)}
          onBooking={handleBookingConfirmed}
        />
      )}
    </div>
  );
}
