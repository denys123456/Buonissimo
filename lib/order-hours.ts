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
      message: "Luni si marti suntem inchisi."
    };
  }

  const opensAt = 11 * 60 + 10;
  const lastOrderAt = day >= 3 && day <= 4 ? 21 * 60 : 22 * 60;

  if (minutes < opensAt) {
    return {
      canOrder: false,
      message: "Comenzile se pot plasa dupa ora 11:10."
    };
  }

  if (minutes > lastOrderAt) {
    return {
      canOrder: false,
      message: "Ultima comanda se poate plasa cu 30 de minute inainte de inchidere."
    };
  }

  return {
    canOrder: true,
    message: ""
  };
}
