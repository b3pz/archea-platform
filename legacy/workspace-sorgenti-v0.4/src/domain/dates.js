// Ricostruito dal bundle fornito; comportamento originale conservato.
import { APP_TIMEZONE } from "../config/sheets.js";
function todayInRome(e = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(e);
}
const dateToUtc = (e) => {
  const [t, n, r] = e.split("-").map(Number);
  return Date.UTC(t, n - 1, r);
};
const utcToDate = (e) => new Date(e).toISOString().slice(0, 10);
const addDays = (e, t) => utcToDate(dateToUtc(e) + t * 864e5);
const daysBetween = (e, t) => Math.round((dateToUtc(e) - dateToUtc(t)) / 864e5);
const weekdayMondayFirst = (e) => (new Date(dateToUtc(e)).getUTCDay() + 6) % 7;
const isDateString = (e) =>
  typeof e == "string" && /^\d{4}-\d{2}-\d{2}$/.test(e);
function excelDate(e) {
  return utcToDate(Date.UTC(1899, 11, 30) + Math.floor(e) * 864e5);
}
function parseDate(e) {
  if (typeof e == "number" && e > 36526 && e < 73050) return excelDate(e);
  if (typeof e != "string") return;
  const t = e.trim();
  let n = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (n) return validDate(+n[3], +n[2], +n[1]);
  if (((n = t.match(/^(\d{4})-(\d{2})-(\d{2})/)), n))
    return validDate(+n[1], +n[2], +n[3]);
}
function validDate(e, t, n) {
  const r = `${e}-${String(t).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
  return utcToDate(dateToUtc(r)) === r ? r : void 0;
}
function parseTime(e) {
  if (typeof e == "number" && e > 0 && e < 1) {
    const t = Math.round(e * 1440);
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  }
  if (typeof e == "string") {
    const t = e.trim().match(/^(\d{1,2})[:.](\d{2})/);
    if (t) return `${t[1].padStart(2, "0")}:${t[2]}`;
  }
}
const dateFormatter = (e) =>
  new Intl.DateTimeFormat("it-IT", {
    timeZone: "UTC",
    ...e,
  });
const calendarDate = (e) => new Date(dateToUtc(e));
const formatShortDate = (e) =>
  dateFormatter({
    day: "numeric",
    month: "short",
  })
    .format(calendarDate(e))
    .replace(".", "");
const formatFullDate = (e) =>
  dateFormatter({
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(calendarDate(e));
const formatToday = (e) => {
  const t = dateFormatter({
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(calendarDate(e));
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const formatMonth = (e) =>
  dateFormatter({
    month: "long",
    year: "numeric",
  }).format(calendarDate(e));
export {
  todayInRome,
  dateToUtc,
  utcToDate,
  addDays,
  daysBetween,
  weekdayMondayFirst,
  isDateString,
  excelDate,
  parseDate,
  validDate,
  parseTime,
  dateFormatter,
  calendarDate,
  formatShortDate,
  formatFullDate,
  formatToday,
  formatMonth,
};
