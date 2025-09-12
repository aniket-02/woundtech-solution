export const getWeekRange = (today = new Date()) => {
  const startOfWeek = new Date(today);   // make a copy of today
  const day = today.getDay();            // get day of week (0 = Sunday, 1 = Monday, … 6 = Saturday)

  // Calculate how many days to shift to get to Monday
  const diff = (day === 0 ? -6 : 1) - day; // if Sunday (0), go back 6 days; otherwise, go back to Monday
  startOfWeek.setDate(today.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);      // reset time to 00:00:00

  // End of week = Monday + 6 days
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);   // set to 23:59:59.999

  return { startOfWeek, endOfWeek };
};

export const deriveBookedSlots = (visits, startOfWeek, endOfWeek, role) => {
  const newBookedSlots = {};
  visits.forEach((visit) => {
    const visitDate = new Date(visit.timestamp);

    // only include visits within this week's range
    if (visitDate >= startOfWeek && visitDate <= endOfWeek) {
      // Monday=0, Tuesday=1 ... Sunday=6
      const dayIndex = (visitDate.getDay() + 6) % 7; 
      // create slot string like "09:00-10:00"
      const hour = visitDate.getHours();
      const slot = `${hour.toString().padStart(2, "0")}:00-${(hour + 1).toString().padStart(2, "0")}:00`;

      if (!newBookedSlots[dayIndex]) newBookedSlots[dayIndex] = [];
      // push visit info
      newBookedSlots[dayIndex].push({
        slot,
        clinicianName: role === 'patient' ? visit.clinician_name : visit.patient_name,
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
