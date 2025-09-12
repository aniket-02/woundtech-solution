import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function ClinicianRegister() {
  const [name, setName] = useState("");
  const [clinicianId, setClinicianId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/clinicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, clinician_id: clinicianId, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate("/clinician-login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="header">Clinician Registration</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter your Clinician ID"
            value={clinicianId}
            onChange={(e) => setClinicianId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={!name || !clinicianId || !password}>Register</button>
        </form>
      </div>
    </div>
  );
}
