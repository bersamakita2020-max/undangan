(function(){
  const { sb, $, $$, esc, toast, copy, inviteUrl, genPassword, slugify, setupLogin, role } = APP;
  const busy = (on, msg) => { $("#busy").hidden = !on; if (msg) $("#busyMsg").textContent = msg; };
  async function call(action, payload = {}){
    const { data, error } = await sb.functions.invoke("admin-users", { body: { action, ...payload } });
    if (error) { let msg = error.message; try { const j = await error.context.json(); msg = j.error || msg; } catch {} throw new Error(msg); }
    if (data && data.error) throw new Error(data.error);
    return data;
  }
  setupLogin(async session => {
    $("#who").innerHTML = esc(session.user.email) + "<br>" + (role(session) === "admin" ? "Admin" : "Klien");
    if (role(session) !== "admin") { $("#notAdmin").hidden = false; return; }
    $("#adminArea").hidden = false; load();
  });
  const f = $("#createForm");
  f.password.value = genPassword();
  $("#genPw").onclick = () => f.password.value = genPassword();
  f.full_name.oninput = () => { if (!f.slug.dataset.touched) f.slug.value = slugify(f.full_name.value); };
  f.slug.oninput = () => { f.slug.dataset.touched = 1; f.slug.value = f.slug.value.toLowerCase().replace(/[^a-z0-9-]/g, ""); $("#slugHint").textContent = inviteUrl(f.slug.value); };
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(f).entries());
    const data = structuredClone(window.UNDANGAN_DEFAULT || {});
    const [a, b] = fd.full_name.split(/\s*(?:&|dan|\+)\s*/i);
    if (a) data.pria.panggilan = a.trim(); if (b) data.wanita.panggilan = b.trim();
    data.judul = `The Wedding of ${data.pria.panggilan} & ${data.wanita.panggilan}`;
    busy(true, "Membuat akun…");
    try {
      const r = await call("create", { ...fd, data });
      $("#createResult").innerHTML = `<div class="ok-box"><b>✓ Akun dibuat.</b> Kirim info login ini ke klien:<br>
        Dashboard: <code>${esc(location.origin + location.pathname.replace(/admin\/.*$/, "dashboard/"))}</code><br>Email: <code>${esc(fd.email)}</code><br>Password: <code>${esc(fd.password)}</code><br>
        Link undangan: <code>${esc(inviteUrl(r.invitation.slug))}</code>
        <div class="row" style="margin-top:.5rem"><button class="btn btn-sm btn-outline" data-copy="${esc(`Login dashboard undangan:\n${location.origin + location.pathname.replace(/admin\/.*$/, "dashboard/")}\nEmail: ${fd.email}\nPassword: ${fd.password}\nLink undangan: ${inviteUrl(r.invitation.slug)}`)}">Salin info login</button></div></div>`;
      f.reset(); delete f.slug.dataset.touched; f.password.value = genPassword(); load();
    } catch (err) { toast(err.message, "err"); }
    finally { busy(false); }
  });
  $("#reload").onclick = load;
  async function load(){
    busy(true, "Memuat…");
    try {
      const { users } = await call("list");
      $("#users").innerHTML = users.map(u => {
        const inv = (u.invitations || [])[0];
        return `<tr><td><b>${esc(u.full_name || "-")}</b><div class="tiny muted">${esc(u.email)}</div></td>
          <td><span class="pill">${u.role}</span></td>
          <td>${inv ? `<a href="${esc(inviteUrl(inv.slug))}" target="_blank">${esc(inv.slug)}</a>` : "-"}</td>
          <td>${inv ? inv.guests : "-"}</td><td>${inv ? inv.rsvp : "-"}</td>
          <td>${u.active ? '<span class="pill ok">Aktif</span>' : '<span class="pill no">Nonaktif</span>'}</td>
          <td><div class="acts">${inv ? `<a class="btn btn-xs btn-primary" href="../dashboard/?inv=${inv.id}">Kelola</a><button class="btn btn-xs btn-outline" data-slug="${inv.id}" data-cur="${esc(inv.slug)}">Ubah slug</button>` : ""}
            ${u.role !== "admin" ? `<button class="btn btn-xs btn-outline" data-pw="${u.id}" data-email="${esc(u.email)}">Reset password</button>
            <button class="btn btn-xs ${u.active ? "btn-danger" : "btn-sage"}" data-act="${u.id}" data-to="${u.active ? 0 : 1}">${u.active ? "Nonaktifkan" : "Aktifkan"}</button>` : ""}</div></td></tr>`;
      }).join("") || '<tr><td colspan="7">Belum ada akun.</td></tr>';
    } catch (err) { toast(err.message, "err"); }
    finally { busy(false); }
  }
  document.addEventListener("click", async e => {
    const cp = e.target.closest("[data-copy]"); if (cp) return copy(cp.dataset.copy);
    const a = e.target.closest("[data-act]"), p = e.target.closest("[data-pw]"), s = e.target.closest("[data-slug]");
    try {
      if (a) { const on = a.dataset.to === "1"; if (!confirm(on ? "Aktifkan akun & undangan ini?" : "Nonaktifkan akun? Klien tidak bisa login dan undangannya tidak bisa dibuka.")) return;
        busy(true); await call("set_active", { user_id: a.dataset.act, active: on }); toast("✓ Status diubah"); await load(); }
      if (p) { const pw = genPassword(); if (!confirm(`Reset password ${p.dataset.email}?`)) return; busy(true); await call("reset_password", { user_id: p.dataset.pw, password: pw });
        busy(false); prompt("Password baru (salin & kirim ke klien):", pw); }
      if (s) { const v = prompt("Slug baru (huruf kecil, angka, minus):", s.dataset.cur); if (!v || v === s.dataset.cur) return; busy(true); await call("set_slug", { invitation_id: s.dataset.slug, slug: v }); toast("✓ Slug diubah"); await load(); }
    } catch (err) { toast(err.message, "err"); }
    finally { busy(false); }
  });
})();
