// Public identifiers only. OAuth secrets must never be committed to GitHub.
const GOOGLE_INTEGRATION = {
  enabled: false,
  clientId: "",
  workspaceDomain: "archea.it",
  driveRootFolderId: "",
  calendarIds: { studio: "", resources: "", events: "" },
  scopes: [
    "openid", "email", "profile",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/calendar",
  ],
};
export { GOOGLE_INTEGRATION };
