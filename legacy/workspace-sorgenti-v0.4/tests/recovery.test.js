import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createDemoWorkbook } from "../src/data/demo/workbook.js";
import { buildDataset } from "../src/data/build.js";
import { taskStatus, dueInfo } from "../src/domain/tasks.js";
import { parseHoursCell } from "../src/data/parsers/hours.js";
import { parseDate, addDays, todayInRome } from "../src/domain/dates.js";
import { periodRange, summarizeHours } from "../src/domain/hours.js";
import { projectCode } from "../src/domain/normalize.js";
import { canSeeHours, visibleTasks } from "../src/config/permissions.js";
import { importExcel } from "../src/data/adapters/excel.js";
import * as XLSX from "xlsx";
const bundle = readFileSync(
  new URL("./fixtures/original-bundle.js", import.meta.url),
  "utf8",
);
const core =
  "const " +
  bundle
    .slice(
      bundle.indexOf("In={tasks:"),
      bundle.indexOf("const gd=T.createContext"),
    )
    .replaceAll("import.meta.url", '"unused"');
const periods = bundle.slice(
  bundle.indexOf("const ji="),
  bundle.indexOf(",Ym="),
);
const sandbox = { Date, Intl };
vm.runInNewContext(
  core +
    "\n" +
    periods +
    ";globalThis.reference={build:vd,demo:Em,status:kt,due:Sm,hoursCell:Cm,date:pn,period:Za,summary:Ja};",
  sandbox,
);
const ref = sandbox.reference;
const json = (value) => JSON.parse(JSON.stringify(value));
const withoutTimestamp = (data) => {
  const result = json(data);
  delete result.meta.loadedAt;
  return result;
};
const today = "2026-10-02";
const basicTask = {
  titolo: "Prova",
  descrizione: "",
  commenti: "",
  completed: false,
  validated: false,
};
describe("Regressione rispetto al bundle fornito", () => {
  it("ricostruisce lo stesso dataset completo", () => {
    const current = buildDataset(
      createDemoWorkbook(today),
      "demo",
      "Regression",
    );
    expect(withoutTimestamp(current)).toEqual(
      withoutTimestamp(ref.build(ref.demo(today), "demo", "Regression")),
    );
    expect(current.task).toHaveLength(13);
  });
  it("conserva la priorità fra revisione, scadenza e validazione", () => {
    const cases = [
      basicTask,
      { ...basicTask, scadenza: "2026-10-01" },
      { ...basicTask, scadenza: today },
      { ...basicTask, scadenza: "2026-10-03" },
      { ...basicTask, scadenza: "2026-10-06" },
      { ...basicTask, commenti: "Correggere", scadenza: "2026-10-01" },
      { ...basicTask, completed: true, validated: true },
      {
        ...basicTask,
        completed: true,
        validated: true,
        dataChiusura: today,
        commenti: "Storico",
      },
    ];
    for (const task of cases) {
      expect(taskStatus(task, today)).toBe(ref.status(task, today));
      expect(dueInfo(task, today)).toEqual(json(ref.due(task, today)));
    }
    expect(taskStatus(cases[6], today)).toBe("in_lavorazione");
    expect(taskStatus(cases[7], today)).toBe("validata");
  });
  it("interpreta OFF, vuoti, zero, decimali ed errori come prima", () => {
    for (const value of [
      null,
      undefined,
      "",
      "-",
      "–",
      "OFF",
      "off",
      0,
      "0",
      2.5,
      "3,5",
      "3.5",
      "errore",
      NaN,
    ])
      expect(parseHoursCell(value)).toBe(ref.hoursCell(value));
  });
  it("conserva le date Excel e italiane e riconosce date impossibili", () => {
    for (const value of [
      46297,
      "02/10/2026",
      "2026-10-02",
      "31/02/2026",
      "testo",
      null,
    ])
      expect(parseDate(value)).toBe(ref.date(value));
    expect(parseDate("31/02/2026")).toBeUndefined();
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(todayInRome(new Date("2026-10-01T22:30:00Z"))).toBe("2026-10-02");
  });
  it("conserva periodi e totali ore, anche per intervalli personalizzati", () => {
    const data = buildDataset(createDemoWorkbook(today), "demo", "Regression");
    for (const period of ["giorno", "settimana", "mese", "anno", "custom"]) {
      const custom = { from: "2026-10-02", to: "2026-09-01" },
        range = periodRange(period, today, custom);
      expect(range).toEqual(json(ref.period(period, today, custom)));
      expect(summarizeHours(data.ore, range)).toEqual(
        json(ref.summary(data.ore, range)),
      );
    }
    expect(periodRange("settimana", today).from).toBe("2026-09-28");
  });
  it("mantiene progetti attivi in cima, alias e persone escluse", () => {
    const data = buildDataset(createDemoWorkbook(today), "demo", "Regression");
    const firstInactive = data.progetti.findIndex(
      (project) => project.stato !== "Attivo",
    );
    expect(
      data.progetti
        .slice(firstInactive)
        .every((project) => project.stato !== "Attivo"),
    ).toBe(true);
    expect(projectCode("P16_Progetto")).toBe("P13");
    expect(
      data.persone
        .filter((person) => !person.inRiepiloghiOre)
        .map((person) => person.id),
    ).toEqual(["dmastro", "fdallo"]);
  });
  it("mantiene la visibilità prevista per responsabile e membro", () => {
    const manager = { id: "manager", ruolo: "responsabile" },
      member = { id: "member", ruolo: "membro" },
      other = { id: "other", ruolo: "membro" };
    expect(canSeeHours(member, other)).toBe(false);
    expect(canSeeHours(manager, other)).toBe(true);
    const tasks = [{ person: "member" }, { person: "other" }];
    expect(
      visibleTasks(member, tasks, (task, person) => task.person === person.id),
    ).toEqual([tasks[0]]);
  });
  it("importa un vero workbook XLSX attraverso il nuovo adapter", async () => {
    const raw = createDemoWorkbook(today),
      workbook = XLSX.utils.book_new();
    for (const [name, rows] of Object.entries(raw.sheets)) {
      const sheet = XLSX.utils.aoa_to_sheet(rows);
      if (sheet["!ref"]) {
        const range = XLSX.utils.decode_range(sheet["!ref"]);
        range.s = { r: 0, c: 0 };
        sheet["!ref"] = XLSX.utils.encode_range(range);
      }
      XLSX.utils.book_append_sheet(workbook, sheet, name);
    }
    const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const imported = await importExcel({
      name: "test.xlsx",
      arrayBuffer: async () => bytes,
    });
    expect(withoutTimestamp(imported)).toEqual(
      withoutTimestamp(
        buildDataset(raw, "excel", "Importazione statica: test.xlsx"),
      ),
    );
  });
});
