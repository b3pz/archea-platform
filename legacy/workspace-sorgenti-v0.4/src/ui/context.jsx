import React from 'react';
import { todayInRome } from '../domain/dates.js';
import { demoAdapter } from '../data/adapters/demo.js';
import { importExcel } from '../data/adapters/excel.js';
import { readSavedExcel, saveExcelSnapshot, removeSavedExcel } from '../data/localSnapshot.js';
import { DEMO_ACCOUNTS } from '../config/accounts.js';
import { translate } from '../i18n.js';

const AppContext = React.createContext(null);
const useApp = () => React.useContext(AppContext);

function AppProvider({ children }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [viewerId, setViewerId] = React.useState('fdiamanti');
  const [today, setToday] = React.useState(todayInRome());
  const [tab, setCurrentTab] = React.useState(location.hash.slice(2) || 'oggi');
  const [overlay, setOverlay] = React.useState(null);
  const [noteProject, setNoteProject] = React.useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState('fdiamanti');
  const [language, setLanguageState] = React.useState(() => localStorage.getItem('archea-language') || 'it');

  const load = React.useCallback(async loader => {
    setLoading(true);
    setError(null);
    try {
      const nextData = await loader();
      setData(nextData);
      setToday(todayInRome());
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load(async () => {
      try { return readSavedExcel() ?? await demoAdapter.load(); }
      catch (err) {
        const demo = await demoAdapter.load();
        demo.meta.warnings.push(`Dati locali non disponibili: ${err.message}. Importa nuovamente l'Excel.`);
        return demo;
      }
    });
  }, [load]);
  React.useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setToday(todayInRome());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);
  React.useEffect(() => {
    const closeOverlay = () => setOverlay(null);
    window.addEventListener('hashchange', closeOverlay);
    return () => window.removeEventListener('hashchange', closeOverlay);
  }, []);

  const viewer = React.useMemo(
    () => {
      const person = data?.persone.find(person => person.id === viewerId) ?? DEMO_ACCOUNTS.find(person => person.id === viewerId) ?? data?.persone[0] ?? null;
      if (!person) return null;
      const account = DEMO_ACCOUNTS.find(item => item.id === person.id);
      return { ...person, appRole: account?.appRole ?? (person.ruolo === 'responsabile' ? 'partner_architect' : 'architect') };
    },
    [data, viewerId],
  );
  const setLanguage = languageCode => {
    localStorage.setItem('archea-language', languageCode);
    setLanguageState(languageCode);
  };
  const value = {
    data, loading, error, viewer, setViewerId, today, tab, overlay,
    noteProject, setNoteProject, selectedEmployeeId, setSelectedEmployeeId, language, setLanguage,
    t: key => translate(language, key),
    setTab(nextTab) {
      setCurrentTab(nextTab);
      setOverlay(null);
      history.replaceState(null, '', `#/${nextTab}`);
      window.scrollTo(0, 0);
    },
    open: setOverlay,
    close: () => setOverlay(null),
    reload: () => load(() => !data || data.meta.source === 'demo' ? demoAdapter.load() : Promise.resolve(data)),
    importExcel: file => load(async () => {
      const imported = await importExcel(file);
      try { saveExcelSnapshot(imported); }
      catch {
        // Avoid restoring an older import after failing to save the new one.
        try { removeSavedExcel(); } catch { /* Browser storage is unavailable. */ }
        imported.meta.warnings.push('Excel importato per questa sessione. Il browser non consente di conservarlo: alla riapertura sarà necessario importarlo di nuovo.');
      }
      setNoteProject(null);
      return imported;
    }),
    backToDemo: () => load(async () => {
      // Switch only after clearing the saved Excel; errors remain visible.
      removeSavedExcel();
      setNoteProject(null);
      return demoAdapter.load();
    }),
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export { AppContext, useApp, AppProvider };
