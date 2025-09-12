import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSelect from "./components/user-select-component";
import PatientLogin from "./components/login-component/patient-login";
import ClinicianLogin from "./components/login-component/clinician-login";
import ClinicianDashboard from "./components/dashboard-component/clinician-dashboard";
import PatientDashboard from "./components/dashboard-component/patient-dashboard";
import PatientRegister from "./components/register-component/patient-register";
import ClinicianRegister from "./components/register-component/clinician-register";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserSelect />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/clinician-login" element={<ClinicianLogin />} />
        <Route path="/patient-register" element={<PatientRegister />} />
        <Route path="/clinician-register" element={<ClinicianRegister />} />
        <Route path="/clinician-dashboard" element={<ClinicianDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}
