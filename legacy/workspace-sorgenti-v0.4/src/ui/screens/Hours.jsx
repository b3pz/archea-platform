// Ricostruito dal bundle fornito; comportamento originale conservato.
import React from "react";
import { useApp } from "../context.jsx";
import { canSeeHours, isManager } from "../../config/permissions.js";
import { normalizeText } from "../../domain/normalize.js";
import {
  periodRange,
  summarizeHours,
  chartCeiling,
  shiftPeriod,
  formatHours,
} from "../../domain/hours.js";
import {
  isDateString,
  formatShortDate,
  formatFullDate,
} from "../../domain/dates.js";
import { Avatar, SegmentedControl } from "../components/common.jsx";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from "../components/icons.jsx";
const PERIOD_OPTIONS = [
  ["giorno", "Giorno"],
  ["settimana", "Sett."],
  ["mese", "Mese"],
  ["anno", "Anno"],
  ["custom", "Custom"],
];
function HoursScreen() {
  const { data: data, viewer: viewer, today: today, language } = useApp(),
    [period, setPeriod] = React.useState("settimana"),
    [anchorDate, setAnchorDate] = React.useState(today),
    [customRange, setCustomRange] = React.useState({
      from: today.slice(0, 8) + "01",
      to: today,
    }),
    [personId, setPersonId] = React.useState(null),
    people = React.useMemo(
      () =>
        data && viewer
          ? data.persone.filter(
              (S) => S.inRiepiloghiOre && canSeeHours(viewer, S),
            )
          : [],
      [data, viewer],
    ),
    selectedPerson =
      people.find((S) => S.id === personId) ??
      people.find((S) => S.id === (viewer == null ? void 0 : viewer.id)) ??
      people[0],
    registrations = React.useMemo(
      () =>
        data && selectedPerson
          ? data.ore.filter(
              (S) =>
                normalizeText(S.persona) === normalizeText(selectedPerson.nome),
            )
          : [],
      [data, selectedPerson],
    ),
    range = periodRange(period, anchorDate, customRange),
    summary = React.useMemo(
      () => summarizeHours(registrations, range),
      [registrations, range.from, range.to],
    ),
    todayHours = React.useMemo(
      () => summarizeHours(registrations, periodRange("giorno", today)).totale,
      [registrations, today],
    );
  if (!data || !viewer) return null;
  const en = language === 'en';
  if (!selectedPerson)
    return (
      <>
        <h1 className="big title-row">{en ? "My hours" : "Le mie ore"}</h1>
        <p className="empty">{en ? "No hours available for this person." : "Nessuna ora disponibile per questa persona."}</p>
      </>
    );
  const axisMax = chartCeiling(Math.max(0, ...summary.barre.map((S) => S.ore))),
    ticks = [0, 1, 2, 3, 4].map((S) => (axisMax / 4) * S),
    historicalHours = registrations.reduce((S, O) => S + O.ore, 0),
    denseChart = summary.barre.length > 12,
    nameForProject = (S) => {
      var O;
      return (
        ((O = data.progetti.find((M) => M.codice === S)) == null
          ? void 0
          : O.nome) ?? ""
      );
    },
    maxProjectHours = Math.max(0, ...summary.perProgetto.map((S) => S.ore)),
    selectDate = (S) => isDateString(S) && setAnchorDate(S);
  return (
    <>
      <h1 className="big title-row">
        {selectedPerson.id === viewer.id
          ? (en ? "My hours" : "Le mie ore")
          : `${en ? 'Hours' : 'Ore'} · ${selectedPerson.nome.split(" ")[0]}`}
      </h1>
      <p className="sub">{selectedPerson.nome}</p>
      {isManager(viewer) && people.length > 1 && (
        <div className="team compact">
          {people.map((S) => (
            <Avatar
              name={S.nome}
              size={40}
              active={S.id === selectedPerson.id}
              onClick={() => setPersonId(S.id)}
              label={`Ore di ${S.nome}`}
              key={S.id}
            />
          ))}
        </div>
      )}
      <SegmentedControl
        label="Periodo"
        value={period}
        onChange={setPeriod}
        options={en ? [["giorno","Day"],["settimana","Week"],["mese","Month"],["anno","Year"],["custom","Custom"]] : PERIOD_OPTIONS}
      />
      {period === "custom" ? (
        <div className="range-row">
          <label>
            {en ? "From" : "Dal"}
            <input
              type="date"
              value={customRange.from}
              onChange={(S) =>
                isDateString(S.target.value) &&
                setCustomRange({
                  ...customRange,
                  from: S.target.value,
                })
              }
            />
          </label>
          <label>
            {en ? "To" : "Al"}
            <input
              type="date"
              value={customRange.to}
              onChange={(S) =>
                isDateString(S.target.value) &&
                setCustomRange({
                  ...customRange,
                  to: S.target.value,
                })
              }
            />
          </label>
        </div>
      ) : (
        <div className="nav-row">
          <button
            className="icon-btn"
            onClick={() => setAnchorDate(shiftPeriod(period, anchorDate, -1))}
            aria-label="Periodo precedente"
          >
            <ChevronLeftIcon />
          </button>
          <label className="date-pick">
            <span>{range.label}</span>
            <input
              type="date"
              value={anchorDate}
              onChange={(S) => selectDate(S.target.value)}
              aria-label="Scegli una data dal calendario"
            />
          </label>
          <button
            className="icon-btn"
            onClick={() => setAnchorDate(shiftPeriod(period, anchorDate, 1))}
            aria-label="Periodo successivo"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
      {period === "settimana" && (
        <p className="hint">{en ? "Calendar week, Monday–Sunday." : "Settimana di calendario, lunedì–domenica."}</p>
      )}
      <div className="total">
        <b>{formatHours(summary.totale)}</b>
        <span>
          {period === "custom"
            ? `Dal ${formatShortDate(range.from)} al ${formatShortDate(range.to)}`
            : {
                giorno: en ? "This day" : "In questo giorno",
                settimana: en ? "This week" : "Questa settimana",
                mese: en ? "This month" : "In questo mese",
                anno: en ? "This year" : "In quest’anno",
              }[period]}
        </span>
      </div>
      <div
        className="chart"
        role="img"
        aria-label={`Ore per ${summary.barre.length > 12 ? "periodo" : "giorno"}`}
      >
        <div className="y">
          {ticks
            .slice()
            .reverse()
            .map((S) => (
              <span
                style={{
                  bottom: `${(S / axisMax) * 100}%`,
                }}
                key={S}
              >
                {Number.isInteger(S) ? S : S.toFixed(1)}
              </span>
            ))}
        </div>
        <div className="plot">
          {ticks.map((S) => (
            <i
              className="grid"
              style={{
                bottom: `${(S / axisMax) * 100}%`,
              }}
              key={S}
            />
          ))}
          <div className="bars">
            {summary.barre.map((S, O) => (
              <div
                className="bar-col"
                title={`${S.key}: ${formatHours(S.ore)}`}
                key={S.key}
              >
                <span
                  className="bar"
                  style={{
                    height: `${(S.ore / axisMax) * 100}%`,
                  }}
                />
                <em
                  className={
                    denseChart && O % 5 !== 0 && O !== summary.barre.length - 1
                      ? "hide"
                      : ""
                  }
                >
                  {S.label}
                </em>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="section-head">
        <h2>{en ? "By project" : "Per progetto"}</h2>
      </div>
      <div className="by-proj">
        {summary.perProgetto.map((S) => (
          <div className="bp-row" key={S.codice}>
            <span className="bp-name">
              <b>{S.codice}</b>
              {" · "}
              {nameForProject(S.codice)}
            </span>
            <span className="bp-bar">
              <i
                style={{
                  width: `${(S.ore / maxProjectHours) * 100}%`,
                }}
              />
            </span>
            <span className="bp-h">{formatHours(S.ore)}</span>
          </div>
        ))}
        {!summary.perProgetto.length && (
          <p className="empty">{en ? "No hours recorded in this period." : "Nessuna ora registrata nel periodo."}</p>
        )}
      </div>
      <button
        className="today-card"
        onClick={() => {
          (setPeriod("giorno"), setAnchorDate(today));
        }}
      >
        <span className="tc-ico">
          <ClockIcon />
        </span>
        <span>
          <small>
            {en ? "Today · " : "Oggi · "}
            {formatFullDate(today).replace(/ \d{4}$/, "")}
          </small>
          <b>
            {formatHours(todayHours)}
            {en ? " recorded" : " registrate"}
          </b>
        </span>
        <ChevronRightIcon />
      </button>
      <p className="hint">
        {"Totale storico registrato: "}
        {formatHours(historicalHours)}
        {". Le ore di "}
        {data.persone.filter((S) => !S.inRiepiloghiOre).length
          ? "alcune persone"
          : "altre persone"}
        {" sono escluse dai riepiloghi concordati."}
      </p>
    </>
  );
}
export { PERIOD_OPTIONS, HoursScreen };
