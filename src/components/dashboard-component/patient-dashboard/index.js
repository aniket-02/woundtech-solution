import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import AvailableCliniciansModal from "../../../modal";

export default function PatientDashboard() {
  const [patientName, setPatientName] = useState("Patient");
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [patientId, setPatientId] = useState(null);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

  // ---------------- Load patient info and fetch booked slots ----------------
  useEffect(() => {
    const patientData = localStorage.getItem("patient");
    if (patientData) {
      const parsed = JSON.parse(patientData);
      setPatientName(parsed.name);
      setPatientId(parsed.id);

      // Fetch booked visits for this patient
      fetch(`http://localhost:5000/api/visits/patient/${parsed.id}`)
        .then((res) => res.json())
        .then((data) => {
          const booked = {};
          const today = new Date();
          data.visits.forEach((visit) => {
            const visitDate = new Date(visit.timestamp);
            const dayIndex = (visitDate.getDay() + 6) % 7; // map Sun=0..Sat=6 to Mon=0..Sun=6
            const slotTime = `${visitDate.getHours().toString().padStart(2, "0")}:00-${(visitDate.getHours()+1).toString().padStart(2,"0")}:00`;
            if (!booked[dayIndex]) booked[dayIndex] = [];
            booked[dayIndex].push(slotTime);
          });
          setBookedSlots(booked);
        })
        .catch((err) => console.error(err));
    } else {
      navigate("/"); 
    }
  }, [navigate]);

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
      return { ...prev, [dayIndex]: [...daySlots, slot] };
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Hi {patientName}, welcome to your dashboard!!!</h2>
        <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
      </div>

      <p>Select a slot below to book an appointment</p>
      <div className="week-grid">
        {weekDays.map((day, index) => (
          <div key={index} className="week-day-column">
            <h4>{day}</h4>
            {slots.map((slot, i) => {
              const isBooked = bookedSlots[index]?.includes(slot);
              return (
                <button
                  key={i}
                  className={`slot-btn ${isBooked ? "booked" : "available"}`}
                  onClick={() => !isBooked && handleSlotClick(index, slot)}
                  disabled={isBooked}
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
