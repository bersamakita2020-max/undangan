(function(){
  const { sb, PF, $, $$, esc, toast, copy, inviteUrl, prettyUrl, setupLogin, role } = APP;
  const S = { session:null, inv:null, data:{}, theme:{}, wa:"", media:[], guests:[], rsvps:[], dirty:false };
  const ZONA = { WIB:"+07:00", WITA:"+08:00", WIT:"+09:00" };
  const DEFAULT_WA = "Assalamu'alaikum Wr. Wb.\n\nKepada Yth.\nBapak/Ibu/Saudara/i *{nama}*\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\n*{mempelai}*\n📅 {tanggal}\n\nInfo lengkap acara, lokasi, dan konfirmasi kehadiran ada di link undangan berikut:\n{link}\n\nMerupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih.\nWassalamu'alaikum Wr. Wb.";
  const busy = (on, msg) => { $("#busy").hidden = !on; if (msg) $("#busyMsg").textContent = msg; };
  const getP = (o, p) => p.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o);
  const setP = (o, p, v) => { const ks = p.split("."); let a = o; ks.slice(0, -1).forEach(k => { if (a[k] == null || typeof a[k] !== "object") a[k] = {}; a = a[k]; }); a[ks.at(-1)] = v; };
  const absUrl = u => !u ? "" : /^(https?:|data:|blob:)/.test(u) ? u : "../" + u;
  function markDirty(){ S.dirty = true; $("#dirty").textContent = "● Ada perubahan yang belum disimpan"; }
  window.addEventListener("beforeunload", e => { if (S.dirty) { e.preventDefault(); e.returnValue = ""; } });

  // ---------------- Init ----------------
  setupLogin(async session => {
    S.session = session;
    const isAdmin = role(session) === "admin";
    $("#who").innerHTML = `${esc(session.user.email)}<br>${isAdmin ? "Admin" : "Klien"}`;
    if (isAdmin) $("#adminLink").hidden = false;
    const invId = new URLSearchParams(location.search).get("inv");
    let q = sb.from("invitations").select("*");
    q = invId ? q.eq("id", invId) : q.eq("owner_id", session.user.id);
    const { data, error } = await q.order("created_at").limit(1);
    if (error || !data || !data.length) {
      $("main.wrap").innerHTML = `<div class="card"><h3>Belum ada undangan</h3><p class="muted">${isAdmin ? 'Akun admin tidak punya undangan sendiri. Buka <a href="../admin/">halaman Admin</a> lalu klik "Kelola" pada klien.' : "Akun Anda belum terhubung ke undangan. Hubungi admin."}</p></div>`;
      $("#savebar").hidden = true; $("#tabs").hidden = true; return;
    }
    S.inv = data[0];
    S.data = structuredClone(S.inv.data || {});
    S.theme = Object.assign({ preset: "peach-rose" }, S.inv.theme || {});
    S.wa = S.inv.wa_template || DEFAULT_WA;
    TEMA.apply(S.theme);
    $("#viewLink").href = inviteUrl(S.inv.slug);
    await Promise.all([loadMedia(), loadGuests(), loadRsvps()]);
    renderAll();
  });

  $$("#tabs button").forEach(b => b.onclick = () => {
    $$("#tabs button").forEach(x => x.classList.toggle("active", x === b));
    $$(".panel").forEach(p => p.classList.toggle("active", p.id === "p-" + b.dataset.tab));
    $("#savebar").hidden = ["tamu", "rsvp"].includes(b.dataset.tab) && !S.dirty;
    window.scrollTo({ top: 0 });
  });

  async function loadMedia(){ const { data } = await sb.from("media").select("*").eq("invitation_id", S.inv.id).order("sort").order("created_at"); S.media = data || []; }
  async function loadGuests(){ const { data } = await sb.from("guests").select("*").eq("invitation_id", S.inv.id).order("no", { nullsFirst: false }).order("created_at"); S.guests = data || []; }
  async function loadRsvps(){ const { data } = await sb.from("rsvps").select("*").eq("invitation_id", S.inv.id).order("created_at", { ascending: false }); S.rsvps = data || []; }

  function renderAll(){ renderRingkasan(); renderMempelai(); renderAcara(); renderCerita(); renderMedia(); renderAmplop(); renderTema(); renderTamu(); renderRsvp(); }

  // ---------------- Generic fields ----------------
  const fld = (path, label, type = "text", ph = "", cls = "") => {
    const v = getP(S.data, path) ?? "";
    if (type === "textarea") return `<label class="f ${cls}">${label}<textarea data-path="${path}" rows="3" placeholder="${esc(ph)}">${esc(v)}</textarea></label>`;
    return `<label class="f ${cls}">${label}<input type="${type}" data-path="${path}" value="${esc(v)}" placeholder="${esc(ph)}"></label>`;
  };
  const imgFld = (path, label, accept = "image/*", folder = "foto") => {
    const v = getP(S.data, path) || "";
    const isAudio = accept.startsWith("audio");
    return `<div class="imgf" data-img="${path}">
      ${isAudio ? `<div class="thumb">🎵</div>` : `<div class="thumb" style="${v ? `background-image:url('${esc(absUrl(v))}')` : ""}">${v ? "" : "Belum ada"}</div>`}
      <div><div class="lbl">${label}</div>
        ${isAudio && v ? `<audio controls src="${esc(absUrl(v))}" style="max-width:240px;height:36px;display:block;margin-bottom:.4rem"></audio>` : ""}
        <div class="row"><label class="btn btn-outline btn-sm">⬆️ Upload<input type="file" accept="${accept}" data-upload="${path}" data-folder="${folder}"></label>
        ${v ? `<button class="btn btn-danger btn-sm" data-clear="${path}">Hapus</button>` : ""}</div></div></div>`;
  };
  document.addEventListener("input", e => {
    const el = e.target;
    if (el.dataset.path) { setP(S.data, el.dataset.path, el.value); markDirty(); }
    if (el.dataset.list) { const arr = S.data[el.dataset.list]; arr[+el.dataset.idx][el.dataset.key] = el.value; markDirty(); if (el.dataset.list === "acara") syncAcara(); }
  });
  document.addEventListener("change", async e => {
    const el = e.target;
    if (el.dataset.list) { const arr = S.data[el.dataset.list]; arr[+el.dataset.idx][el.dataset.key] = el.value; markDirty(); if (el.dataset.list === "acara") syncAcara(); }
    if (el.dataset.upload && el.files[0]) {
      const path = el.dataset.upload, old = getP(S.data, path);
      const url = await uploadFile(el.files[0], el.dataset.folder);
      if (url) { setP(S.data, path, url); await save(true); removeStorage(old); rerenderFor(path); }
      el.value = "";
    }
  });
  document.addEventListener("click", async e => {
    const c = e.target.closest("[data-clear]");
    if (c) { const p = c.dataset.clear, old = getP(S.data, p); setP(S.data, p, ""); await save(true); removeStorage(old); rerenderFor(p); }
    const cp = e.target.closest("[data-copy]"); if (cp) copy(cp.dataset.copy);
  });
  function rerenderFor(path){
    if (path.startsWith("pria") || path.startsWith("wanita")) renderMempelai();
    else if (path.startsWith("loveStory")) renderCerita();
    else if (path === "qris") renderAmplop();
    else renderMedia();
  }

  // ---------------- Upload helpers ----------------
  async function compress(file){
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 400 * 1024) return file;
    try {
      const bmp = await createImageBitmap(file); const max = 1600;
      const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, "image/jpeg", .85));
      return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
    } catch { return file; }
  }
  async function uploadFile(file, folder){
    const limit = 50 * 1024 * 1024;
    if (file.size > limit) { toast("File terlalu besar (maks 50 MB). Kompres dulu atau pakai YouTube.", "err"); return null; }
    busy(true, `Mengunggah ${file.name}…`);
    try {
      const f = folder === "qris" || folder === "musik" || folder === "video" ? file : await compress(file);
      const safe = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
      const path = `${S.inv.owner_id}/${S.inv.id}/${folder}/${Date.now()}-${safe}`;
      const { error } = await sb.storage.from(PF.bucket).upload(path, f, { contentType: f.type || undefined, cacheControl: "31536000", upsert: false });
      if (error) throw error;
      return sb.storage.from(PF.bucket).getPublicUrl(path).data.publicUrl;
    } catch (err) { toast("Gagal upload: " + (err.message || err), "err"); return null; }
    finally { busy(false); }
  }
  const storagePath = url => { const m = String(url || "").match(/\/object\/public\/[^/]+\/(.+)$/); return m ? decodeURIComponent(m[1]) : null; };
  async function removeStorage(url){ const p = storagePath(url); if (p) await sb.storage.from(PF.bucket).remove([p]); }

  // ---------------- Save ----------------
  async function save(quiet){
    syncAcara();
    const { error } = await sb.from("invitations").update({ data: S.data, theme: S.theme, wa_template: S.wa }).eq("id", S.inv.id);
    if (error) { toast("Gagal menyimpan: " + error.message, "err"); return false; }
    S.dirty = false; $("#dirty").textContent = "✓ Tersimpan " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (!quiet) toast("✓ Perubahan disimpan");
    reloadPreview();
    return true;
  }
  $("#saveBtn").onclick = async () => { const b = $("#saveBtn"); b.disabled = true; await save(); b.disabled = false; };

  // ---------------- Ringkasan ----------------
  function renderRingkasan(){
    const d = S.data, link = inviteUrl(S.inv.slug), hadir = S.rsvps.filter(r => r.hadir === "Hadir");
    $("#p-ringkasan").innerHTML = `
      <div class="card"><h3>Undangan ${esc(d.pria?.panggilan || "")} &amp; ${esc(d.wanita?.panggilan || "")}</h3>
        <p class="muted small" style="margin-bottom:.6rem">Link undangan Anda (bagikan ke tamu lewat menu <b>Tamu</b> agar nama tamu tampil otomatis):</p>
        <div class="linkbox"><code>${esc(link)}</code><button class="btn btn-sm btn-outline" data-copy="${esc(link)}">Salin</button><a class="btn btn-sm btn-primary" href="${esc(link)}" target="_blank">Buka</a></div>
        <p class="tiny muted" style="margin-top:.4rem">Link alternatif: ${esc(prettyUrl(S.inv.slug))}</p>
      </div>
      <div class="card"><h3>Statistik</h3><div class="stat">
        <div><b>${S.guests.length}</b>Tamu</div><div><b>${S.guests.filter(g => g.sent).length}</b>Sudah dikirim</div>
        <div><b>${S.rsvps.length}</b>Ucapan</div><div><b>${hadir.length}</b>Konfirmasi hadir</div>
        <div><b>${hadir.reduce((a, r) => a + (r.jumlah || 1), 0)}</b>Perkiraan orang</div>
        <div><b>${S.media.filter(m => m.kind === "photo").length}</b>Foto galeri</div></div></div>
      <div class="card"><h3>Langkah cepat</h3><ol class="small" style="padding-left:1.2rem;display:grid;gap:.3rem">
        <li>Isi data di menu <b>Mempelai</b>, <b>Acara</b>, dan <b>Love Story</b>, lalu klik <b>Simpan Perubahan</b>.</li>
        <li>Upload foto sampul, galeri, video, dan musik di menu <b>Foto, Video &amp; Musik</b>.</li>
        <li>Isi rekening, QRIS, dan alamat kado di menu <b>Amplop</b>.</li>
        <li>Pilih warna di menu <b>Tema</b>.</li>
        <li>Di menu <b>Tamu</b>: download template Excel, isi nama tamu, upload, lalu klik <b>Kirim WA</b> per tamu.</li>
        <li>Pantau konfirmasi dan ucapan di menu <b>RSVP &amp; Ucapan</b>.</li></ol></div>`;
  }

  // ---------------- Mempelai ----------------
  function renderMempelai(){
    const person = (k, t) => `<div class="card"><h3>${t}</h3>
      ${imgFld(k + ".foto", "Foto " + t.toLowerCase(), "image/*", "mempelai")}
      <div class="grid2">${fld(k + ".panggilan", "Nama panggilan")}${fld(k + ".namaLengkap", "Nama lengkap & gelar")}
      ${fld(k + ".anakKe", "Keterangan anak", "text", k === "pria" ? "Putra pertama dari" : "Putri kedua dari")}${fld(k + ".instagram", "Instagram (tanpa @)")}
      ${fld(k + ".ayah", "Nama ayah", "text", "Bapak …")}${fld(k + ".ibu", "Nama ibu", "text", "Ibu …")}</div></div>`;
    $("#p-mempelai").innerHTML = person("pria", "Mempelai Pria") + person("wanita", "Mempelai Wanita") + `
      <div class="card"><h3>Teks Undangan</h3><div class="grid2">
        ${fld("judul", "Judul halaman", "text", "The Wedding of …", "full")}
        ${fld("ayat.teks", "Ayat / kutipan", "textarea", "", "full")}${fld("ayat.sumber", "Sumber ayat", "text", "QS. Ar-Rum : 21")}${fld("hashtag", "Hashtag", "text", "#KamiBahagia")}
        ${fld("penutup", "Kalimat penutup", "textarea", "", "full")}</div></div>`;
  }

  // ---------------- Acara ----------------
  function splitIso(iso){ const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso || ""); const z = /([+-]\d\d:\d\d)$/.exec(iso || ""); return { tgl: m ? m[1] : "", jam: m ? m[2] : "", off: z ? z[1] : "+07:00" }; }
  function prepAcara(){
    S.data.acara = Array.isArray(S.data.acara) ? S.data.acara : [];
    S.data.acara.forEach(a => {
      if (a.tanggal === undefined) { const s = splitIso(a.mulai), e = splitIso(a.selesai); a.tanggal = s.tgl; a.jamMulai = s.jam; a.jamSelesai = e.jam; a.zona = a.zona || Object.keys(ZONA).find(k => ZONA[k] === s.off) || "WIB"; }
    });
  }
  function syncAcara(){
    (S.data.acara || []).forEach(a => {
      const off = ZONA[a.zona] || "+07:00";
      if (a.tanggal && a.jamMulai) a.mulai = `${a.tanggal}T${a.jamMulai}:00${off}`;
      a.selesai = a.tanggal && a.jamSelesai ? `${a.tanggal}T${a.jamSelesai}:00${off}` : "";
    });
    const first = (S.data.acara || []).find(a => a.mulai); if (first) S.data.tanggalUtama = first.mulai;
  }
  const listInput = (list, i, key, label, type = "text", ph = "", cls = "") => {
    const v = S.data[list][i][key] ?? "";
    if (type === "textarea") return `<label class="f ${cls}">${label}<textarea rows="2" data-list="${list}" data-idx="${i}" data-key="${key}" placeholder="${esc(ph)}">${esc(v)}</textarea></label>`;
    if (type === "zona") return `<label class="f ${cls}">${label}<select data-list="${list}" data-idx="${i}" data-key="${key}">${Object.keys(ZONA).map(z => `<option ${z === v ? "selected" : ""}>${z}</option>`).join("")}</select></label>`;
    return `<label class="f ${cls}">${label}<input type="${type}" value="${esc(v)}" placeholder="${esc(ph)}" data-list="${list}" data-idx="${i}" data-key="${key}"></label>`;
  };
  function listControls(list, i){ return `<div class="row"><button class="btn btn-xs btn-ghost" data-move="${list}:${i}:-1">▲</button><button class="btn btn-xs btn-ghost" data-move="${list}:${i}:1">▼</button><button class="btn btn-xs btn-danger" data-del="${list}:${i}">Hapus</button></div>`; }
  document.addEventListener("click", e => {
    const d = e.target.closest("[data-del]"), m = e.target.closest("[data-move]"), a = e.target.closest("[data-add]");
    const rer = l => ({ acara: renderAcara, loveStory: renderCerita, rekening: renderAmplop })[l]();
    if (d) { const [l, i] = d.dataset.del.split(":"); if (!confirm("Hapus item ini?")) return; S.data[l].splice(+i, 1); markDirty(); rer(l); }
    if (m) { const [l, i, k] = m.dataset.move.split(":"); const arr = S.data[l], j = +i + +k; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; markDirty(); rer(l); }
    if (a) { const l = a.dataset.add; S.data[l] = S.data[l] || [];
      S.data[l].push(l === "acara" ? { nama: "Acara", tanggal: "", jamMulai: "", jamSelesai: "", zona: "WIB", tempat: "", alamat: "", maps: "" } : l === "loveStory" ? { tahun: "", judul: "", teks: "", foto: "" } : { bank: "", nomor: "", atasNama: "" });
      markDirty(); rer(l); }
  });
  function renderAcara(){
    prepAcara();
    $("#p-acara").innerHTML = `<div class="help">Tanggal & jam acara pertama otomatis dipakai untuk hitung mundur. Link Maps: buka Google Maps → cari lokasi → Bagikan → Salin link.</div>` +
      S.data.acara.map((a, i) => `<div class="item"><div class="item-h">Acara ${i + 1}${listControls("acara", i)}</div><div class="grid2">
        ${listInput("acara", i, "nama", "Nama acara", "text", "Akad Nikah / Resepsi")}${listInput("acara", i, "tanggal", "Tanggal", "date")}
        ${listInput("acara", i, "jamMulai", "Jam mulai", "time")}${listInput("acara", i, "jamSelesai", "Jam selesai (kosongkan = 'Selesai')", "time")}
        ${listInput("acara", i, "zona", "Zona waktu", "zona")}${listInput("acara", i, "tempat", "Nama tempat")}
        ${listInput("acara", i, "alamat", "Alamat lengkap", "textarea", "", "full")}${listInput("acara", i, "maps", "Link Google Maps", "url", "https://maps.app.goo.gl/…", "full")}
      </div></div>`).join("") +
      `<button class="btn btn-outline" data-add="acara">＋ Tambah acara</button>
      <div class="card" style="margin-top:1rem"><h3>Peta</h3>${fld("petaQuery", "Lokasi peta (nama tempat, alamat, atau koordinat)", "text", "Masjid Agung Sintang")}</div>`;
  }

  // ---------------- Love story ----------------
  function renderCerita(){
    S.data.loveStory = S.data.loveStory || [];
    $("#p-cerita").innerHTML = `<div class="help">Kosongkan semua item jika tidak ingin menampilkan Love Story.</div>` + S.data.loveStory.map((s, i) => `<div class="item"><div class="item-h">Cerita ${i + 1}${listControls("loveStory", i)}</div>
      ${imgFld(`loveStory.${i}.foto`, "Foto (opsional)", "image/*", "story")}<div class="grid2">
      ${listInput("loveStory", i, "tahun", "Tahun / tanggal")}${listInput("loveStory", i, "judul", "Judul")}${listInput("loveStory", i, "teks", "Cerita", "textarea", "", "full")}</div></div>`).join("") +
      `<button class="btn btn-outline" data-add="loveStory">＋ Tambah cerita</button>`;
  }

  // ---------------- Media ----------------
  function renderMedia(){
    const photos = S.media.filter(m => m.kind === "photo"), vids = S.media.filter(m => m.kind !== "photo");
    $("#p-media").innerHTML = `
      <div class="card"><h3>Foto Utama</h3>
        ${imgFld("fotoCover", "Foto sampul (halaman pembuka)", "image/*", "utama")}${imgFld("fotoHero", "Foto utama (setelah dibuka)", "image/*", "utama")}${imgFld("fotoPenutup", "Foto penutup", "image/*", "utama")}</div>
      <div class="card"><h3>Galeri Foto <span class="muted small">(${photos.length})</span></h3>
        <p class="small muted">Pilih beberapa foto sekaligus. Foto otomatis dikecilkan agar undangan cepat dibuka.</p>
        <div class="row" style="margin-top:.6rem"><label class="btn btn-primary">⬆️ Upload Foto<input type="file" accept="image/*" multiple id="galUp"></label></div>
        <div class="gal">${photos.map((m, i) => `<div class="g"><img src="${esc(absUrl(m.url))}" loading="lazy"><button class="x" data-mdel="${m.id}" title="Hapus">✕</button>
          <div class="mv"><button data-mmove="${m.id}:-1">◀</button><button data-mmove="${m.id}:1">▶</button></div></div>`).join("")}</div></div>
      <div class="card"><h3>Video</h3>
        <p class="small muted">Upload MP4 maks <b>50 MB</b> per file (batas Supabase gratis). Video panjang lebih baik diunggah ke YouTube lalu tempel link-nya.</p>
        <div class="row" style="margin-top:.6rem"><label class="btn btn-primary">⬆️ Upload MP4<input type="file" accept="video/mp4,video/webm,video/quicktime" id="vidUp"></label>
          <input id="ytUrl" placeholder="Link YouTube" style="flex:1;min-width:180px"><input id="vidTitle" placeholder="Judul video (opsional)" style="flex:1;min-width:150px"><button class="btn btn-outline" id="ytAdd">＋ YouTube</button></div>
        <div class="vlist">${vids.map(m => `<div class="v">${m.kind === "video" ? `<video src="${esc(absUrl(m.url))}" preload="metadata" muted></video>` : `<span style="font-size:2rem">▶️</span>`}
          <div style="flex:1"><b class="small">${esc(m.title || (m.kind === "youtube" ? "YouTube" : "Video"))}</b><div class="tiny muted" style="word-break:break-all">${esc(m.kind === "youtube" ? m.url : "MP4")}</div></div>
          <button class="btn btn-danger btn-xs" data-mdel="${m.id}">Hapus</button></div>`).join("") || '<p class="small muted" style="margin-top:.6rem">Belum ada video.</p>'}</div></div>
      <div class="card"><h3>Musik Latar</h3>
        ${imgFld("musik", "File MP3 (diputar saat tamu membuka undangan)", "audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac", "musik")}
        ${fld("kreditMusik", "Kredit lagu (opsional)", "text", "Judul lagu – Penyanyi")}</div>`;
    $("#galUp").onchange = async e => {
      const files = [...e.target.files]; let sort = Math.max(0, ...S.media.filter(m => m.kind === "photo").map(m => m.sort)) + 1;
      for (const f of files) { const url = await uploadFile(f, "galeri"); if (url) await sb.from("media").insert({ invitation_id: S.inv.id, owner_id: S.inv.owner_id, kind: "photo", url, path: storagePath(url), sort: sort++ }); }
      await loadMedia(); renderMedia(); reloadPreview(); toast(`✓ ${files.length} foto diunggah`);
    };
    $("#vidUp").onchange = async e => {
      const f = e.target.files[0]; if (!f) return; const url = await uploadFile(f, "video");
      if (url) { await sb.from("media").insert({ invitation_id: S.inv.id, owner_id: S.inv.owner_id, kind: "video", url, path: storagePath(url), title: $("#vidTitle").value || f.name.replace(/\.\w+$/, ""), sort: 100 + S.media.length }); await loadMedia(); renderMedia(); toast("✓ Video diunggah"); }
    };
    $("#ytAdd").onclick = async () => {
      const u = $("#ytUrl").value.trim(); const id = (u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/) || [])[1] || (/^[\w-]{11}$/.test(u) ? u : null);
      if (!id) return toast("Link YouTube tidak valid", "err");
      await sb.from("media").insert({ invitation_id: S.inv.id, owner_id: S.inv.owner_id, kind: "youtube", url: "https://youtu.be/" + id, title: $("#vidTitle").value || "Video", sort: 100 + S.media.length });
      await loadMedia(); renderMedia(); toast("✓ Video YouTube ditambahkan");
    };
  }
  document.addEventListener("click", async e => {
    const d = e.target.closest("[data-mdel]");
    if (d) { if (!confirm("Hapus media ini?")) return; const m = S.media.find(x => x.id === d.dataset.mdel);
      await sb.from("media").delete().eq("id", m.id); if (m.path) await sb.storage.from(PF.bucket).remove([m.path]);
      await loadMedia(); renderMedia(); reloadPreview(); toast("Media dihapus"); }
    const mv = e.target.closest("[data-mmove]");
    if (mv) { const [id, k] = mv.dataset.mmove.split(":"); const ph = S.media.filter(m => m.kind === "photo"); const i = ph.findIndex(m => m.id === id), j = i + +k;
      if (j < 0 || j >= ph.length) return; [ph[i], ph[j]] = [ph[j], ph[i]];
      await Promise.all(ph.map((m, n) => sb.from("media").update({ sort: n + 1 }).eq("id", m.id))); await loadMedia(); renderMedia(); }
  });

  // ---------------- Amplop ----------------
  function renderAmplop(){
    S.data.rekening = S.data.rekening || [];
    $("#p-amplop").innerHTML = `<div class="card"><h3>Rekening &amp; E-Wallet</h3>
      ${S.data.rekening.map((r, i) => `<div class="item"><div class="item-h">Rekening ${i + 1}${listControls("rekening", i)}</div><div class="grid2">
        ${listInput("rekening", i, "bank", "Bank / e-wallet", "text", "BRI / BCA / DANA / GoPay")}${listInput("rekening", i, "nomor", "Nomor rekening / HP")}${listInput("rekening", i, "atasNama", "Atas nama", "text", "", "full")}</div></div>`).join("")}
      <button class="btn btn-outline" data-add="rekening">＋ Tambah rekening</button></div>
      <div class="card"><h3>QRIS</h3>${imgFld("qris", "Gambar QRIS (PNG/JPG)", "image/*", "qris")}</div>
      <div class="card"><h3>Alamat Kirim Kado</h3><div class="grid2">${fld("alamatKado.penerima", "Nama penerima")}${fld("alamatKado.hp", "No. HP")}${fld("alamatKado.alamat", "Alamat lengkap", "textarea", "", "full")}</div></div>
      <div class="card"><h3>Konfirmasi via WhatsApp</h3>${fld("nomorWhatsApp", "Nomor WhatsApp (opsional, format 628…)", "tel", "6281234567890")}
      <p class="tiny muted">Jika diisi, setelah tamu mengirim RSVP akan dibukakan WhatsApp ke nomor ini.</p></div>`;
  }

  // ---------------- Tema ----------------
  function renderTema(){
    const t = TEMA.resolve(S.theme);
    $("#p-tema").innerHTML = `<div class="preview-wrap"><div>
      <div class="card"><h3>Pilih Tema Warna</h3><div class="themes">${Object.entries(TEMA.PRESETS).map(([k, p]) => `<button class="theme ${S.theme.preset === k && !S.theme.primary ? "active" : ""}" data-preset="${k}">
        <div class="sw"><span style="background:${TEMA.mix(p.primary, "#fff", .85)}"></span><span style="background:${p.primary}"></span><span style="background:${p.accent}"></span><span style="background:${p.gold}"></span></div>${p.nama}</button>`).join("")}</div></div>
      <div class="card"><h3>Warna Kustom</h3><p class="small muted">Ubah warna sendiri (opsional). Warna lembut & latar dibuat otomatis.</p>
        <div class="row" style="margin-top:.6rem">
          <label class="f">Warna utama<input type="color" id="cPrimary" value="${t.primary}"></label>
          <label class="f">Warna aksen<input type="color" id="cAccent" value="${t.accent}"></label>
          <label class="f">Warna emas<input type="color" id="cGold" value="${t.gold}"></label>
          <button class="btn btn-ghost btn-sm" id="cReset">Reset ke preset</button></div></div>
      <div class="help">Pratinjau di samping langsung berubah. Klik <b>Simpan Perubahan</b> agar tema dipakai di undangan.</div>
      </div><div class="phone"><iframe id="previewFrame" src="${esc(inviteUrl(S.inv.slug))}&preview=1" title="Pratinjau"></iframe></div></div>`;
    const push = () => { TEMA.apply(S.theme); const f = $("#previewFrame"); if (f && f.contentWindow) f.contentWindow.postMessage({ type: "tema", theme: S.theme }, "*"); markDirty(); };
    $$("[data-preset]").forEach(b => b.onclick = () => { S.theme = { preset: b.dataset.preset }; push(); renderTema(); });
    ["Primary", "Accent", "Gold"].forEach(k => $("#c" + k).oninput = e => { S.theme[k.toLowerCase()] = e.target.value; push(); $$("[data-preset]").forEach(b => b.classList.remove("active")); });
    $("#cReset").onclick = () => { S.theme = { preset: S.theme.preset || "peach-rose" }; push(); renderTema(); };
    $("#previewFrame").onload = () => $("#previewFrame").contentWindow.postMessage({ type: "tema", theme: S.theme }, "*");
  }
  function reloadPreview(){ const f = $("#previewFrame"); if (f) f.src = f.src; }

  // ---------------- Tamu ----------------
  const normPhone = p => { let d = String(p || "").replace(/\D/g, ""); if (d.startsWith("0")) d = "62" + d.slice(1); else if (d.startsWith("8")) d = "62" + d; return d; };
  function tanggalText(){ const a = (S.data.acara || [])[0]; if (!a || !a.mulai) return ""; const d = new Date(a.mulai); return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }); }
  const waText = g => S.wa.replace(/\{nama\}/g, g.name).replace(/\{link\}/g, inviteUrl(S.inv.slug, g.name))
    .replace(/\{mempelai\}/g, `${S.data.pria?.panggilan || ""} & ${S.data.wanita?.panggilan || ""}`).replace(/\{tanggal\}/g, tanggalText());
  function renderTamu(filter = ""){
    const f = filter.toLowerCase(), list = S.guests.filter(g => !f || g.name.toLowerCase().includes(f) || (g.phone || "").includes(f));
    $("#p-tamu").innerHTML = `
      <div class="card"><h3>Import Daftar Tamu dari Excel</h3>
        <ol class="small" style="padding-left:1.2rem;margin-bottom:.7rem"><li>Download template Excel.</li><li>Isi kolom <b>Nama Tamu</b> (wajib), <b>No. WhatsApp</b>, dan <b>Keterangan</b>.</li><li>Upload kembali file-nya di sini.</li></ol>
        <div class="row"><a class="btn btn-outline" href="template-tamu.xlsx" download>⬇️ Download Template</a>
          <label class="btn btn-primary">⬆️ Upload Excel<input type="file" id="xlsUp" accept=".xlsx,.xls,.csv"></label>
          <button class="btn btn-outline" id="xlsExport">📤 Export Tamu</button></div></div>
      <div class="card"><h3>Tambah Tamu Manual</h3><div class="row"><input id="gName" placeholder="Nama tamu" style="flex:2;min-width:160px"><input id="gPhone" placeholder="No. WhatsApp" style="flex:1;min-width:130px"><button class="btn btn-primary" id="gAdd">＋ Tambah</button></div></div>
      <div class="card"><h3>Template Pesan WhatsApp</h3><p class="tiny muted">Kode otomatis: <b>{nama}</b> nama tamu · <b>{link}</b> link undangan pribadi · <b>{mempelai}</b> · <b>{tanggal}</b></p>
        <textarea id="waTpl" rows="8" style="margin-top:.5rem">${esc(S.wa)}</textarea>
        <div class="row" style="margin-top:.5rem"><button class="btn btn-outline btn-sm" id="waSave">💾 Simpan template</button><button class="btn btn-ghost btn-sm" id="waReset">Kembalikan default</button></div></div>
      <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:.6rem"><h3 style="margin:0">Daftar Tamu <span class="muted small">(${S.guests.length} · ${S.guests.filter(g => g.sent).length} terkirim)</span></h3>
        <div class="row"><input id="gSearch" placeholder="Cari…" value="${esc(filter)}" style="width:160px"><button class="btn btn-danger btn-sm" id="gClear">Hapus semua</button></div></div>
        <div class="tbl-wrap"><table><thead><tr><th>No</th><th>Nama Tamu</th><th>WhatsApp</th><th>Ket.</th><th>Link</th><th>Kirim</th><th></th></tr></thead><tbody>
        ${list.map((g, i) => { const link = inviteUrl(S.inv.slug, g.name); return `<tr><td>${g.no ?? i + 1}</td><td><b>${esc(g.name)}</b></td><td>${esc(g.phone || "-")}</td><td class="small">${esc(g.note || "")}</td>
          <td><button class="btn btn-xs btn-outline" data-copy="${esc(link)}" title="${esc(link)}">🔗 Salin</button></td>
          <td><div class="acts"><a class="btn btn-xs btn-wa" target="_blank" rel="noopener" data-wa="${g.id}" href="https://wa.me/${normPhone(g.phone)}?text=${encodeURIComponent(waText(g))}">Kirim WA</a>
            <button class="btn btn-xs btn-ghost" data-copy="${esc(waText(g))}">Salin pesan</button>${g.sent ? '<span class="pill ok">✓ terkirim</span>' : ""}</div></td>
          <td><button class="btn btn-xs btn-danger" data-gdel="${g.id}">✕</button></td></tr>`; }).join("") || '<tr><td colspan="7" class="muted">Belum ada tamu.</td></tr>'}
        </tbody></table></div></div>`;
    $("#gSearch").oninput = e => { const v = e.target.value; renderTamu(v); const s = $("#gSearch"); s.focus(); s.setSelectionRange(v.length, v.length); };
    $("#xlsUp").onchange = importExcel;
    $("#xlsExport").onclick = () => exportXlsx(S.guests.map((g, i) => ({ No: g.no ?? i + 1, "Nama Tamu": g.name, "No. WhatsApp": g.phone || "", Keterangan: g.note || "", "Link Undangan": inviteUrl(S.inv.slug, g.name), Status: g.sent ? "Terkirim" : "Belum" })), "daftar-tamu");
    $("#gAdd").onclick = async () => { const name = $("#gName").value.trim(); if (!name) return toast("Isi nama tamu", "err");
      const { error } = await sb.from("guests").insert({ invitation_id: S.inv.id, owner_id: S.inv.owner_id, name, phone: normPhone($("#gPhone").value), no: S.guests.length + 1 });
      if (error) return toast(error.message, "err"); await loadGuests(); renderTamu(); toast("✓ Tamu ditambahkan"); };
    $("#waTpl").oninput = e => { S.wa = e.target.value; };
    $("#waSave").onclick = async () => { S.wa = $("#waTpl").value; await save(); renderTamu(filter); };
    $("#waReset").onclick = () => { S.wa = DEFAULT_WA; $("#waTpl").value = S.wa; markDirty(); };
    $("#gClear").onclick = async () => { if (!S.guests.length || !confirm(`Hapus SEMUA ${S.guests.length} tamu?`)) return; await sb.from("guests").delete().eq("invitation_id", S.inv.id); await loadGuests(); renderTamu(); };
  }
  document.addEventListener("click", async e => {
    const w = e.target.closest("[data-wa]");
    if (w) { const g = S.guests.find(x => x.id === w.dataset.wa); if (g && !g.sent) { await sb.from("guests").update({ sent: true, sent_at: new Date().toISOString() }).eq("id", g.id); g.sent = true; setTimeout(() => renderTamu($("#gSearch")?.value || ""), 400); } }
    const d = e.target.closest("[data-gdel]");
    if (d) { if (!confirm("Hapus tamu ini?")) return; await sb.from("guests").delete().eq("id", d.dataset.gdel); await loadGuests(); renderTamu(); }
  });
  async function importExcel(e){
    const file = e.target.files[0]; if (!file) return;
    try {
      busy(true, "Membaca Excel…");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" });
      const norm = s => String(s).toLowerCase().replace(/[^a-z]/g, "");
      const hi = rows.findIndex(r => r.some(c => norm(c).includes("namatamu") || norm(c) === "nama"));
      if (hi < 0) throw new Error("Kolom 'Nama Tamu' tidak ditemukan. Gunakan template.");
      const H = rows[hi].map(norm), col = (...ks) => H.findIndex(h => ks.some(k => h.includes(k)));
      const cNo = H.findIndex(h => h === "no"), cName = col("namatamu", "nama"), cPh = col("whatsapp", "wa", "hp", "telp", "phone"), cNote = col("keterangan", "ket", "catatan");
      let n = S.guests.length;
      const items = rows.slice(hi + 1).filter(r => String(r[cName] || "").trim()).map(r => ({
        invitation_id: S.inv.id, owner_id: S.inv.owner_id, name: String(r[cName]).trim().slice(0, 120),
        phone: cPh >= 0 ? normPhone(r[cPh]) : null, note: cNote >= 0 ? String(r[cNote] || "").trim() : null, no: cNo >= 0 && r[cNo] !== "" ? parseInt(r[cNo]) || ++n : ++n }));
      if (!items.length) throw new Error("Tidak ada nama tamu di file.");
      const exist = new Set(S.guests.map(g => g.name.toLowerCase()));
      const fresh = items.filter(i => !exist.has(i.name.toLowerCase()));
      if (fresh.length) { const { error } = await sb.from("guests").insert(fresh); if (error) throw error; }
      await loadGuests(); renderTamu(); renderRingkasan();
      toast(`✓ ${fresh.length} tamu diimpor${items.length - fresh.length ? `, ${items.length - fresh.length} duplikat dilewati` : ""}`);
    } catch (err) { toast(err.message || String(err), "err"); }
    finally { busy(false); e.target.value = ""; }
  }
  function exportXlsx(rows, name){
    const ws = XLSX.utils.json_to_sheet(rows); ws["!cols"] = Object.keys(rows[0] || { a: 1 }).map(k => ({ wch: Math.max(10, Math.min(60, k.length + 6, ...rows.map(r => String(r[k] ?? "").length + 2))) }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Data"); XLSX.writeFile(wb, `${name}-${S.inv.slug}.xlsx`);
  }

  // ---------------- RSVP ----------------
  function renderRsvp(){
    const c = h => S.rsvps.filter(r => r.hadir === h);
    $("#p-rsvp").innerHTML = `<div class="card"><h3>Ringkasan RSVP</h3><div class="stat">
      <div><b>${S.rsvps.length}</b>Ucapan</div><div><b>${c("Hadir").length}</b>Hadir</div><div><b>${c("Hadir").reduce((a, r) => a + (r.jumlah || 1), 0)}</b>Total orang hadir</div>
      <div><b>${c("Tidak Hadir").length}</b>Tidak hadir</div><div><b>${c("Masih Ragu").length}</b>Masih ragu</div></div>
      <div class="row" style="margin-top:.8rem"><button class="btn btn-outline" id="rExport">📤 Export Excel</button><button class="btn btn-ghost" id="rReload">🔄 Muat ulang</button></div></div>
      <div class="card"><h3>Daftar Ucapan</h3><div class="tbl-wrap"><table><thead><tr><th>Waktu</th><th>Nama</th><th>Kehadiran</th><th>Jml</th><th>Ucapan</th><th></th></tr></thead><tbody>
      ${S.rsvps.map(r => `<tr><td class="tiny">${new Date(r.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td><td><b>${esc(r.nama)}</b></td>
        <td><span class="pill ${r.hadir === "Hadir" ? "ok" : r.hadir === "Tidak Hadir" ? "no" : "maybe"}">${esc(r.hadir)}</span></td><td>${r.jumlah}</td><td class="small">${esc(r.ucapan)}</td>
        <td><button class="btn btn-xs btn-danger" data-rdel="${r.id}" title="Hapus ucapan">✕</button></td></tr>`).join("") || '<tr><td colspan="6" class="muted">Belum ada ucapan.</td></tr>'}</tbody></table></div></div>`;
    $("#rExport").onclick = () => exportXlsx(S.rsvps.map(r => ({ Waktu: new Date(r.created_at).toLocaleString("id-ID"), Nama: r.nama, Kehadiran: r.hadir, "Jumlah Orang": r.jumlah, Ucapan: r.ucapan })), "rsvp-ucapan");
    $("#rReload").onclick = async () => { await loadRsvps(); renderRsvp(); renderRingkasan(); toast("✓ Diperbarui"); };
  }
  document.addEventListener("click", async e => {
    const d = e.target.closest("[data-rdel]"); if (!d) return;
    if (!confirm("Hapus ucapan ini?")) return; await sb.from("rsvps").delete().eq("id", d.dataset.rdel); await loadRsvps(); renderRsvp();
  });
})();
