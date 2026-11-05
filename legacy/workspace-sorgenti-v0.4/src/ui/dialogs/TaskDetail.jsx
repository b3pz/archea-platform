// Ricostruito dal bundle fornito; comportamento originale conservato.
import React from "react";
import {
  CopyIcon,
  AttachmentIcon,
  ExternalLinkIcon,
} from "../components/icons.jsx";
import { useApp } from "../context.jsx";
import { taskStatus, TASK_STATUS_LABELS } from "../../domain/tasks.js";
import { formatFullDate } from "../../domain/dates.js";
import { BottomSheet } from "../components/common.jsx";
import { DueBadge } from "../components/TaskCard.jsx";
const DetailRow = ({ k: e, children: t }) => (
  <div className="kv">
    <dt>{e}</dt>
    <dd>{t}</dd>
  </div>
);
const isWebUrl = (e) => /^https?:\/\//i.test(e);
function CopyButton({ text: e }) {
  const [t, n] = React.useState(false);
  return (
    <button
      className="mini"
      onClick={() => {
        var r;
        (r = navigator.clipboard) == null ||
          r.writeText(e).then(
            () => {
              (n(true), setTimeout(() => n(false), 1500));
            },
            () => {},
          );
      }}
    >
      <CopyIcon /> {t ? "Copiato" : "Copia"}
    </button>
  );
}
function TaskDetail({ id: id }) {
  const { data: data, today: today, close: close } = useApp(),
    task = data == null ? void 0 : data.task.find((c) => c.id === id);
  if (!task || !data) return null;
  const status = taskStatus(task, today),
    project = data.progetti.find((c) => c.codice === task.progettoCodice),
    completionLabel = task.completed
      ? task.dataChiusura
        ? `Sì · chiusa il ${formatFullDate(task.dataChiusura)}`
        : "Sì · data di chiusura mancante"
      : "No",
    validationLabel =
      status === "validata"
        ? "Validata"
        : task.validated
          ? "Segnata come validata ma non valida (manca completamento o data di chiusura)"
          : task.completed
            ? "In attesa di validazione del responsabile"
            : "Non validata";
  return (
    <BottomSheet title="Dettaglio task" onClose={close}>
      <p className="d-proj">
        {task.progettoCodice}
        {project ? ` · ${project.nome}` : ""}
      </p>
      <h3 className="d-title">{task.titolo || task.descrizione}</h3>
      <div className="d-badges">
        <span className={`tc-status s-${status}`}>
          {TASK_STATUS_LABELS[status]}
        </span>
        <DueBadge t={task} today={today} />
      </div>
      {task.titolo && task.descrizione && (
        <p className="d-text">{task.descrizione}</p>
      )}
      {task.commenti && (
        <div className="callout">
          <b>{"Commenti"}</b>
          <p>{task.commenti}</p>
        </div>
      )}
      <dl className="kvs">
        <DetailRow k="Assegnata a">{task.assegnatario || "—"}</DetailRow>
        <DetailRow k="Tipologia">{task.tipologia || "—"}</DetailRow>
        <DetailRow k="Priorità">{task.priorita || "—"}</DetailRow>
        <DetailRow k="Inizio">
          {task.inizio ? formatFullDate(task.inizio) : "—"}
        </DetailRow>
        <DetailRow k="Scadenza">
          {task.scadenza ? formatFullDate(task.scadenza) : "—"}
        </DetailRow>
        {task.orario && <DetailRow k="Orario">{task.orario}</DetailRow>}
        <DetailRow k="Completata">{completionLabel}</DetailRow>
        <DetailRow k="Validazione">{validationLabel}</DetailRow>
      </dl>
      {task.linkServer && (
        <>
          <h4>{"Percorso server"}</h4>
          <div className="attach">
            <AttachmentIcon />
            <span className="path">{task.linkServer}</span>
            {isWebUrl(task.linkServer) ? (
              <a
                className="mini"
                href={task.linkServer}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon />
                {" Apri"}
              </a>
            ) : (
              <CopyButton text={task.linkServer} />
            )}
          </div>
          {!isWebUrl(task.linkServer) && (
            <p className="hint">
              {
                "Percorso interno dello studio: potrebbe non essere raggiungibile da iPhone."
              }
            </p>
          )}
        </>
      )}
      {task.immagini.length > 0 && (
        <>
          <h4>
            {"Allegati ("}
            {task.immagini.length}
            {")"}
          </h4>
          {task.immagini.map((c, f) => (
            <div className="attach" key={f}>
              <AttachmentIcon />
              <span className="path">
                {isWebUrl(c) ? `Allegato ${f + 1}` : c}
              </span>
              {isWebUrl(c) ? (
                <a
                  className="mini"
                  href={c}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon />
                  {" Apri in Google Drive"}
                </a>
              ) : (
                <CopyButton text={c} />
              )}
            </div>
          ))}
          <p className="hint">
            {
              "Nessuna anteprima: i file restano protetti dai permessi di Google Drive."
            }
          </p>
        </>
      )}
    </BottomSheet>
  );
}
export { DetailRow, isWebUrl, CopyButton, TaskDetail };
