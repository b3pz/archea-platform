// Ricostruito dal bundle fornito; comportamento originale conservato.
import { normalizeText } from "../../domain/normalize.js";
function findHeaders(e, t, n) {
  let r = null;
  for (let l = 0; l < Math.min(n, e.length); l++) {
    const o = {};
    let i = 0;
    ((e[l] ?? []).forEach((a, u) => {
      const c = normalizeText(a);
      if (c) {
        for (const f of Object.keys(t))
          if (o[f] === void 0 && t[f].some((v) => normalizeText(v) === c)) {
            ((o[f] = u), i++);
            break;
          }
      }
    }),
      (!r || i > r.n) &&
        (r = {
          row: l,
          cols: o,
          n: i,
        }));
  }
  return r && r.n >= 3 ? r : null;
}
export { findHeaders };
