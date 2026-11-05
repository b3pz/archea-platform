const messages = {
  it: {
    today: "Oggi", projects: "Progetti", notes: "Note", hours: "Ore", site: "Cantiere", more: "Altro",
    calendar: "Calendario", bookings: "Prenota", inArchea: "IN ARCHEA", accounting: "Contabilità", progress: "Progetti", employeeBio: "Bio", language: "Lingua",
    demoData: "Dati dimostrativi", yourExcel: "Il tuo Excel", active: "attivi", updated: "aggiornati alle",
    loading: "Caricamento…", retry: "Riprova", profile: "Profilo e dati", settings: "Strumenti dello studio",
  },
  en: {
    today: "Today", projects: "Projects", notes: "Notes", hours: "Hours", site: "Site", more: "More",
    calendar: "Calendar", bookings: "Book", inArchea: "IN ARCHEA", accounting: "Accounting", progress: "Projects", employeeBio: "Bio", language: "Language",
    demoData: "Demo data", yourExcel: "Your Excel", active: "active", updated: "updated at",
    loading: "Loading…", retry: "Retry", profile: "Profile and data", settings: "Studio tools",
  },
};
const translate = (language, key) => messages[language]?.[key] ?? messages.it[key] ?? key;
export { messages, translate };
