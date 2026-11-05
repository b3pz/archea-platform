// Ricostruito dal bundle fornito; comportamento originale conservato.
import React from "react";
import { normalizeText } from "../../domain/normalize.js";
import { CloseIcon } from "./icons.jsx";
const initials = (e) =>
  e
    .replace(/[’'`´]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((t) => t[0].toUpperCase())
    .join("");
const firstName = (e) => e.split(/\s+/)[0] ?? e;
const assignees = (e) =>
  e.assegnatario
    .split(/[,;/&\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
const isAssignedTo = (e, t) =>
  assignees(e).some((n) => normalizeText(n) === normalizeText(t.nome));
const Avatar = ({
  name: name,
  size = 40,
  active = false,
  onClick: onClick,
  label: label,
}) => {
  const style = {
      width: size,
      height: size,
      fontSize: size * 0.34,
    },
    className = `avatar${active ? " active" : ""}`;
  return onClick ? (
    <button
      className={className}
      style={style}
      onClick={onClick}
      aria-pressed={active}
      aria-label={label ?? name}
      title={name}
    >
      {initials(name)}
    </button>
  ) : (
    <span className={className} style={style} aria-hidden="true">
      {initials(name)}
    </span>
  );
};
function BottomSheet({ title: title, onClose: onClose, children: children }) {
  return (
    React.useEffect(() => {
      const r = (l) => l.key === "Escape" && onClose();
      return (
        document.addEventListener("keydown", r),
        (document.body.style.overflow = "hidden"),
        () => {
          (document.removeEventListener("keydown", r),
            (document.body.style.overflow = ""));
        }
      );
    }, [onClose]),
    (
      <div
        className="sheet-wrap"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet-backdrop" onClick={onClose} />
        <div className="sheet">
          <div className="sheet-head">
            <h2>{title}</h2>
            <button className="icon-btn" onClick={onClose} aria-label="Chiudi">
              <CloseIcon />
            </button>
          </div>
          <div className="sheet-body">{children}</div>
        </div>
      </div>
    )
  );
}
const SegmentedControl = ({ value: e, options: t, onChange: n, label: r }) => (
  <div
    className="segmented"
    role="tablist"
    aria-label={r}
    style={{
      gridTemplateColumns: `repeat(${t.length}, 1fr)`,
    }}
  >
    {t.map(([l, o]) => (
      <button
        role="tab"
        aria-selected={l === e}
        className={l === e ? "on" : ""}
        onClick={() => n(l)}
        key={l}
      >
        {o}
      </button>
    ))}
  </div>
);
const SearchBox = ({
  value: value,
  onChange: onChange,
  placeholder: placeholder,
}) => (
  <label className="searchbox">
    <span className="sr-only">{placeholder}</span>
    <span className="si">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="6.500" />
        <path d="m20 20-4-4" />
      </svg>
    </span>
    <input
      type="search"
      value={value}
      onChange={(r) => onChange(r.target.value)}
      placeholder={placeholder}
      enterKeyHint="search"
    />
  </label>
);
const NOTE_STATUS_LABELS = {
  aperta: "Aperta",
  in_corso: "In corso",
  chiusa: "Chiusa",
};
const NoteStatusBadge = ({ s: e }) => (
  <span className={`pill note-${e}`}>{NOTE_STATUS_LABELS[e]}</span>
);
const projectStatusClass = (e) =>
  `ps-${e.toLowerCase().replace(/[^a-z]/g, "") || "nd"}`;
const EmptyState = ({ children: e }) => <p className="empty">{e}</p>;
export {
  initials,
  firstName,
  assignees,
  isAssignedTo,
  Avatar,
  BottomSheet,
  SegmentedControl,
  SearchBox,
  NOTE_STATUS_LABELS,
  NoteStatusBadge,
  projectStatusClass,
  EmptyState,
};
