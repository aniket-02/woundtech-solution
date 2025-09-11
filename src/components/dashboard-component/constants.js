export const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const generateSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    const start = hour.toString().padStart(2, "0") + ":00";
    const end = (hour + 1).toString().padStart(2, "0") + ":00";
    slots.push(`${start}-${end}`);
  }
  return slots;
};