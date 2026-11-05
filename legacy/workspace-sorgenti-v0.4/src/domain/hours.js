// Ricostruito dal bundle fornito; comportamento originale conservato.
import {
  formatFullDate,
  addDays,
  weekdayMondayFirst,
  formatShortDate,
  formatMonth,
} from "./dates.js";
const daysInMonth = (e, t) => new Date(Date.UTC(e, t, 0)).getUTCDate();
const padTwo = (e) => String(e).padStart(2, "0");
function periodRange(period, anchorDate, custom) {
  const [year, month] = anchorDate.split("-").map(Number);
  switch (period) {
    case "giorno":
      return {
        from: anchorDate,
        to: anchorDate,
        label: formatFullDate(anchorDate),
      };
    case "settimana": {
      const o = addDays(anchorDate, -weekdayMondayFirst(anchorDate)),
        i = addDays(o, 6);
      return {
        from: o,
        to: i,
        label: `${formatShortDate(o)} – ${formatShortDate(i)}`,
      };
    }
    case "mese":
      return {
        from: `${year}-${padTwo(month)}-01`,
        to: `${year}-${padTwo(month)}-${padTwo(daysInMonth(year, month))}`,
        label: formatMonth(anchorDate),
      };
    case "anno":
      return {
        from: `${year}-01-01`,
        to: `${year}-12-31`,
        label: String(year),
      };
    case "custom": {
      let o = (custom == null ? void 0 : custom.from) ?? anchorDate,
        i = (custom == null ? void 0 : custom.to) ?? anchorDate;
      return (
        o > i && ([o, i] = [i, o]),
        {
          from: o,
          to: i,
          label: `${formatShortDate(o)} – ${formatShortDate(i)}`,
        }
      );
    }
  }
}
function shiftPeriod(period, anchorDate, offset) {
  const [year, month, day] = anchorDate.split("-").map(Number);
  if (period === "giorno") return addDays(anchorDate, offset);
  if (period === "settimana") return addDays(anchorDate, 7 * offset);
  if (period === "mese") {
    const i = new Date(Date.UTC(year, month - 1 + offset, 1));
    return `${i.getUTCFullYear()}-${padTwo(i.getUTCMonth() + 1)}-${padTwo(Math.min(day, daysInMonth(i.getUTCFullYear(), i.getUTCMonth() + 1)))}`;
  }
  return `${year + offset}-${padTwo(month)}-${padTwo(Math.min(day, daysInMonth(year + offset, month)))}`;
}
const inPeriod = (e, t) => e.data >= t.from && e.data <= t.to;
const roundHours = (e) => Math.round(e * 1e6) / 1e6;
function summarizeHours(registrations, range) {
  const selected = registrations.filter((y) => inPeriod(y, range)),
    total = roundHours(selected.reduce((y, g) => y + g.ore, 0)),
    dateSequence = (y, g) => {
      const x = [];
      for (let j = y; j <= g; j = addDays(j, 1)) x.push(j);
      return x;
    },
    dayCount = dateSequence(range.from, range.to).length,
    byDate = new Map(),
    byMonth = new Map();
  for (const y of selected) {
    byDate.set(y.data, (byDate.get(y.data) ?? 0) + y.ore);
    const g = y.data.slice(0, 7);
    byMonth.set(g, (byMonth.get(g) ?? 0) + y.ore);
  }
  const weekLabels = ["L", "M", "M", "G", "V", "S", "D"],
    monthLabels = ["G", "F", "M", "A", "M", "G", "L", "A", "S", "O", "N", "D"];
  let bars;
  if (dayCount > 62) {
    const y = [];
    for (
      let g = range.from.slice(0, 7);
      g <= range.to.slice(0, 7);
      g = shiftPeriod("mese", g + "-01", 1).slice(0, 7)
    )
      y.push(g);
    bars = y.map((g) => ({
      key: g,
      label: monthLabels[+g.slice(5) - 1],
      ore: roundHours(byMonth.get(g) ?? 0),
    }));
  } else
    bars = dateSequence(range.from, range.to).map((y) => ({
      key: y,
      label:
        dayCount <= 7 ? weekLabels[weekdayMondayFirst(y)] : String(+y.slice(8)),
      ore: roundHours(byDate.get(y) ?? 0),
    }));
  const projectTotals = new Map();
  for (const y of selected)
    projectTotals.set(
      y.progettoCodice,
      (projectTotals.get(y.progettoCodice) ?? 0) + y.ore,
    );
  const perProject = [...projectTotals]
    .map(([y, g]) => ({
      codice: y,
      ore: roundHours(g),
    }))
    .filter((y) => y.ore !== 0)
    .sort((y, g) => g.ore - y.ore);
  return {
    totale: total,
    barre: bars,
    perProgetto: perProject,
  };
}
const formatHours = (e) =>
  `${new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 2,
  }).format(e)} h`;
const chartCeiling = (e) =>
  [4, 8, 12, 16, 20, 40, 80, 160, 320, 640, 1280].find((n) => n >= e) ??
  Math.ceil(e / 100) * 100;
export {
  daysInMonth,
  padTwo,
  periodRange,
  shiftPeriod,
  inPeriod,
  roundHours,
  summarizeHours,
  formatHours,
  chartCeiling,
};
