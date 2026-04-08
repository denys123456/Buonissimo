export const weeklySchedule = [
  "Luni - Marti: Inchis",
  "Miercuri - Joi: 11:00 - 21:30",
  "Vineri - Duminica: 11:00 - 22:30"
];

export function getOrderingAvailability(now = new Date()) {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  if (day === 1 || day === 2) {
    return {
      canOrder: false,
      message: "Momentan nu se pot plasa comenzi."
    };
  }

  const opensAt = 11 * 60;
  const closesAt = day >= 3 && day <= 4 ? 21 * 60 + 30 : 22 * 60 + 30;

  if (minutes < opensAt) {
    return {
      canOrder: false,
      message: "Momentan nu se pot plasa comenzi."
    };
  }

  if (minutes > closesAt) {
    return {
      canOrder: false,
      message: "Momentan nu se pot plasa comenzi."
    };
  }

  return {
    canOrder: true,
    message: ""
  };
}
