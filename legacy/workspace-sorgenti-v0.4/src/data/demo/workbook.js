// Ricostruito dal bundle fornito; comportamento originale conservato.
import { addDays, weekdayMondayFirst } from "../../domain/dates.js";
const dateToExcel = (e) =>
  Math.round(
    Date.UTC(+e.slice(0, 4), +e.slice(5, 7) - 1, +e.slice(8, 10)) / 864e5,
  ) + 25569;
const DEMO_PROJECTS = [
  ["P51", "Ampliamento Fiorentina", "Attivo"],
  ["M86", "Stadio Flaminio", "Attivo"],
  ["O80", "Milanello Training Center", "Attivo"],
  ["H05", "Stadio di Pisa", "Attivo"],
  ["I05", "Fiorentina Training Center / Viola Park", "Standby"],
  ["I04", "Capannoncino", "Attivo"],
  ["P13", "Stadio di Napoli", "Freeze"],
  ["P52", "Social housing Firenze", "Standby"],
  ["M01", "Livorno Porto a Mare", "Fermo"],
];
const FRANCESCO = "Francesco Diamanti";
const ALESSANDRO = "Alessandro Botrini";
const LISANDRO = "Lisandro Leyra";
function createDemoWorkbook(e) {
  const t = (x) => dateToExcel(addDays(e, x)),
    n = [
      [],
      [],
      ["", "", "", "Progetti"],
      [],
      ...DEMO_PROJECTS.map(([x, j]) => ["", "", "", `${x}_${j}`]),
      ["", "", "", "ND"],
    ],
    r = [];
  DEMO_PROJECTS.forEach(([x, j, p], d) => {
    ((r[31 + d] = []), (r[31 + d][10] = `${x}_${j}`), (r[31 + d][13] = p));
  });
  const l = [
      "N°",
      "",
      "Assigned To",
      "Typology",
      "Project",
      "Task Description",
      "Link Server",
      "Image",
      "Priority",
      "Task Name",
      "Start Date",
      "Dead Line",
      "Timing",
      "STATUS",
      "Shared",
      "Completed",
      "Date",
      "Not Validated",
      "Validated",
      "Comments",
    ],
    o = (x, j, p, d, m, k, N, w, E, S = {}) => {
      const O = [
        x,
        "",
        j,
        p,
        d,
        m,
        "",
        "",
        N,
        k,
        t(w),
        E === null ? "" : t(E),
        "",
        "",
        "",
        false,
        "",
        false,
        false,
        "",
      ];
      return (Object.entries(S).forEach(([M, ye]) => (O[+M] = ye)), O);
    },
    i = [
      ["TASK MANAGER"],
      [],
      l,
      o(
        1,
        FRANCESCO,
        "Grafica",
        "P51_Ampliamento Fiorentina",
        "Impaginare la brochure di presentazione dell'ampliamento.",
        "Brochure ampliamento U23",
        "Alta",
        -9,
        0,
      ),
      o(
        2,
        FRANCESCO,
        "Elaborati",
        "M86_Stadio Flaminio",
        "Controllare le tavole del museo dopo le indicazioni ricevute.",
        "Revisione tavole museo",
        "Alta",
        -12,
        -2,
        {
          19: "Mancano le quote nelle sezioni A-A e B-B.",
        },
      ),
      o(
        3,
        FRANCESCO,
        "Relazioni",
        "O80_Milanello Training Center",
        "Relazione sulla conferenza dei servizi con sintesi dei pareri.",
        "Relazione conferenza servizi",
        "Media",
        -6,
        3,
      ),
      o(
        4,
        FRANCESCO,
        "Coordinamento",
        "H05_Stadio di Pisa",
        "Raccolta dei contributi dei consulenti per il rilievo.",
        "Raccolta contributi consulenti",
        "Media",
        -3,
        1,
      ),
      o(
        5,
        FRANCESCO,
        "Elaborati",
        "P13_Stadio di Napoli",
        "Aggiornare il fascicolo del progetto con le ultime modifiche.",
        "Aggiornamento fascicolo",
        "Bassa",
        -30,
        -20,
        {
          15: true,
          16: t(-19),
          18: true,
        },
      ),
      o(
        6,
        FRANCESCO,
        "Modello",
        "I04_Capannoncino",
        "Verificare il modello 3D prima dell'invio al cliente.",
        "Verifica modello 3D",
        "Media",
        -4,
        -1,
      ),
      o(
        13,
        FRANCESCO,
        "Elaborati",
        "P52_Social housing Firenze",
        "Schemi distributivi per il confronto con la committenza.",
        "Schemi distributivi",
        "Media",
        -2,
        8,
      ),
      o(
        7,
        ALESSANDRO,
        "Elaborati",
        "M86_Stadio Flaminio",
        "Aggiornare le tavole con le ultime indicazioni ricevute.",
        "Aggiornamento tavole",
        "Alta",
        -5,
        0,
        {
          7: `https://drive.google.com/file/d/DEMO-1/view
https://drive.google.com/file/d/DEMO-2/view`,
        },
      ),
      o(
        8,
        ALESSANDRO,
        "Rendering",
        "P51_Ampliamento Fiorentina",
        "Preparare tre viste per il tavolo di presentazione.",
        "Viste di presentazione",
        "Media",
        -4,
        5,
        {
          6: "\\\\SERVER-STUDIO\\Progetti\\P51\\Rendering",
        },
      ),
      o(
        9,
        ALESSANDRO,
        "Elaborati",
        "O80_Milanello Training Center",
        "Computo preliminare delle superfici.",
        "Computo superfici",
        "Bassa",
        -15,
        -4,
        {
          19: "Verificare la superficie dei locali tecnici.",
        },
      ),
      o(
        10,
        LISANDRO,
        "Rilievo",
        "H05_Stadio di Pisa",
        "Restituzione del rilievo dei prospetti.",
        "Restituzione rilievo",
        "Alta",
        -8,
        -1,
      ),
      o(
        11,
        LISANDRO,
        "Coordinamento",
        "P52_Social housing Firenze",
        "Verbale della riunione con la committenza.",
        "Verbale riunione",
        "Bassa",
        -1,
        4,
      ),
      o(
        12,
        LISANDRO,
        "Elaborati",
        "I04_Capannoncino",
        "Pianta delle coperture.",
        "Pianta coperture",
        "Media",
        -10,
        2,
      ),
      [
        "",
        "",
        "",
        "",
        "P51_Ampliamento Fiorentina",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        false,
        "",
        false,
        false,
        "",
      ],
    ],
    a = [
      ["TACCUINO PROGETTI"],
      [
        "Progetto",
        "Inserita da",
        "Data inserimento",
        "Nota",
        "Status",
        "Data chiusura",
        "ID interno",
      ],
    ],
    u = (x, j) => {
      const p = DEMO_PROJECTS.find((d) => d[0] === x);
      (a.push([`${x}_${p[1]}`, "", "", "", "", "", `P:${x}`]),
        j.forEach(([d, m, k, N, w]) =>
          a.push(["", d, t(m), k, N, w === void 0 ? "" : t(w), `N:${x}`]),
        ),
        a.push(["", "", "", "", "", "", `N:${x}`]));
    };
  (u("M01", [
    [
      FRANCESCO,
      -60,
      "Concessione in attesa di rinnovo, nessuna attività fino a nuova comunicazione.",
      "🟡 Aperta",
    ],
  ]),
    u("M86", [
      [
        FRANCESCO,
        0,
        "Verificare il percorso di accesso al museo con il gruppo di progetto.",
        "🟡 Aperta",
      ],
      [
        ALESSANDRO,
        -1,
        "Aggiornare le tavole con le ultime indicazioni ricevute.",
        "🔵 In corso",
      ],
      [
        LISANDRO,
        -2,
        "Materiali ricevuti dal fornitore, catalogo caricato in cartella.",
        "✅ Chiusa",
        -2,
      ],
    ]),
    u("P51", [
      [
        ALESSANDRO,
        -3,
        "Concordato con la committenza di consegnare le brochure entro fine settimana.",
        "🔵 In corso",
      ],
      [
        FRANCESCO,
        -8,
        "Verificata la compatibilità delle quote con il rilievo.",
        "✅ Chiusa",
        -7,
      ],
    ]),
    u("O80", [
      [
        FRANCESCO,
        -5,
        "Attendere i pareri dei consulenti prima di chiudere la relazione.",
        "🟡 Aperta",
      ],
    ]),
    u("H05", [
      [
        LISANDRO,
        -4,
        "Rilievo dei prospetti da completare dopo il sopralluogo.",
        "🔵 In corso",
      ],
    ]),
    u("I04", [
      [
        ALESSANDRO,
        -20,
        "Il cliente chiede una variante per gli accessi carrabili.",
        "🟡 Aperta",
      ],
    ]),
    u("P13", [
      [
        FRANCESCO,
        -90,
        "Progetto in pausa: in attesa di indicazioni sul programma.",
        "🟡 Aperta",
      ],
    ]),
    u("P52", []));
  const c = `${e.slice(0, 4)}-01-01`,
    f = `${e.slice(0, 4)}-12-31`,
    v = [];
  for (let x = c; x <= f; x = addDays(x, 1))
    (x.slice(8) === "01" &&
      v.push({
        date: "",
        sep: x.slice(0, 7),
      }),
      v.push({
        date: x,
      }));
  const h = [
      ["CALENDARIO ORE"],
      [
        "Persona",
        "Progetto",
        "Note",
        ...v.map((x) => (x.sep ? `Mese ${x.sep}` : dateToExcel(x.date))),
      ],
    ],
    y = (x) => {
      const j = Math.sin(x) * 1e4;
      return j - Math.floor(j);
    },
    g = (x, j) => {
      (h.push([x]),
        j.forEach(([p, d, m], k) =>
          h.push([
            "",
            p,
            d,
            ...v.map((N, w) => {
              if (N.sep || N.date > e) return "";
              if (weekdayMondayFirst(N.date) >= 5) return k === 0 ? "OFF" : "";
              const S = y(m + w * 1.7);
              return S < 0.4
                ? ""
                : S < 0.5
                  ? "-"
                  : S < 0.55
                    ? 0
                    : k === 0
                      ? S > 0.9
                        ? 3.5
                        : 4
                      : S > 0.8
                        ? 2.5
                        : 2;
            }),
          ]),
        ));
    };
  return (
    g(FRANCESCO, [
      ["P51_Ampliamento Fiorentina", "Brochure", 1],
      ["O80_Milanello Training Center", "", 2],
      ["M86_Stadio Flaminio", "", 3],
    ]),
    g(ALESSANDRO, [
      ["M86_Stadio Flaminio", "", 4],
      ["P51_Ampliamento Fiorentina", "", 5],
      ["I04_Capannoncino", "", 6],
    ]),
    g(LISANDRO, [
      ["H05_Stadio di Pisa", "", 7],
      ["P52_Social housing Firenze", "", 8],
    ]),
    g("Doriana Mastro", [["H05_Stadio di Pisa", "", 9]]),
    g("Francesco Dall’O’", [
      ["I05_Fiorentina Training Center / Viola Park", "", 10],
    ]),
    {
      sheets: {
        "01_Dashboard": [],
        "02_TaskManager": i,
        "03_Note": a,
        "04_Ore": h,
        "#DV": n,
        "#InsightData": r,
      },
    }
  );
}
export {
  dateToExcel,
  DEMO_PROJECTS,
  FRANCESCO,
  ALESSANDRO,
  LISANDRO,
  createDemoWorkbook,
};
