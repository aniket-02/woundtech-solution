import "../styles.css";

export default function AppointmentCard({ appt, updateStatus }) {
  return (
    <div className={`appointment-card ${appt.status}`}>
      <div className="appointment-time">
        {new Date(appt.timestamp).toLocaleString()}
      </div>

      <div className="appointment-details">
        <strong>Patient:</strong> {appt.patient_name}
        {appt.notes && <span className="appointment-notes">Notes: {appt.notes}</span>}
      </div>

      <div className="appointment-status">
        {appt.status.replace("_", " ").toUpperCase()}
      </div>

      <div className="appointment-actions">
        {appt.status === "booked" && (
          <button onClick={() => updateStatus(appt.id, "in_progress")}>
            Mark In Progress
          </button>
        )}
        {appt.status === "in_progress" && (
          <button onClick={() => updateStatus(appt.id, "completed")}>
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );
}
