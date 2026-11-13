/* Dipakai oleh /dashboard/ dan /admin/ */
(function(){
  const PF = window.PLATFORM;
  const sb = window.supabase.createClient(PF.supabaseUrl, PF.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });
  const BASE = /\.github\.io$/.test(location.hostname) ? location.origin + "/undangan/" : location.origin + "/";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function toast(msg, type){
    let t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.className = "toast show " + (type || ""); clearTimeout(t._t); t._t = setTimeout(() => t.className = "toast", 2600);
  }
  async function copy(text){
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    toast("✓ Disalin");
  }
  const inviteUrl = (slug, nama) => BASE + "?u=" + encodeURIComponent(slug) + (nama ? "&to=" + encodeURIComponent(nama).replace(/%20/g, "+") : "");
  const prettyUrl = slug => BASE + slug + "/";
  function genPassword(n = 12){
    const a = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const r = crypto.getRandomValues(new Uint32Array(n)); return [...r].map(x => a[x % a.length]).join("");
  }
  const slugify = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  function setupLogin(onReady, opts = {}){
    const form = $("#loginForm");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const btn = form.querySelector("button"); btn.disabled = true; $("#loginMsg").textContent = "";
      const { error } = await sb.auth.signInWithPassword({ email: form.email.value.trim(), password: form.password.value });
      btn.disabled = false;
      if (error) { $("#loginMsg").textContent = /banned/i.test(error.message) ? "Akun Anda dinonaktifkan. Hubungi admin." : "Email atau password salah."; return; }
      form.password.value = "";
    });
    let started = false;
    sb.auth.onAuthStateChange((ev, session) => {
      if (session && !started) { started = true; $("#loginView").hidden = true; $("#appView").hidden = false; setTimeout(() => onReady(session), 0); }
      if (!session) { started = false; $("#loginView").hidden = false; $("#appView").hidden = true; }
    });
    $$("[data-logout]").forEach(b => b.onclick = async () => { await sb.auth.signOut(); location.reload(); });
  }
  const role = session => session?.user?.app_metadata?.role || "client";
  window.APP = { sb, PF, BASE, $, $$, esc, toast, copy, inviteUrl, prettyUrl, genPassword, slugify, setupLogin, role };
})();
