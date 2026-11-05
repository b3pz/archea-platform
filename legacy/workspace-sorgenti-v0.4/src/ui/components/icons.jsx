// Ricostruito dal bundle fornito; comportamento originale conservato.

const Icon = ({ children: e, size: t = 22 }) => (
  <svg
    width={t}
    height={t}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {e}
  </svg>
);
const CalendarIcon = () => (
  <Icon>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M4 10h16" />
  </Icon>
);
const FolderIcon = () => (
  <Icon>
    <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
  </Icon>
);
const NoteIcon = ({ size: e }) => (
  <Icon size={e}>
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" />
    <path d="M14 3.5V8h4M8.5 12.5h7M8.5 16h5" />
  </Icon>
);
const ClockIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);
const ChevronLeftIcon = () => (
  <Icon size={20}>
    <path d="m14.5 6-6 6 6 6" />
  </Icon>
);
const ChevronRightIcon = () => (
  <Icon size={20}>
    <path d="m9.5 6 6 6-6 6" />
  </Icon>
);
const ChevronDownIcon = () => (
  <Icon size={18}>
    <path d="m6 9.5 6 6 6-6" />
  </Icon>
);
const CloseIcon = () => (
  <Icon size={20}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
const ListIcon = () => (
  <Icon size={18}>
    <path d="M9 7h10M9 12h10M9 17h10M5 7h.01M5 12h.01M5 17h.01" />
  </Icon>
);
const RefreshIcon = () => (
  <Icon size={18}>
    <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12A7.5 7.5 0 0 1 17.5 6.9M17.5 3.5v3.4h-3.4M6.5 20.5v-3.4h3.4" />
  </Icon>
);
const AttachmentIcon = () => (
  <Icon size={16}>
    <path d="m20 11.5-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.700 4.700L9.700 17.200a1.700 1.700 0 0 1-2.400-2.400L14.500 7.500" />
  </Icon>
);
const CopyIcon = () => (
  <Icon size={16}>
    <rect x="8" y="8" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h8" />
  </Icon>
);
const ExternalLinkIcon = () => (
  <Icon size={16}>
    <path d="M14 5h5v5M19 5l-8 8M18 14v4a1.500 1.500 0 0 1-1.500 1.500h-10A1.500 1.500 0 0 1 5 18V8a1.500 1.500 0 0 1 1.500-1.500H10" />
  </Icon>
);
const BuildingIcon = () => (
  <Icon size={34}>
    <path d="M4 20h16M6 20V9l6-4 6 4v11M9.500 20v-5h5v5M9.500 11.500h.01M14.500 11.500h.01" />
  </Icon>
);
const UploadIcon = () => (
  <Icon size={18}>
    <path d="M12 16V5M7.500 9.500 12 5l4.500 4.500M5 19h14" />
  </Icon>
);
const CameraIcon = () => <Icon><path d="M5 7.5h3l1.5-2h5l1.5 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="3.5"/></Icon>;
const CheckIcon = () => <Icon size={18}><path d="m6.5 12 3.5 3.5 7.5-8"/></Icon>;
const PlusIcon = () => <Icon><path d="M12 5v14M5 12h14"/></Icon>;
const HelmetIcon = () => <Icon><path d="M4 15a8 8 0 0 1 16 0M3 15h18M9 7v5M15 7v5"/></Icon>;
const MoreIcon = () => <Icon><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></Icon>;
const CarIcon = () => <Icon><path d="m5 16-1-3 2-5h12l2 5-1 3zM7 16v2M17 16v2M7 12h.01M17 12h.01"/></Icon>;
const CommunityIcon = () => <Icon><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M14 16a4 4 0 0 1 6.5 3"/></Icon>;
const EuroIcon = () => <Icon><path d="M18 6.5A7 7 0 1 0 18 17.5M5 10h9M5 14h8"/></Icon>;
const FileIcon = () => <Icon><path d="M7 3.5h7l4 4V20H7zM14 3.5V8h4M10 12h5M10 15.5h5"/></Icon>;
const IdentityIcon = () => <Icon><circle cx="12" cy="8" r="3"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0M4 4h16v16H4z"/></Icon>;
function TaskStatusIcon({ s: e }) {
  const t = <circle cx="12" cy="12" r="8.500" />,
    n = {
      in_lavorazione: (
        <>
          <path d="M12 3.500a8.500 8.500 0 1 0 8.500 8.500" />
          <path d="M12 8v4l2.500 1.500" />
        </>
      ),
      da_rivedere: (
        <>
          {t}
          <path d="M12 7.500v5M12 16h.01" />
        </>
      ),
      scaduta: (
        <>
          {t}
          <path d="m9 9 6 6M15 9l-6 6" />
        </>
      ),
      in_scadenza: (
        <>
          {t}
          <path d="M12 7.500V12l3 2" />
        </>
      ),
      validata: (
        <>
          {t}
          <path d="m8.500 12.200 2.500 2.500 4.500-5" />
        </>
      ),
    };
  return <Icon size={16}>{n[e]}</Icon>;
}
export {
  Icon,
  CalendarIcon,
  FolderIcon,
  NoteIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CloseIcon,
  ListIcon,
  RefreshIcon,
  AttachmentIcon,
  CopyIcon,
  ExternalLinkIcon,
  BuildingIcon,
  UploadIcon,
  TaskStatusIcon,
  CameraIcon,
  CheckIcon,
  PlusIcon,
  HelmetIcon,
  MoreIcon,
  CarIcon,
  CommunityIcon,
  EuroIcon,
  FileIcon,
  IdentityIcon,
};
