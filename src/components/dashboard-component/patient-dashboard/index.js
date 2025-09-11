import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import AvailableCliniciansModal from "./modal";

import { weekDays, generateSlots } from "../constants";
import { fetchClinicianVisits, getWeekRange, deriveBookedSlots } from "../utils";

export default function PatientDashboard() {
  const [patientName, setPatientName] = useState("Patient");
  const [patientId, setPatientId] = useState(null);
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
      setPatientId(parsed.id);
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
      const newBookedSlots = deriveBookedSlots(visits, startOfWeek, endOfWeek);

      // Transform for patient UI: only store slot strings
      const slotsByDay = {};
      Object.keys(newBookedSlots).forEach((dayIndex) => {
        slotsByDay[dayIndex] = newBookedSlots[dayIndex].map((v) => v.slot);
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

  const handleBookingConfirmed = () => {
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
