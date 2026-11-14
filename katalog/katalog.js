(async function(){
  const PF = window.PLATFORM || {}, B = window.BRAND, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const rp = B.rupiah;
  const DEMO = slug => B.ROOT + "?demo=" + encodeURIComponent(slug) + "&to=Tamu+Undangan";
  // ---------- Data (Supabase, cadangan: registri lokal) ----------
  const FALLBACK_PKG = [
    { slug:"basic", name:"Basic", price:250000, rank:1, tagline:"Undangan cantik & lengkap untuk hari bahagia", features:["Akses template Basic","Nama tamu personal","RSVP & buku ucapan","Amplop digital","Musik, countdown & peta"], highlight:false },
    { slug:"premium", name:"Premium", price:350000, rank:2, tagline:"Paling laris", features:["Semua fitur Basic","Akses template Basic + Premium","Galeri & video","Love story","Import tamu Excel"], highlight:true },
    { slug:"exclusive", name:"Exclusive", price:500000, rank:3, tagline:"Semua template mewah", features:["Semua fitur Premium","Akses semua template","Prioritas dukungan"], highlight:false }];
  let tpls = [], pkgs = [], io;
  const api = p => fetch(PF.supabaseUrl + "/rest/v1/" + p, { headers: { apikey: PF.supabaseKey } }).then(r => r.ok ? r.json() : Promise.reject(r.status));
  try {
    [tpls, pkgs] = await Promise.all([api("templates?select=*&active=eq.true&order=sort.asc"), api("packages?select=*&order=rank.asc")]);
  } catch (e) { console.warn("Memakai data lokal", e); }
  if (!pkgs.length) pkgs = FALLBACK_PKG;
  if (!tpls.length) tpls = TEMPLATES.LIST.map((t, i) => ({ slug:t.slug, name:t.name, category:t.category, tier:t.tier, price:t.price, description:t.desc, thumbnail:`assets/templates/${t.slug}.jpg`, preview:`assets/templates/${t.slug}-full.jpg`, sort:i }));
  tpls = tpls.filter(t => TEMPLATES.MAP[t.slug]); // hanya template yang desainnya tersedia
  const P = Object.fromEntries(pkgs.map(p => [p.slug, p]));
  const minPkgFor = t => P[t.tier] || pkgs[0];

  // ---------- WhatsApp ----------
  const waUmum = () => B.waLink(`Halo ${B.name} 👋\nSaya tertarik membuat undangan digital. Boleh minta info template & paketnya?`);
  function bindWa(){ $$("[data-wa]").forEach(a => { if (a.dataset.wa === "umum" || a.dataset.wa === "konsultasi") a.href = waUmum(); }); }
  bindWa();
  $("#yr").textContent = new Date().getFullYear();
  $("#heroCount").textContent = $("#fTpl").textContent = tpls.length;

  // ---------- Hero phones (rotasi thumbnail) ----------
  const imgs = $$("#heroPhones img"); let hi = 0;
  const pick = ["noir-gold","botanical-leaf","jawa-keraton","pastel-pop","cinematic-film","islamic-arabesque","boho-sunset","rustic-kraft"].filter(s => tpls.some(t => t.slug === s));
  const thumb = s => B.abs((tpls.find(t => t.slug === s) || {}).thumbnail || `assets/templates/${s}.jpg`);
  function rotate(){ imgs.forEach((im, i) => { const s = pick[(hi + i) % pick.length]; im.style.opacity = 0; setTimeout(() => { im.src = thumb(s); im.onload = () => im.style.opacity = 1; }, 300); }); hi++; }
  if (pick.length) { rotate(); setInterval(rotate, 4200); }
  $("#marquee").innerHTML = [...tpls, ...tpls].map(t => `<span>${esc(t.name)}</span>`).join("");

  // ---------- Fitur ----------
  const FEAT = [["💌","Nama tamu personal","Setiap tamu dapat link dengan namanya sendiri."],["📅","Hitung mundur & kalender","Tamu bisa simpan acara ke Google Calendar."],["🗺️","Peta lokasi","Terhubung langsung ke Google Maps."],["📸","Galeri foto & video","Upload foto, video prewedding, atau link YouTube."],["🎵","Musik latar","Pilih lagu favoritmu, otomatis berputar."],["🎁","Amplop digital","Rekening bank, QRIS & alamat kirim kado."],["✅","RSVP & ucapan","Konfirmasi kehadiran tercatat rapi + export Excel."],["📲","Kirim via WhatsApp","Import daftar tamu Excel, kirim sekali klik."],["🎨","Ganti warna tema","8 palet siap pakai atau warna kustom."],["💞","Love story","Ceritakan perjalanan cinta kalian."],["🔐","Dashboard pribadi","Edit sendiri kapan saja, langsung tampil."],["⚡","Cepat & ringan","Dibuka mulus di HP, tanpa install aplikasi."]];
  $("#features").innerHTML = FEAT.map(f => `<div class="feat reveal"><i>${f[0]}</i><div><h4>${f[1]}</h4><p>${f[2]}</p></div></div>`).join("");

  // ---------- Filter & grid ----------
  const cats = ["Semua", ...new Set(tpls.map(t => t.category))];
  let fCat = "Semua", fTier = "all", fQ = "";
  $("#catChips").innerHTML = cats.map(c => `<button class="chip ${c === fCat ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  $("#tierSeg").innerHTML = `<button class="on" data-tier="all">Semua harga</button>` + pkgs.map(p => `<button data-tier="${esc(p.slug)}">${esc(p.name)} · ${rp(p.price).replace(".000", "rb").replace("Rp", "")}</button>`).join("");
  $("#catChips").onclick = e => { const b = e.target.closest("[data-cat]"); if (!b) return; fCat = b.dataset.cat; $$("#catChips .chip").forEach(x => x.classList.toggle("on", x === b)); render(); };
  $("#tierSeg").onclick = e => { const b = e.target.closest("[data-tier]"); if (!b) return; fTier = b.dataset.tier; $$("#tierSeg button").forEach(x => x.classList.toggle("on", x === b)); render(); };
  $("#q").oninput = e => { fQ = e.target.value.toLowerCase().trim(); render(); };
  function card(t){
    const p = minPkgFor(t);
    return `<article class="card reveal" data-slug="${esc(t.slug)}">
      <div class="shot" data-preview="${esc(t.slug)}">
        <div class="badges"><span class="badge ${esc(t.tier)}">${esc(p.name)}</span>${t.is_new ? '<span class="badge new">Baru</span>' : ""}</div>
        <img src="${esc(B.abs(t.thumbnail || ""))}" alt="Template ${esc(t.name)}" loading="lazy">
        <div class="full" style="background-image:url('${esc(B.abs(t.preview || ""))}')"></div>
        <span class="hint">👆 Klik untuk pratinjau</span>
      </div>
      <div class="info"><span class="cat">${esc(t.category)}</span><h3>${esc(t.name)}</h3><p>${esc(t.description || TEMPLATES.get(t.slug).desc)}</p>
        <div class="price"><b>${rp(t.price)}</b><span>· paket ${esc(p.name)}</span></div>
        <div class="acts"><a class="btn btn-ghost" href="${esc(DEMO(t.slug))}" target="_blank" rel="noopener">👁 Lihat Demo</a>
          <a class="btn btn-red" href="${esc(B.waLink(B.orderText(t, { name: p.name, price: t.price })))}" target="_blank" rel="noopener">Pesan via WA</a></div></div></article>`;
  }
  function render(){
    const list = tpls.filter(t => (fCat === "Semua" || t.category === fCat) && (fTier === "all" || t.tier === fTier) &&
      (!fQ || [t.name, t.category, t.description, P[t.tier]?.name].join(" ").toLowerCase().includes(fQ)));
    $("#grid").innerHTML = list.map(card).join("");
    $("#empty").hidden = list.length > 0;
    observe();
  }
  render();

  // ---------- Paket ----------
  const tplCount = p => tpls.filter(t => (P[t.tier]?.rank || 1) <= p.rank).length;
  $("#plans").innerHTML = pkgs.map(p => `<div class="plan ${p.highlight ? "hot" : ""} reveal">${p.highlight ? '<span class="ribbon">🔥 Paling Laris</span>' : ""}
    <h3>${esc(p.name)}</h3><p class="tag">${esc(p.tagline || "")}</p>
    <div class="amt">${rp(p.price)} <small>/ undangan</small></div>
    <p class="tpls">Bisa pilih ${tplCount(p)} dari ${tpls.length} template</p>
    <ul>${(p.features || []).map(f => `<li>${esc(f)}</li>`).join("")}</ul>
    <a class="btn ${p.highlight ? "btn-red" : "btn-glass"}" href="${esc(B.waLink(B.orderText(null, p)))}" target="_blank" rel="noopener">Pilih ${esc(p.name)}</a></div>`).join("");
  const rows = [["Jumlah template", p => tplCount(p) + " template"], ...tpls.map(t => [`${t.name} <span style="color:#777">· ${esc(t.category)}</span>`, p => (P[t.tier]?.rank || 1) <= p.rank])];
  $("#compare").innerHTML = `<thead><tr><th>Template</th>${pkgs.map(p => `<th>${esc(p.name)}<br><span style="font-weight:500;color:#a2a4ad">${rp(p.price)}</span></th>`).join("")}</tr></thead><tbody>` +
    rows.map(([lbl, fn]) => `<tr><td>${lbl}</td>${pkgs.map(p => { const v = fn(p); return typeof v === "boolean" ? `<td class="${v ? "y" : "n"}">${v ? "✓" : "—"}</td>` : `<td>${v}</td>`; }).join("")}</tr>`).join("") + "</tbody>";

  // ---------- Testimoni (hanya tampil jika diisi di config.js: PLATFORM.brand.testimonials) ----------
  const TS = (PF.brand && PF.brand.testimonials) || [];
  if (TS.length) { $("#testimoni").hidden = false; $("#testi").innerHTML = TS.map(t => `<blockquote class="reveal">“${esc(t.text)}”<cite>— ${esc(t.name)}</cite></blockquote>`).join(""); }

  // ---------- FAQ ----------
  const FAQ = [
    ["Berapa lama undangan bisa jadi?", "Setelah pembayaran, akun dashboard dibuat di hari yang sama. Begitu data kamu isi, undangan langsung bisa dibagikan."],
    ["Apakah saya bisa mengisi dan mengubah data sendiri?", "Bisa. Kamu mendapat dashboard pribadi untuk mengisi mempelai, acara, foto, video, musik, rekening, dan daftar tamu — perubahan langsung tampil."],
    ["Bisa ganti template setelah memesan?", "Bisa, selama template tersebut termasuk dalam paketmu. Template di atas paketmu akan terkunci sampai kamu upgrade paket."],
    ["Bagaimana cara upgrade paket?", "Hubungi admin via WhatsApp, bayar selisih harganya, dan admin akan membuka template tambahan di akunmu."],
    ["Apakah nama tamu bisa ditulis otomatis?", "Ya. Import daftar tamu dari Excel, lalu kirim link personal ke masing-masing tamu lewat WhatsApp dengan satu klik."],
    ["Bagaimana tamu memberi hadiah?", "Melalui fitur Amplop Digital: nomor rekening (tombol salin), QRIS, dan alamat kirim kado."],
    ["Pembayarannya bagaimana?", "Transfer bank / e-wallet. Detail pembayaran dikirim admin via WhatsApp setelah kamu memilih template & paket."]];
  $("#faqList").innerHTML = FAQ.map(([q, a], i) => `<details class="reveal" ${i === 0 ? "open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");

  // ---------- Modal pratinjau ----------
  const modal = $("#modal");
  function openPreview(slug){
    const t = tpls.find(x => x.slug === slug); if (!t) return; const p = minPkgFor(t);
    $("#mFrame").src = DEMO(slug);
    $("#mInfo").innerHTML = `<span class="badge ${esc(t.tier)}">${esc(p.name)}</span><h3>${esc(t.name)}</h3><p>${esc(t.description || "")}</p>
      <div class="price" style="color:#fff"><b>${rp(t.price)}</b></div>
      <a class="btn btn-red" href="${esc(B.waLink(B.orderText(t, { name: p.name, price: t.price })))}" target="_blank" rel="noopener">Pesan via WhatsApp</a>
      <a class="btn btn-glass" href="${esc(DEMO(slug))}" target="_blank" rel="noopener">Buka demo layar penuh ↗</a>`;
    modal.hidden = false; document.body.style.overflow = "hidden";
  }
  function closePreview(){ modal.hidden = true; $("#mFrame").src = "about:blank"; document.body.style.overflow = ""; }
  document.addEventListener("click", e => { const s = e.target.closest("[data-preview]"); if (s) openPreview(s.dataset.preview); });
  $("#mClose").onclick = closePreview; modal.onclick = e => { if (e.target === modal) closePreview(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closePreview(); });
  if (location.hash.startsWith("#lihat-")) openPreview(location.hash.slice(7));

  // ---------- Nav & animasi ----------
  const nav = $("#nav"); const onScroll = () => nav.classList.toggle("solid", scrollY > 30); onScroll(); addEventListener("scroll", onScroll, { passive: true });
  function observe(){
    io = io || new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .08 });
    $$(".reveal:not(.in)").forEach(el => io.observe(el));
  }
  observe(); B.init();
})();
