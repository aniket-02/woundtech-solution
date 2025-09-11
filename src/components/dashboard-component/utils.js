export const getWeekRange = (today = new Date()) => {
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday = start
  startOfWeek.setDate(today.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

export const deriveBookedSlots = (visits, startOfWeek, endOfWeek) => {
  const newBookedSlots = {};
  visits.forEach((visit) => {
    const visitDate = new Date(visit.timestamp);
    if (visitDate >= startOfWeek && visitDate <= endOfWeek) {
      const dayIndex = (visitDate.getDay() + 6) % 7; 
      const hour = visitDate.getHours();
      const slot = `${hour.toString().padStart(2, "0")}:00-${(hour + 1).toString().padStart(2, "0")}:00`;

      if (!newBookedSlots[dayIndex]) newBookedSlots[dayIndex] = [];
      newBookedSlots[dayIndex].push({
        slot,
        patientName: visit.patient_name,
        status: visit.status,
      });
    }
  });
  return newBookedSlots;
};

export const fetchClinicianVisits = async (clinicianId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/visits/clinician/${clinicianId}`);
    const data = await res.json();
    return data.visits || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};
