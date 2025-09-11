import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function ClinicianLogin() {
  const [clinicianId, setClinicianId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clinicianId || !password) {
      alert("Please enter clinician ID and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/clinician-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinician_id: clinicianId.trim(), // ✅ match backend key
          password: password.trim()
        }),
      });

      const data = await response.json();

      if (data.clinician && data.clinician.name) {
        localStorage.setItem("clinician", JSON.stringify(data.clinician));
        navigate("/clinician-dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Please check backend and try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Clinician Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your clinician ID"
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
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
