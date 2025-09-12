import { useEffect, useState } from "react";
import "../styles.css";

export default function AvailableCliniciansModal({ timestamp, onClose, onBooking }) {
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!timestamp) return;
    const fetchClinicians = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/clinicians/available?timestamp=${encodeURIComponent(timestamp)}`);
        const data = await res.json();
        setClinicians(data.available_clinicians || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchClinicians();
  }, [timestamp]);

  const handleBook = async (clinician) => {
    const patient = JSON.parse(localStorage.getItem("patient"));
    if (!patient) return alert("Patient not logged in");

    try {
      const res = await fetch("http://localhost:5000/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          clinician_id: clinician.id,
          timestamp,
          notes: "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onBooking(clinician); // inform parent
        onClose();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Available Clinicians for {timestamp}</h3>
        <button className="close-btn" onClick={onClose}>X</button>
        {loading ? (
          <p>Loading...</p>
        ) : clinicians.length === 0 ? (
          <p>No clinicians available at this slot.</p>
        ) : (
          <ul className="clinician-list">
            {clinicians.map(c => (
              <li key={c.id}>
                <button onClick={() => handleBook(c)}>{c.name}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
