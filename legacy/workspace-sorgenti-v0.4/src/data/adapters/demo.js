// Ricostruito dal bundle fornito; comportamento originale conservato.
import { buildDataset } from "../build.js";
import { createDemoWorkbook } from "../demo/workbook.js";
import { todayInRome } from "../../domain/dates.js";
const demoAdapter = {
  async load() {
    return buildDataset(
      createDemoWorkbook(todayInRome()),
      "demo",
      "Dati dimostrativi fittizi",
    );
  },
};
export { demoAdapter };
