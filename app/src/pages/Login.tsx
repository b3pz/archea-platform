import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export function Login({ errore }: { errore?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(errore || '');
  const [attesa, setAttesa] = useState(false);

  async function entra(e: FormEvent) {
    e.preventDefault();
    setAttesa(true); setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setAttesa(false);
    if (error) setMsg(/invalid/i.test(error.message) ? 'Email o password non corrette.' : error.message);
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={entra}>
        <img src="../icons/archea-associati-logo.svg" alt="Archea Associati" className="login-logo" />
        <h1>Accedi</h1>
        <p className="muted">Usa l'account che ti ha creato l'IT.</p>
        <label>Email aziendale<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nome.cognome@archea.it" /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button className="btn primary big" disabled={attesa}>{attesa ? 'Accesso…' : 'Entra'}</button>
        {msg && <p className="error" role="alert">{msg}</p>}
      </form>
    </div>
  );
}
