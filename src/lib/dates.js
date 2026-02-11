/**
 * All dates in local time, stored as YYYY-MM-DD.
 * Week starts on Monday.
 */

export function todayISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/**
 * @param {string} dateISO - YYYY-MM-DD
 * @param {boolean} weekStartsOnMonday
 * @returns {string} Monday of that week as YYYY-MM-DD
 */
export function startOfWeekISO(dateISO, weekStartsOnMonday = true) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const diff = weekStartsOnMonday ? (day === 0 ? -6 : 1 - day) : -day;
  date.setDate(date.getDate() + diff);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * @param {string} dateISO - any date in week
 * @returns {string[]} 7 ISO dates Mon–Sun
 */
export function getWeekDates(dateISO) {
  const start = startOfWeekISO(dateISO);
  const [y, m, d] = start.split("-").map(Number);
  const out = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(y, m - 1, d + i);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    out.push(`${yy}-${mm}-${dd}`);
  }
  return out;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatShortDay(dateISO) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return DAY_NAMES[date.getDay()];
}

export function formatShortDate(dateISO) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[date.getMonth()]}`;
}
