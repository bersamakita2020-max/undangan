(function(){
  const { sb, $, $$, esc, toast, copy, inviteUrl, genPassword, slugify, setupLogin, role } = APP;
  const busy = (on, msg) => { $("#busy").hidden = !on; if (msg) $("#busyMsg").textContent = msg; };
  async function call(action, payload = {}){
    const { data, error } = await sb.functions.invoke("admin-users", { body: { action, ...payload } });
    if (error) { let msg = error.message; try { const j = await error.context.json(); msg = j.error || msg; } catch {} throw new Error(msg); }
    if (data && data.error) throw new Error(data.error);
    return data;
  }
  const C = { templates: [], packages: [] };
  const rp = n => "Rp" + Number(n || 0).toLocaleString("id-ID");
  const pkgName = s => (C.packages.find(p => p.slug === s) || { name: s }).name;
  const pkgRank = s => (C.packages.find(p => p.slug === s) || { rank: 1 }).rank;
  async function loadCatalog(){
    const [t, p] = await Promise.all([sb.from("templates").select("*").order("sort"), sb.from("packages").select("*").order("rank")]);
    if (t.error || p.error) { toast("Gagal memuat katalog: " + (t.error || p.error).message, "err"); return; }
    C.templates = t.data; C.packages = p.data;
    $("#cPkg").innerHTML = C.packages.map(p => `<option value="${esc(p.slug)}">${esc(p.name)} — ${rp(p.price)}</option>`).join("");
    fillTplSelect(); renderCatalog();
  }
  function fillTplSelect(){
    const r = pkgRank($("#cPkg").value);
    $("#cTpl").innerHTML = C.templates.filter(t => t.active && pkgRank(t.tier) <= r).map(t => `<option value="${esc(t.slug)}">${esc(t.name)} (${esc(pkgName(t.tier))})</option>`).join("");
  }
  setupLogin(async session => {
    $("#who").innerHTML = esc(session.user.email) + "<br>" + (role(session) === "admin" ? "Admin" : "Klien");
    if (role(session) !== "admin") { $("#notAdmin").hidden = false; return; }
    $("#adminArea").hidden = false; await loadCatalog(); load();
    $("#cPkg").onchange = fillTplSelect;
  });
  let USERS = [];
  function renderCatalog(){
    const used = slug => USERS.reduce((a, u) => a + (u.invitations || []).filter(i => i.template === slug).length, 0);
    $("#tplRows").innerHTML = C.templates.map(t => `<tr data-trow="${esc(t.slug)}">
      <td><img src="${esc(BRAND.abs(t.thumbnail || ""))}" alt=""></td>
      <td><b>${esc(t.name)}</b><div class="tiny muted">${esc(t.slug)} · <a href="${esc(BRAND.ROOT + "?demo=" + t.slug)}" target="_blank">demo</a></div></td>
      <td><input data-k="category" value="${esc(t.category)}"></td>
      <td><select data-k="tier">${C.packages.map(p => `<option value="${esc(p.slug)}" ${p.slug === t.tier ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></td>
      <td><input data-k="price" type="number" min="0" step="10000" value="${t.price}" style="width:100px"></td>
      <td><input data-k="sort" type="number" value="${t.sort}" style="width:56px"></td>
      <td><input data-k="is_new" type="checkbox" ${t.is_new ? "checked" : ""}></td>
      <td><input data-k="active" type="checkbox" ${t.active ? "checked" : ""}></td>
      <td>${used(t.slug)}</td>
      <td><button class="btn btn-xs btn-primary" data-tsave="${esc(t.slug)}">Simpan</button></td></tr>`).join("");
    $("#pkgRows").innerHTML = C.packages.map(p => `<div class="card" style="margin:0" data-prow="${esc(p.slug)}"><h3 style="margin-bottom:.4rem">${esc(p.name)} <span class="pill">level ${p.rank}</span></h3>
      <label class="f">Nama<input data-k="name" value="${esc(p.name)}"></label>
      <label class="f">Harga (Rp)<input data-k="price" type="number" min="0" step="10000" value="${p.price}"></label>
      <label class="f">Tagline<input data-k="tagline" value="${esc(p.tagline || "")}"></label>
      <label class="f">Fitur (satu per baris)<textarea data-k="features" rows="6">${esc((p.features || []).join("\n"))}</textarea></label>
      <label class="small"><input data-k="highlight" type="checkbox" ${p.highlight ? "checked" : ""}> Tandai "Paling Laris"</label>
      <div style="margin-top:.5rem"><button class="btn btn-sm btn-primary" data-psave="${esc(p.slug)}">Simpan paket</button></div></div>`).join("");
  }
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
      const r = await call("create", { ...fd, data, theme: { preset: "template" } });
      $("#createResult").innerHTML = `<div class="ok-box"><b>✓ Akun dibuat.</b> Kirim info login ini ke klien:<br>
        Dashboard: <code>${esc(location.origin + location.pathname.replace(/admin\/.*$/, "dashboard/"))}</code><br>Email: <code>${esc(fd.email)}</code><br>Password: <code>${esc(fd.password)}</code><br>
        Link undangan: <code>${esc(inviteUrl(r.invitation.slug))}</code>
        <div class="row" style="margin-top:.5rem"><button class="btn btn-sm btn-outline" data-copy="${esc(`Login dashboard undangan:\n${location.origin + location.pathname.replace(/admin\/.*$/, "dashboard/")}\nEmail: ${fd.email}\nPassword: ${fd.password}\nLink undangan: ${inviteUrl(r.invitation.slug)}`)}">Salin info login</button></div></div>`;
      f.reset(); fillTplSelect(); delete f.slug.dataset.touched; f.password.value = genPassword(); load();
    } catch (err) { toast(err.message, "err"); }
    finally { busy(false); }
  });
  $("#reload").onclick = load;
  async function load(){
    busy(true, "Memuat…");
    try {
      const { users } = await call("list"); USERS = users;
      $("#users").innerHTML = users.map(u => {
        const inv = (u.invitations || [])[0];
        return `<tr><td><b>${esc(u.full_name || "-")}</b><div class="tiny muted">${esc(u.email)}</div></td>
          <td><span class="pill">${u.role}</span></td>
          <td>${inv ? `<a href="${esc(inviteUrl(inv.slug))}" target="_blank">${esc(inv.slug)}</a>` : "-"}</td>
          <td>${inv ? `<select class="pkg-sel" data-pkg="${inv.id}" data-cur="${esc(inv.package)}">${C.packages.map(p => `<option value="${esc(p.slug)}" ${p.slug === inv.package ? "selected" : ""}>${esc(p.name)} · ${rp(p.price)}</option>`).join("")}</select>` : "-"}</td>
          <td class="small">${inv ? esc((C.templates.find(t => t.slug === inv.template) || { name: inv.template }).name) : "-"}</td>
          <td>${inv ? inv.guests : "-"}</td><td>${inv ? inv.rsvp : "-"}</td>
          <td>${u.active ? '<span class="pill ok">Aktif</span>' : '<span class="pill no">Nonaktif</span>'}</td>
          <td><div class="acts">${inv ? `<a class="btn btn-xs btn-primary" href="../dashboard/?inv=${inv.id}">Kelola</a><button class="btn btn-xs btn-outline" data-slug="${inv.id}" data-cur="${esc(inv.slug)}">Ubah slug</button>` : ""}
            ${u.role !== "admin" ? `<button class="btn btn-xs btn-outline" data-pw="${u.id}" data-email="${esc(u.email)}">Reset password</button>
            <button class="btn btn-xs ${u.active ? "btn-danger" : "btn-sage"}" data-act="${u.id}" data-to="${u.active ? 0 : 1}">${u.active ? "Nonaktifkan" : "Aktifkan"}</button>` : ""}</div></td></tr>`;
      }).join("") || '<tr><td colspan="9">Belum ada akun.</td></tr>';
      renderCatalog();
    } catch (err) { toast(err.message, "err"); }
    finally { busy(false); }
  }
  document.addEventListener("change", async e => {
    const sel = e.target.closest("[data-pkg]"); if (!sel) return;
    const name = pkgName(sel.value);
    if (!confirm(`Ubah paket undangan ini menjadi ${name}? Klien akan bisa memilih template sampai paket ${name}.`)) { sel.value = sel.dataset.cur; return; }
    busy(true, "Mengubah paket…");
    try { await call("set_package", { invitation_id: sel.dataset.pkg, package: sel.value }); sel.dataset.cur = sel.value; toast("✓ Paket diubah ke " + name); }
    catch (err) { toast(err.message, "err"); sel.value = sel.dataset.cur; }
    finally { busy(false); }
  });
  document.addEventListener("click", async e => {
    const cp = e.target.closest("[data-copy]"); if (cp) return copy(cp.dataset.copy);
    const ts = e.target.closest("[data-tsave]"), ps = e.target.closest("[data-psave]");
    if (ts) { const row = ts.closest("tr"), v = k => row.querySelector(`[data-k="${k}"]`);
      const upd = { category: v("category").value.trim(), tier: v("tier").value, price: parseInt(v("price").value) || 0, sort: parseInt(v("sort").value) || 0, is_new: v("is_new").checked, active: v("active").checked };
      if (upd.price < 0) return toast("Harga tidak valid", "err");
      busy(true, "Menyimpan template…"); const { error } = await sb.from("templates").update(upd).eq("slug", ts.dataset.tsave); busy(false);
      if (error) return toast(error.message, "err"); toast("✓ Template disimpan"); await loadCatalog(); return; }
    if (ps) { const box = ps.closest("[data-prow]"), v = k => box.querySelector(`[data-k="${k}"]`);
      const upd = { name: v("name").value.trim(), price: parseInt(v("price").value) || 0, tagline: v("tagline").value.trim(), features: v("features").value.split("\n").map(x => x.trim()).filter(Boolean), highlight: v("highlight").checked };
      busy(true, "Menyimpan paket…"); const { error } = await sb.from("packages").update(upd).eq("slug", ps.dataset.psave); busy(false);
      if (error) return toast(error.message, "err"); toast("✓ Paket disimpan"); await loadCatalog(); return; }
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
