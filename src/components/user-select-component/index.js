import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { actions } from "./constants";
import "./styles.css";

function UserSelect() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleNavigation = (action) => {
    if (role === "patient") {
      navigate(`/patient-${action}`);
    } else if (role === "clinician") {
      navigate(`/clinician-${action}`);
    }
  };

  return (
    <div className="user-select-container">
      <div className="user-select-card">
        <h2 className="header">Welcome</h2>
        <p className="subtext">Choose your persona</p>

        <select
          className="role-selector"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="" disabled hidden>
            Select your role
          </option>
          <option value="patient">Patient</option>
          <option value="clinician">Clinician</option>
        </select>

        <div className="card-buttons">
          {actions.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleNavigation(value)}
              disabled={!role}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserSelect;
