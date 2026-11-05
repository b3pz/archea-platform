// Ricostruito dal bundle fornito; comportamento originale conservato.
import React from "react";
import { useApp } from "../context.jsx";
import { BottomSheet, Avatar } from "../components/common.jsx";
import { DEMO_ACCOUNTS, ROLES } from "../../config/accounts.js";
import { RefreshIcon, UploadIcon } from "../components/icons.jsx";
import { PENDING_ACCESS_DECISIONS } from "../../config/permissions.js";
const SOURCE_LABELS = {
  demo: "DEMO",
  excel: "EXCEL STATICO",
  live: "LIVE",
};
function ProfileDialog() {
  const {
      data: data,
      viewer: viewer,
      setViewerId: setViewerId,
      close: close,
      reload: reload,
      importExcel: importExcel,
      backToDemo: backToDemo,
      loading: loading,
      error: error,
      language: language,
      setLanguage: setLanguage,
    } = useApp(),
    fileInput = React.useRef(null),
    [showWarnings, setShowWarnings] = React.useState(false);
  if (!data || !viewer) return null;
  const meta = data.meta,
    sourceDescription = {
      demo: "Dati dimostrativi fittizi, generati nel layout dei fogli reali. Nessun dato del team.",
      excel:
        "Dati importati dal tuo Excel e conservati in questo browser. Non vengono inviati online e non si aggiornano automaticamente da Google Fogli. Importa un nuovo Excel per aggiornarli.",
      live: "Connessione a Google Fogli.",
    }[meta.source];
  return (
    <BottomSheet title="Persona e dati" onClose={close}>
      <h4>{"Persona · simulazione"}</h4>
      <p className="hint first">
        {"Selezione di prova per vedere le schermate come un altro membro. "}
        <b>{"Non è un accesso"}</b>
        {": con i dati live servirà l'autenticazione Google."}
      </p>
      <div className="radio-list">
        {DEMO_ACCOUNTS.map((g) => (
          <button
            className={`pick-row${viewer.id === g.id ? " on" : ""}`}
            onClick={() => setViewerId(g.id)}
            aria-pressed={viewer.id === g.id}
            key={g.id}
          >
            <Avatar name={g.nome} size={36} />
            <b>{g.nome}</b>
            <small>{ROLES[g.appRole]}</small>
          </button>
        ))}
      </div>
      <h4>{language === 'en' ? 'Language' : 'Lingua'}</h4>
      <div className="language-switch compact">
        <button className={language === 'it' ? 'on' : ''} onClick={() => setLanguage('it')}>Italiano</button>
        <button className={language === 'en' ? 'on' : ''} onClick={() => setLanguage('en')}>English</button>
      </div>
      <h4>{"Origine dei dati"}</h4>
      <div className="callout">
        <b>
          {SOURCE_LABELS[meta.source]}
          {" · "}
          {meta.label}
        </b>
        <p>{sourceDescription}</p>
        <p>
          {"Caricati: "}
          {new Date(meta.loadedAt).toLocaleString("it-IT", {
            timeZone: "Europe/Rome",
          })}
          {". Connessione Google Fogli live: "}
          <b>{"non attiva"}</b>
          {"."}
        </p>
      </div>
      <div className="stat-line">
        {Object.entries(meta.stats).map(([g, x]) => (
          <span key={g}>
            {g.replace(/([A-Z])/g, " $1").toLowerCase()}
            {": "}
            <b>{x}</b>
          </span>
        ))}
      </div>
      {error && (
        <p className="error">
          {"Errore: "}
          {error}
        </p>
      )}
      <div className="btn-row">
        <button
          className="btn"
          disabled={loading}
          onClick={() => void reload()}
        >
          <RefreshIcon />
          {" Aggiorna"}
        </button>
        <button
          className="btn"
          disabled={loading}
          onClick={() => {
            var g;
            return (g = fileInput.current) == null ? void 0 : g.click();
          }}
        >
          <UploadIcon />
          {" Importa Excel (locale)"}
        </button>
        {meta.source !== "demo" && (
          <button className="btn" onClick={() => void backToDemo()}>
            {"Rimuovi dati e torna alla demo"}
          </button>
        )}
        <input
          ref={fileInput}
          type="file"
          hidden={true}
          accept=".xlsx,.xlsm"
          onChange={(g) => {
            var j;
            const x = (j = g.target.files) == null ? void 0 : j[0];
            (x && importExcel(x).then(success => { if (success) close(); }), (g.target.value = ""));
          }}
        />
      </div>
      {meta.warnings.length > 0 && (
        <>
          <button
            className="link warn-toggle"
            onClick={() => setShowWarnings(!showWarnings)}
          >
            {showWarnings ? "Nascondi" : "Mostra"}
            {" segnalazioni sui dati ("}
            {meta.warnings.length}
            {")"}
          </button>
          {showWarnings && (
            <ul className="warns">
              {meta.warnings.slice(0, 80).map((g, x) => (
                <li key={x}>{g}</li>
              ))}
            </ul>
          )}
        </>
      )}
      <h4>{"Decisioni in sospeso sugli accessi"}</h4>
      <ul className="warns">
        {PENDING_ACCESS_DECISIONS.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>
    </BottomSheet>
  );
}
export { SOURCE_LABELS, ProfileDialog };
