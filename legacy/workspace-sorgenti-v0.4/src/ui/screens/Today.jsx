// Ricostruito dal bundle fornito; comportamento originale conservato.
import React from "react";
import { useApp } from "../context.jsx";
import { isManager, visibleTasks } from "../../config/permissions.js";
import {
  isAssignedTo,
  firstName,
  SearchBox,
  EmptyState,
  Avatar,
} from "../components/common.jsx";
import { taskStatus, isOpenTask, compareTasks } from "../../domain/tasks.js";
import { normalizeText } from "../../domain/normalize.js";
import { formatToday } from "../../domain/dates.js";
import { ListIcon, ClockIcon, RefreshIcon } from "../components/icons.jsx";
import { TaskCard } from "../components/TaskCard.jsx";
const TASK_FILTERS = [
  ["aperte", "Aperte"],
  ["in_scadenza", "In scadenza"],
  ["scadute", "Scadute"],
  ["da_rivedere", "Da rivedere"],
  ["validate", "Validate"],
];
const INITIAL_TASK_LIMIT = 5;
function TodayScreen() {
  var selectedPerson;
  const { data: data, viewer: viewer, today: today, language } = useApp(),
    [filter, setFilter] = React.useState("aperte"),
    [search, setSearch] = React.useState(""),
    [showAll, setShowAll] = React.useState(false),
    [personFilter, setPersonFilter] = React.useState("me"),
    manager = !!viewer && isManager(viewer),
    tasks = React.useMemo(() => {
      if (!data || !viewer) return [];
      const w = visibleTasks(viewer, data.task, isAssignedTo);
      if (!manager || personFilter === "me")
        return w.filter((S) => isAssignedTo(S, viewer));
      if (personFilter === "all") return w;
      const E = data.persone.find((S) => S.id === personFilter);
      return E ? w.filter((S) => isAssignedTo(S, E)) : w;
    }, [data, viewer, personFilter, manager]);
  if (!data || !viewer) return null;
  const en = language === 'en', statusOf = (w) => taskStatus(w, today),
    counts = {
      aperte: tasks.filter((w) => isOpenTask(w, today)).length,
      in_scadenza: tasks.filter((w) => statusOf(w) === "in_scadenza").length,
      scadute: tasks.filter((w) => statusOf(w) === "scaduta").length,
      da_rivedere: tasks.filter((w) => statusOf(w) === "da_rivedere").length,
      validate: tasks.filter((w) => statusOf(w) === "validata").length,
    },
    matchesFilter = {
      aperte: (w) => isOpenTask(w, today),
      in_scadenza: (w) => statusOf(w) === "in_scadenza",
      scadute: (w) => statusOf(w) === "scaduta",
      da_rivedere: (w) => statusOf(w) === "da_rivedere",
      validate: (w) => statusOf(w) === "validata",
    },
    searchKey = normalizeText(search),
    filteredTasks = tasks
      .filter(matchesFilter[filter])
      .filter(
        (w) =>
          !searchKey ||
          normalizeText(
            [
              w.titolo,
              w.descrizione,
              w.progettoCodice,
              w.tipologia,
              w.assegnatario,
            ].join(" "),
          ).includes(searchKey),
      )
      .sort(compareTasks(today)),
    shownTasks =
      showAll || searchKey
        ? filteredTasks
        : filteredTasks.slice(0, INITIAL_TASK_LIMIT),
    team = data.persone.filter((w) => w.inRiepiloghiOre),
    listTitle =
      personFilter === "me"
        ? (en ? "Your tasks" : "Le tue task")
        : personFilter === "all"
          ? (en ? "Team tasks" : "Task del team")
          : `${en ? 'Tasks ·' : 'Task di'} ${firstName(((selectedPerson = data.persone.find((w) => w.id === personFilter)) == null ? void 0 : selectedPerson.nome) ?? "")}`;
  return (
    <>
      <div className="greet">
        <p className="hello">
          {en ? "Hello " : "Ciao "}
          {firstName(viewer.nome)}
        </p>
        <p className="date">{formatToday(today)}</p>
      </div>
      <h1 className="big">{en ? "Today's work" : "Il lavoro di oggi"}</h1>
      <div className="stats">
        <button
          className={`stat neutral${filter === "aperte" ? " on" : ""}`}
          onClick={() => setFilter("aperte")}
        >
          <b>{counts.aperte}</b>
          <ListIcon />
          <span>{en ? "Open" : "Aperte"}</span>
        </button>
        <button
          className={`stat warn${filter === "in_scadenza" ? " on" : ""}`}
          onClick={() => setFilter("in_scadenza")}
        >
          <b>{counts.in_scadenza}</b>
          <ClockIcon />
          <span>{en ? "Due soon" : "In scadenza"}</span>
        </button>
        <button
          className={`stat alert${filter === "da_rivedere" ? " on" : ""}`}
          onClick={() => setFilter("da_rivedere")}
        >
          <b>{counts.da_rivedere}</b>
          <RefreshIcon />
          <span>{en ? "To review" : "Da rivedere"}</span>
        </button>
      </div>
      <div className="section-head">
        <h2>{listTitle}</h2>
        {filteredTasks.length > INITIAL_TASK_LIMIT && !searchKey && (
          <button className="link" onClick={() => setShowAll(!showAll)}>
            {showAll ? (en ? "Show less" : "Mostra meno") : (en ? "See all" : "Vedi tutte")}
          </button>
        )}
      </div>
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={en ? "Search by title, project or type" : "Cerca per titolo, progetto o tipologia"}
      />
      <div className="chips" role="group" aria-label="Filtri task">
        {TASK_FILTERS.map(([w, E]) => (
          <button
            className={`chip${filter === w ? " on" : ""}${w === "scadute" && counts.scadute ? " hot" : ""}`}
            aria-pressed={filter === w}
            onClick={() => {
              (setFilter(w), setShowAll(false));
            }}
            key={w}
          >
            {(en ? { aperte:'Open', in_scadenza:'Due soon', scadute:'Overdue', da_rivedere:'To review', validate:'Validated' }[w] : E)} <i>{counts[w]}</i>
          </button>
        ))}
      </div>
      <div className="list">
        {shownTasks.map((w) => (
          <TaskCard t={w} key={w.id} />
        ))}
        {!shownTasks.length && (
          <EmptyState>
            {searchKey
              ? (en ? "No task matches your search." : "Nessuna task corrisponde alla ricerca.")
              : (en ? "No tasks in this category." : "Nessuna task in questa categoria.")}
          </EmptyState>
        )}
      </div>
      {manager && (
        <>
          <div className="section-head">
            <h2>{en ? "Team" : "Il team"}</h2>
          </div>
          <div className="team">
            <button
              className={`chip${personFilter === "me" ? " on" : ""}`}
              onClick={() => setPersonFilter("me")}
            >
              {en ? "Mine" : "Mie"}
            </button>
            {team
              .filter((w) => w.id !== viewer.id)
              .map((w) => (
                <Avatar
                  name={w.nome}
                  size={48}
                  active={personFilter === w.id}
                  onClick={() =>
                    setPersonFilter(personFilter === w.id ? "me" : w.id)
                  }
                  label={`Task di ${w.nome}`}
                  key={w.id}
                />
              ))}
            <button
              className={`chip${personFilter === "all" ? " on" : ""}`}
              onClick={() => setPersonFilter("all")}
            >
              {en ? "All" : "Tutti"}
            </button>
          </div>
        </>
      )}
    </>
  );
}
export { TASK_FILTERS, INITIAL_TASK_LIMIT, TodayScreen };
