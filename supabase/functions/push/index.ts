// ARCHEA Platform · Edge Function "push"
// Manda le notifiche vere del browser (Web Push) a computer e telefoni, anche con il sito chiuso.
//
// Deploy dalla dashboard: Supabase → Edge Functions → Deploy a new function → "Via Editor"
//   nome: push   → incolla questo file → Deploy
//   poi, nella pagina della funzione → Details: DISATTIVA "Verify JWT" (Enforce JWT verification)
//   e salva. La chiama solo il database, con una parola segreta che conosce solo lui.
// Non servono Secrets: le chiavi le crea il sito e stanno nella tabella push_config.

import webpush from "npm:web-push@3.6.7";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

async function rest(path: string, init: RequestInit = {}) {
  const r = await fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status} ${await r.text()}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

let cfgCache: { public_key: string; private_key: string; hook_secret: string } | null = null;
async function config() {
  if (!cfgCache) {
    const rows = await rest("push_config?id=eq.1&select=public_key,private_key,hook_secret");
    cfgCache = rows?.[0] ?? null;
  }
  return cfgCache;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Metodo non consentito", { status: 405 });
  const cfg = await config();
  if (!cfg?.private_key) return new Response("Notifiche non configurate", { status: 503 });
  if (req.headers.get("x-archea-hook") !== cfg.hook_secret) return new Response("Non autorizzato", { status: 401 });

  const n = await req.json();
  if (!n?.user_id) return new Response("Dati mancanti", { status: 400 });

  webpush.setVapidDetails("mailto:it@archea.it", cfg.public_key, cfg.private_key);
  const subs = await rest(`push_subscriptions?user_id=eq.${n.user_id}&select=id,endpoint,p256dh,auth`);
  const payload = JSON.stringify({
    id: n.id, title: n.title || "ARCHEA", body: n.message || "", ticket_id: n.ticket_id || null,
  });

  let sent = 0, removed = 0;
  await Promise.all((subs || []).map(async (s: { id: number; endpoint: string; p256dh: string; auth: string }) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload,
        { TTL: 86400, urgency: "high", topic: `archea-${n.id}`.slice(0, 32) });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) { // dispositivo non più iscritto
        await rest(`push_subscriptions?id=eq.${s.id}`, { method: "DELETE" }).catch(() => {});
        removed++;
      } else console.error("push", code, (e as Error).message);
    }
  }));
  return new Response(JSON.stringify({ sent, removed }), { headers: { "Content-Type": "application/json" } });
});
