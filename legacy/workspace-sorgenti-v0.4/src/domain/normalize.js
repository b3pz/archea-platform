// Ricostruito dal bundle fornito; comportamento originale conservato.
import { PROJECT_ALIASES } from "../config/sheets.js";
const normalizeText = (e) =>
  String(e ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
function projectCode(e) {
  const t = String(e ?? "")
    .trim()
    .match(/^([A-Za-z]+[0-9]+)(?=$|[\s_-])/);
  if (!t) return "";
  const n = t[1].toUpperCase();
  return PROJECT_ALIASES[n] ?? n;
}
function projectName(e) {
  return (
    String(e)
      .trim()
      .replace(/^[A-Za-z]+[0-9]+[\s_-]*/, "")
      .replace(/_/g, " ")
      .trim() || String(e).trim()
  );
}
const contentHash = (e) => {
  let t = 5381;
  for (let n = 0; n < e.length; n++) t = ((t << 5) + t + e.charCodeAt(n)) | 0;
  return (t >>> 0).toString(36);
};
const cellText = (e) => (e == null ? "" : String(e).trim());
const cellBoolean = (e) =>
  e === true ||
  (typeof e == "string" &&
    ["true", "vero", "si", "sì", "x", "1"].includes(e.trim().toLowerCase())) ||
  e === 1;
function findSheet(e, t) {
  const n = Object.keys(e).find(
    (r) => normalizeText(r) === normalizeText(t),
  );
  return n ? e[n] : void 0;
}
export {
  normalizeText,
  projectCode,
  projectName,
  contentHash,
  cellText,
  cellBoolean,
  findSheet,
};
