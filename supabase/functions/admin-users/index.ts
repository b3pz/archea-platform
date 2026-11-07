// ARCHEA Platform · Edge Function "admin-users"
// Gestione utenti dal sito (Service Desk → Utenti e gruppi) senza entrare in Supabase.
//
// Deploy dalla dashboard: Supabase → Edge Functions → Deploy a new function → "Via Editor"
//   nome: admin-users   → incolla questo file → Deploy.
// Non servono Secrets: SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY
// sono già disponibili nelle Edge Functions. La service_role resta solo sul server.
//
// Può usarla solo chi ha il permesso "gestione_utenti" (gruppo IT) o è SUPER_IT.

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const RUOLI = ["USER", "SUPER_IT"];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return fail("Metodo non consentito", 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  // 1) Chi sta chiamando?
  const asCaller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: who, error: whoErr } = await asCaller.auth.getUser();
  if (whoErr || !who?.user) return fail("Sessione non valida", 401);
  const { data: allowed } = await asCaller.rpc("has_perm", { p: "gestione_utenti" });
  if (!allowed) return fail("Non hai il permesso di gestire gli utenti", 403);

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: me } = await admin.from("profiles").select("ruolo").eq("id", who.user.id).maybeSingle();
  const callerIsSuper = me?.ruolo === "SUPER_IT";

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return fail("Richiesta non valida"); }
  const action = String(body.action ?? "");

  const setGroups = async (userId: string, groups: unknown) => {
    if (!Array.isArray(groups)) return;
    const requested = [...new Set(groups.map((g) => Number(g)).filter(Number.isFinite))];
    if (!callerIsSuper) {
      const [{ data: requestedRows, error: groupsErr }, { data: existingRows, error: membersErr }] = await Promise.all([
        admin.from("access_groups").select("id, permessi").in("id", requested),
        admin.from("access_group_members").select("group_id").eq("user_id", userId),
      ]);
      if (groupsErr) throw groupsErr;
      if (membersErr) throw membersErr;
      const existingIds = new Set((existingRows ?? []).map((m) => Number(m.group_id)));
      if ((requestedRows ?? []).some((g) => (g.permessi ?? []).length > 0 && !existingIds.has(Number(g.id)))) {
        throw new Error("Solo SUPER_IT può assegnare gruppi con permessi");
      }
      const { data: currentGroups, error: currentErr } = await admin.from("access_groups").select("id, permessi").in("id", (existingRows ?? []).map((m) => m.group_id));
      if (currentErr) throw currentErr;
      for (const g of currentGroups ?? []) if ((g.permessi ?? []).length > 0) requested.push(g.id);
    }
    await admin.from("access_group_members").delete().eq("user_id", userId);
    const rows = requested.map((group_id) => ({ group_id, user_id: userId }));
    if (rows.length) {
      const { error } = await admin.from("access_group_members").insert(rows);
      if (error) throw error;
    }
  };
  const checkRole = (ruolo: unknown) => {
    const r = String(ruolo ?? "USER");
    if (!RUOLI.includes(r)) throw new Error("Ruolo non valido");
    if (r === "SUPER_IT" && !callerIsSuper) throw new Error("Solo un SUPER_IT può nominare un altro SUPER_IT");
    return r;
  };

  try {
    if (action === "list") {
      const users: unknown[] = [];
      for (let page = 1; page < 20; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        users.push(...data.users);
        if (data.users.length < 1000) break;
      }
      const [{ data: profiles }, { data: members }] = await Promise.all([
        admin.from("profiles").select("id, email, nome, ruolo"),
        admin.from("access_group_members").select("group_id, user_id"),
      ]);
      const list = (users as Array<Record<string, any>>).map((u) => {
        const p = profiles?.find((x) => x.id === u.id);
        return {
          id: u.id,
          email: u.email,
          nome: p?.nome ?? null,
          ruolo: p?.ruolo ?? null,
          has_profile: !!p,
          confirmed: !!u.email_confirmed_at,
          invited: !!u.invited_at && !u.last_sign_in_at,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          disabled: !!u.banned_until && new Date(u.banned_until) > new Date(),
          gruppi: (members ?? []).filter((m) => m.user_id === u.id).map((m) => m.group_id),
        };
      });
      return json({ users: list });
    }

    if (action === "create") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const nome = String(body.nome ?? "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Email non valida");
      if (nome.length < 2) return fail("Scrivi nome e cognome");
      const ruolo = checkRole(body.ruolo);
      let userId: string;
      if (body.invite) {
        const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo: typeof body.redirectTo === "string" ? body.redirectTo : undefined,
          data: { nome },
        });
        if (error) throw error;
        userId = data.user.id;
      } else {
        const password = String(body.password ?? "");
        if (password.length < 8) return fail("La password deve avere almeno 8 caratteri");
        const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nome } });
        if (error) throw error;
        userId = data.user.id;
      }
      const { error: pe } = await admin.from("profiles").upsert({ id: userId, email, nome, ruolo }, { onConflict: "id" });
      if (pe) throw pe;
      await setGroups(userId, body.gruppi);
      return json({ ok: true, id: userId });
    }

    if (action === "update") {
      const id = String(body.id ?? "");
      if (!id) return fail("Utente mancante");
      const { data: target } = await admin.from("profiles").select("ruolo, email").eq("id", id).maybeSingle();
      if (target?.ruolo === "SUPER_IT" && !callerIsSuper) return fail("Solo un SUPER_IT può modificare un SUPER_IT", 403);
      const patch: Record<string, unknown> = {};
      if (typeof body.nome === "string") patch.nome = body.nome.trim();
      if (body.ruolo !== undefined) {
        patch.ruolo = checkRole(body.ruolo);
        if (id === who.user.id && patch.ruolo !== me?.ruolo) return fail("Non puoi cambiare il tuo ruolo");
      }
      if (Object.keys(patch).length) {
        const { data: u } = await admin.auth.admin.getUserById(id);
        const { error } = await admin.from("profiles").upsert({ id, email: target?.email ?? u?.user?.email, ...patch }, { onConflict: "id" });
        if (error) throw error;
      }
      if (typeof body.password === "string" && body.password) {
        if (body.password.length < 8) return fail("La password deve avere almeno 8 caratteri");
        const { error } = await admin.auth.admin.updateUserById(id, { password: body.password });
        if (error) throw error;
      }
      await setGroups(id, body.gruppi);
      return json({ ok: true });
    }

    if (action === "disable" || action === "enable") {
      const id = String(body.id ?? "");
      if (!id || id === who.user.id) return fail("Non puoi disattivare te stesso");
      const { data: target } = await admin.from("profiles").select("ruolo").eq("id", id).maybeSingle();
      if (target?.ruolo === "SUPER_IT" && !callerIsSuper) return fail("Solo un SUPER_IT può disattivare un SUPER_IT", 403);
      // disattivato = non può più accedere, ma ticket e storico restano intatti
      const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: action === "disable" ? "876000h" : "none" });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "delete") {
      const id = String(body.id ?? "");
      if (!id) return fail("Utente mancante");
      if (id === who.user.id) return fail("Non puoi eliminare te stesso");
      const { data: target } = await admin.from("profiles").select("ruolo").eq("id", id).maybeSingle();
      if (target?.ruolo === "SUPER_IT" && !callerIsSuper) return fail("Solo un SUPER_IT può eliminare un SUPER_IT", 403);
      await admin.from("access_group_members").delete().eq("user_id", id);
      await admin.from("profiles").delete().eq("id", id); // se profiles non è collegata in cascata
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) {
        throw new Error("Impossibile eliminare: l'utente ha ticket o dati collegati. Usa \"Disattiva\": non potrà più accedere e lo storico resta.");
      }
      return json({ ok: true });
    }

    return fail("Azione sconosciuta");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
    return fail(/already been registered|already registered|duplicate/i.test(msg) ? "Esiste già un utente con questa email" : msg);
  }
});
