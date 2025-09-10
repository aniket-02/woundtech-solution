import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";

function UserSelect() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome</h2>
        <p className="subtext">Choose your persona</p>

        {/* Dropdown with placeholder */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "10px",
            color: role ? "#1e293b" : "#9ca3af", // gray placeholder text
          }}
        >
          <option value="" disabled hidden>
            Select your role
          </option>
          <option value="patient">Patient</option>
          <option value="clinician">Clinician</option>
        </select>

        {/* Login & Register buttons */}
        <div className="card-buttons" style={{ marginTop: "15px" }}>
          <button
            type="button"
            onClick={() => {
              if (role === "patient") navigate("/patient-login");
              else if (role === "clinician") navigate("/clinician-login");
            }}
            disabled={!role}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              if (role === "patient") navigate("/patient-register");
              else if (role === "clinician") navigate("/clinician-register");
            }}
            disabled={!role}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserSelect;
