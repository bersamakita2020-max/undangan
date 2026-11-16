(async function(){
  const PF = window.PLATFORM || {};
  const $ = s => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  // Mode demo katalog: ?demo=<template>  -> data contoh lokal, tanpa database
  const demoTpl = (params.get("demo") || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const isDemo = !!demoTpl && !!window.TEMPLATES && !!TEMPLATES.MAP[demoTpl];
  const slug = (params.get("u") || params.get("undangan") || PF.defaultSlug || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const api = (path, opt = {}) => fetch(PF.supabaseUrl + "/rest/v1/" + path, { ...opt,
    headers: { apikey: PF.supabaseKey, "Content-Type": "application/json", ...(opt.headers || {}) } });
  let inv = null, media = [], online = false;
  if (!isDemo) try {
    const r = await api(`invitations?slug=eq.${encodeURIComponent(slug)}&select=id,slug,data,theme,template`);
    if (r.ok) { online = true; inv = (await r.json())[0] || null; }
    if (inv) { const m = await api(`media?invitation_id=eq.${inv.id}&select=kind,url,title,sort&order=sort.asc,created_at.asc`); media = m.ok ? await m.json() : []; }
  } catch (e) { console.warn("Gagal memuat data undangan", e); }
  if (!inv && online && params.get("u")) {
    $("#loading").innerHTML = '<div class="notfound"><p class="script" style="font-size:2.4rem">Undangan tidak ditemukan</p><p>Periksa kembali link undangan Anda.</p></div>';
    return;
  }
  const BASE = { pria:{}, wanita:{}, ayat:{}, acara:[], loveStory:[], galeri:[], video:[], rekening:[], alamatKado:{} };
  const C = Object.assign({}, BASE, inv ? inv.data : (isDemo && window.TEMPLATES ? TEMPLATES.demoData(window.UNDANGAN_DEFAULT) : window.UNDANGAN_DEFAULT));
  ["pria","wanita","ayat","alamatKado"].forEach(k => C[k] = C[k] || {});
  ["acara","loveStory","galeri","video","rekening"].forEach(k => C[k] = Array.isArray(C[k]) ? C[k] : []);
  if (inv && media.length) {
    const ph = media.filter(m => m.kind === "photo").map(m => m.url);
    const vd = media.filter(m => m.kind !== "photo").map(m => ({ tipe: m.kind === "youtube" ? "youtube" : "mp4", src: m.url, judul: m.title || "" }));
    if (ph.length) C.galeri = ph;
    if (vd.length) C.video = vd;
  }
  // ---------- Template desain ----------
  let tplSlug = isDemo ? demoTpl : (inv && inv.template) || "classic-bloom";
  let tplTheme = isDemo ? null : (inv ? inv.theme : null);
  // Teks yang bisa diedit klien (shared/teks.js). Kosong = baris disembunyikan.
  const renderTeks = () => {
    if (!window.TEKS) return;
    const tx = (window.TEMPLATES ? TEMPLATES.get(tplSlug).text : null) || {};
    document.querySelectorAll("[data-teks]").forEach(el => {
      const f = TEKS.byKey[el.dataset.teks]; if (!f) return;
      let v = TEKS.value(C, f, tx);
      el.textContent = f.key === "ayat.teks" && v.trim() ? `“${v}”` : v; el.hidden = !v.trim();
    });
    const q = document.querySelector(".section.quote"); if (q) q.hidden = !TEKS.value(C, TEKS.byKey["ayat.teks"]).trim();
  };
  const applyTpl = () => { if (window.TEMPLATES) TEMPLATES.apply(tplSlug, { theme: tplTheme }); else if (window.TEMA) TEMA.apply(tplTheme); renderTeks(); };
  applyTpl();
  // Pratinjau dari dashboard (iframe): ganti tema/template tanpa menyimpan
  window.addEventListener("message", e => {
    if (!e.data || e.origin !== location.origin) return;
    if (e.data.type === "tema") { tplTheme = e.data.theme; applyTpl(); }
    if (e.data.type === "teks") { C.teks = e.data.teks || {}; C.ayat = e.data.ayat || {}; C.penutup = e.data.penutup; renderTeks(); }
    if (e.data.type === "template" && window.TEMPLATES && TEMPLATES.MAP[e.data.slug]) { tplSlug = e.data.slug; if (e.data.theme) tplTheme = e.data.theme; applyTpl(); }
  });
  // Label demo + tautan ke katalog
  if ((isDemo || !params.get("u")) && window.top === window.self) {
    const t = window.TEMPLATES ? TEMPLATES.get(tplSlug) : null;
    const pill = document.createElement("a"); pill.className = "demo-pill"; pill.href = "katalog/";
    pill.innerHTML = `<img data-brand-logo alt="">${isDemo && t ? "Demo: " + t.name : "Contoh undangan"} <b>Lihat Katalog →</b>`;
    document.body.appendChild(pill); if (window.BRAND) BRAND.init();
    if (params.get("preview") === "1") pill.remove();
  }
  setTimeout(() => $("#loading").classList.add("hide"), 150);
  const firstAcara = C.acara[0] || {};
  C.tanggalUtama = C.tanggalUtama || firstAcara.mulai || new Date().toISOString();
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  // Tampilkan jam/tanggal sesuai zona acara (ambil dari offset di string tanggal)
  function parts(iso){
    iso = iso || C.tanggalUtama;
    const d = new Date(iso);
    const m = /([+-])(\d\d):(\d\d)$/.exec(iso);
    const off = m ? (m[1]==="-"?-1:1)*(+m[2]*60 + +m[3]) : 420;
    const l = new Date(d.getTime() + off*60000);
    return {hari:HARI[l.getUTCDay()], tgl:l.getUTCDate(), bln:BULAN[l.getUTCMonth()], bnum:l.getUTCMonth()+1, thn:l.getUTCFullYear(),
      jam:String(l.getUTCHours()).padStart(2,"0")+"."+String(l.getUTCMinutes()).padStart(2,"0")};
  }
  const toast = msg => { const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2200); };

  // ---------- Binding teks ----------
  const P = parts(C.tanggalUtama);
  const binds = {
    pasangan: `${C.pria.panggilan} &amp; ${C.wanita.panggilan}`,
    tanggalPendek: `${String(P.tgl).padStart(2,"0")} . ${String(P.bnum).padStart(2,"0")} . ${P.thn}`,
    tanggalPanjang: `${P.hari}, ${P.tgl} ${P.bln} ${P.thn}`,
    hashtag: esc(C.hashtag), ayatTeks: C.ayat.teks ? `“${esc(C.ayat.teks)}”` : "", ayatSumber: esc(C.ayat.sumber),
    penutup: esc(C.penutup), kreditMusik: esc(C.kreditMusik ? "Musik: " + C.kreditMusik : "")
  };
  document.querySelectorAll("[data-bind]").forEach(el => el.innerHTML = binds[el.dataset.bind] ?? "");
  document.title = C.judul || `The Wedding of ${C.pria.panggilan||""} & ${C.wanita.panggilan||""}`;
  const bg = (el, u) => { if (u) $(el).style.backgroundImage = `url("${String(u).replace(/"/g,"%22")}")`; };
  bg("#coverBg", C.fotoCover || C.fotoHero); bg("#heroBg", C.fotoHero || C.fotoCover); bg("#closingBg", C.fotoPenutup || C.fotoHero);

  // ---------- Nama tamu dari URL ?to= ----------
  const tamu = (params.get("to") || params.get("kepada") || "").trim();
  if (tamu) { $("#guestName").textContent = tamu; $("#fNama").value = tamu; }

  // ---------- Mempelai ----------
  function person(p){
    return `${p.foto ? `<div class="photo-frame"><img src="${esc(p.foto)}"` : `<div class="photo-frame" style="display:none"><img`} alt="${esc(p.namaLengkap)}" loading="lazy"></div>
      <h4>${esc(p.panggilan)}</h4><div class="fullname">${esc(p.namaLengkap)}</div>
      <div class="parents">${esc(p.anakKe||"")}<br>${esc(p.ayah||"")}${p.ayah&&p.ibu?" &amp; ":""}${esc(p.ibu||"")}</div>
      ${p.instagram ? `<a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="https://instagram.com/${esc(p.instagram)}">📷 @${esc(p.instagram)}</a>` : ""}`;
  }
  $("#pria").innerHTML = person(C.pria);
  $("#wanita").innerHTML = person(C.wanita);

  // ---------- Countdown ----------
  const target = new Date(C.tanggalUtama).getTime();
  function tick(){
    let diff = Math.max(0, target - Date.now())/1000;
    const v = [Math.floor(diff/86400), Math.floor(diff%86400/3600), Math.floor(diff%3600/60), Math.floor(diff%60)];
    ["d","h","m","s"].forEach((k,i)=> $("#cd-"+k).textContent = v[i]);
  }
  tick(); setInterval(tick, 1000);

  // ---------- Acara ----------
  const gcal = e => {
    const f = s => new Date(s || e.mulai).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
    const q = new URLSearchParams({action:"TEMPLATE", text:`${e.nama} ${C.pria.panggilan} & ${C.wanita.panggilan}`,
      dates:`${f(e.mulai)}/${f(e.selesai)}`, details:`Undangan pernikahan ${C.pria.panggilan} & ${C.wanita.panggilan}\n${location.href.split("?")[0]}`, location:`${e.tempat}, ${e.alamat}`});
    return "https://calendar.google.com/calendar/render?" + q.toString();
  };
  $("#eventList").innerHTML = C.acara.map(e => {
    const a = parts(e.mulai), b = parts(e.selesai);
    return `<div class="card event reveal">
      <h4>${esc(e.nama)}</h4>
      <div class="day">${a.hari}, ${a.tgl} ${a.bln} ${a.thn}</div>
      <div class="time">🕗 ${a.jam} – ${e.selesai ? b.jam : "Selesai"} ${esc(e.zona||"")}</div>
      <div class="place">📍 ${esc(e.tempat)}</div>
      <div class="addr">${esc(e.alamat)}</div>
      <div class="actions">
        <a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${esc(e.maps)}">🧭 Petunjuk Arah</a>
        <a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="${gcal(e)}">📅 Simpan ke Kalender</a>
      </div></div>`;
  }).join("");
  if (C.petaQuery) $("#mapFrame").src = "https://maps.google.com/maps?q=" + encodeURIComponent(C.petaQuery) + "&z=15&output=embed";
  else $(".map-wrap").remove();
  if (!C.acara.length) $("#acara").remove();

  // ---------- Love story ----------
  $("#timeline").innerHTML = (C.loveStory||[]).map(s => `<div class="tl-item reveal"><div class="card">
    ${s.foto ? `<img src="${esc(s.foto)}" alt="" loading="lazy">` : ""}
    <span class="tl-year">${esc(s.tahun)}</span><h5>${esc(s.judul)}</h5><p>${esc(s.teks)}</p></div></div>`).join("");
  if(!(C.loveStory||[]).length) $("#story").remove();

  // ---------- Galeri + lightbox ----------
  const G = C.galeri || [];
  $("#gallery").innerHTML = G.map((src,i)=>`<a href="${esc(src)}" data-i="${i}" class="reveal"><img src="${esc(src)}" alt="Foto ${i+1}" loading="lazy"></a>`).join("");
  let cur = 0;
  const lb = $("#lightbox"), show = i => { cur=(i+G.length)%G.length; $("#lbImg").src=G[cur]; $("#lbCount").textContent=`${cur+1} / ${G.length}`; lb.classList.add("show"); };
  $("#gallery").addEventListener("click", e => { const a=e.target.closest("a"); if(!a) return; e.preventDefault(); show(+a.dataset.i); });
  $("#lbClose").onclick = () => lb.classList.remove("show");
  $("#lbPrev").onclick = e => { e.stopPropagation(); show(cur-1); };
  $("#lbNext").onclick = e => { e.stopPropagation(); show(cur+1); };
  lb.addEventListener("click", e => { if(e.target===lb) lb.classList.remove("show"); });
  document.addEventListener("keydown", e => { if(!lb.classList.contains("show")) return;
    if(e.key==="Escape") lb.classList.remove("show"); if(e.key==="ArrowLeft") show(cur-1); if(e.key==="ArrowRight") show(cur+1); });
  let sx=0; lb.addEventListener("touchstart",e=>sx=e.touches[0].clientX,{passive:true});
  lb.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>50) show(cur+(dx<0?1:-1));});

  // ---------- Video ----------
  const ytId = s => { const m = String(s).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : String(s); };
  C.video.forEach(v => { if (v.tipe === "youtube") v.src = ytId(v.src); });
  if (!G.length) $("#gallery").remove();
  if (!G.length && !C.video.length) $("#galeri").remove();
  $("#videos").innerHTML = (C.video||[]).map(v => v.tipe==="youtube"
    ? `<div class="video-card reveal"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.src)}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" title="${esc(v.judul)}"></iframe>${v.judul?`<p>🎬 ${esc(v.judul)}</p>`:""}</div>`
    : `<div class="video-card reveal"><video controls playsinline preload="none" poster="${esc(v.poster||"")}" src="${esc(v.src)}"></video>${v.judul?`<p>🎬 ${esc(v.judul)}</p>`:""}</div>`).join("");
  // pause musik saat video diputar
  document.querySelectorAll("#videos video").forEach(v => { v.addEventListener("play", ()=>{ if(!bgm.paused){ bgm.pause(); bgm._byVideo=true; setMusic(); } });
    v.addEventListener("pause", ()=>{ if(bgm._byVideo){ bgm._byVideo=false; bgm.play().catch(()=>{}); setMusic(); } }); });

  // ---------- Amplop digital ----------
  $("#bankList").innerHTML = (C.rekening||[]).map(r => `<div class="bank-card reveal">
      <div><div class="bname">${esc(r.bank)}</div><div class="chip"></div></div>
      <div><div class="num">${esc(r.nomor)}</div><div class="holder">a.n. ${esc(r.atasNama)}</div></div>
      <button class="btn btn-sm copy" data-copy="${esc(String(r.nomor).replace(/\s/g,""))}">📋 Salin</button></div>`).join("");
  if (C.qris) $("#qrisImg").src = C.qris; else document.querySelector('[data-tab="qr"]').remove();
  if (!C.rekening.length) { document.querySelector('[data-tab="tf"]').remove(); $("#tab-tf").remove(); }
  const k = C.alamatKado;
  if (k && k.alamat) {
    const full = `${k.penerima}\n${k.alamat}\n${k.hp||""}`;
    $("#kadoBox").innerHTML = `<div style="font-size:2rem">🎁</div><b>${esc(k.penerima)}</b><p class="small" style="margin:.4rem 0">${esc(k.alamat)}</p><p class="small">📞 ${esc(k.hp||"")}</p><br><button class="btn btn-outline btn-sm" data-copy="${esc(full)}">📋 Salin Alamat</button>`;
  } else document.querySelector('[data-tab="kado"]').remove();
  { const t = document.querySelector(".gift-tabs .tab");
    if (!t) $("#hadiah").remove();
    else if (!document.querySelector(".tab.active")) { t.classList.add("active"); $("#tab-" + t.dataset.tab).classList.add("active"); } }
  async function copyText(t){
    try { await navigator.clipboard.writeText(t); }
    catch { const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    toast("✓ Berhasil disalin");
  }
  document.addEventListener("click", e => { const b=e.target.closest("[data-copy]"); if(b) copyText(b.dataset.copy); });
  document.querySelectorAll(".tab").forEach(t => t.onclick = () => {
    document.querySelectorAll(".tab,.tab-panel").forEach(x=>x.classList.remove("active"));
    t.classList.add("active"); $("#tab-"+t.dataset.tab).classList.add("active");
  });

  // ---------- RSVP & Ucapan (tersimpan di Supabase) ----------
  const LS = "undangan_ucapan_" + slug;
  const local = () => { try { return JSON.parse(localStorage.getItem(LS)) || []; } catch { return []; } };
  let list = [];
  function render(){
    const L = list.slice().sort((a,b)=>new Date(b.waktu)-new Date(a.waktu));
    const cnt = h => L.filter(x=>x.hadir===h).length;
    $("#stats").innerHTML = `<span>💬 ${L.length} Ucapan</span><span>✅ ${cnt("Hadir")} Hadir</span><span>❌ ${cnt("Tidak Hadir")} Tidak</span><span>🤔 ${cnt("Masih Ragu")} Ragu</span>`;
    $("#wishes").innerHTML = L.length ? L.map(w => {
      const cls = w.hadir==="Hadir"?"":w.hadir==="Tidak Hadir"?"no":"maybe";
      const t = w.waktu ? new Date(w.waktu).toLocaleString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "";
      return `<div class="wish"><div class="avatar">${esc(((w.nama||"?").trim()[0]||"?").toUpperCase())}</div><div>
        <b>${esc(w.nama)}</b><span class="badge ${cls}">${esc(w.hadir)}</span><p>${esc(w.ucapan)}</p><time>${esc(t)}</time></div></div>`;
    }).join("") : `<p class="sub">Jadilah yang pertama mengirim ucapan 💐</p>`;
  }
  async function loadWishes(){
    if (!inv) { list = local(); return render(); }
    try {
      const r = await api(`rsvps?invitation_id=eq.${inv.id}&select=nama,hadir,jumlah,ucapan,created_at&order=created_at.desc&limit=1000`);
      if (r.ok) list = (await r.json()).map(x => ({ ...x, waktu: x.created_at }));
    } catch (e) { console.warn(e); }
    render();
  }
  $("#rsvpForm").addEventListener("submit", async e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    const item = { nama: fd.nama.trim().slice(0,80), hadir: fd.hadir, jumlah: parseInt(fd.jumlah)||1, ucapan: fd.ucapan.trim().slice(0,600) };
    if(!item.nama || !item.ucapan || !item.hadir) return;
    const btn = e.target.querySelector("button"); btn.disabled = true; btn.textContent = "Mengirim…";
    let ok = true;
    if (inv) {
      try { const r = await api("rsvps", { method:"POST", headers:{ Prefer:"return=minimal" }, body: JSON.stringify({ ...item, invitation_id: inv.id }) }); ok = r.ok; }
      catch { ok = false; }
    } else { const l = local(); l.push({ ...item, waktu: new Date().toISOString() }); localStorage.setItem(LS, JSON.stringify(l)); }
    btn.disabled = false; btn.textContent = "Kirim Ucapan 💌";
    if (!ok) { $("#formMsg").textContent = "Maaf, gagal mengirim. Coba lagi ya."; return; }
    list.unshift({ ...item, waktu: new Date().toISOString() }); render();
    e.target.ucapan.value = "";
    $("#formMsg").textContent = "Terima kasih, ucapan & konfirmasi Anda sudah terkirim 💐";
    toast("💌 Ucapan terkirim");
    if (C.nomorWhatsApp) {
      const txt = `Halo, saya ${item.nama} konfirmasi: ${item.hadir} (${item.jumlah} orang).\nUcapan: ${item.ucapan}`;
      window.open(`https://wa.me/${String(C.nomorWhatsApp).replace(/\D/g,"")}?text=${encodeURIComponent(txt)}`, "_blank");
    }
  });
  loadWishes();

  // ---------- Musik ----------
  const bgm = $("#bgm"); if (C.musik) bgm.src = C.musik; else $("#musicBtn").style.display = "none"; bgm.volume = 0.7;
  const mb = $("#musicBtn");
  function setMusic(){ mb.classList.toggle("playing", !bgm.paused); mb.classList.toggle("paused", bgm.paused); }
  mb.onclick = () => { bgm._byVideo=false; bgm.paused ? bgm.play().catch(()=>{}) : bgm.pause(); setTimeout(setMusic,50); };
  bgm.addEventListener("play", setMusic); bgm.addEventListener("pause", setMusic);
  document.addEventListener("visibilitychange", () => { if(document.hidden && !bgm.paused){ bgm.pause(); bgm._bg=true; } else if(!document.hidden && bgm._bg){ bgm._bg=false; bgm.play().catch(()=>{}); } });

  // ---------- Buka undangan ----------
  $("#openBtn").onclick = () => {
    $("#cover").classList.add("opened");
    document.body.classList.remove("locked"); document.body.classList.add("opened");
    window.scrollTo(0,0);
    bgm.play().catch(()=>{}); setMusic();
    if (window.TEMPLATES) TEMPLATES.fx(tplSlug); else petals();
  };

  if (params.get("preview") === "1") { $("#cover").classList.add("opened"); document.body.classList.remove("locked"); document.body.classList.add("opened"); }

  // ---------- Animasi scroll ----------
  const io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }), {threshold:.12});
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  const navLinks = [...document.querySelectorAll(".bottom-nav a")];
  const secIO = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ navLinks.forEach(a=>a.classList.toggle("active", a.getAttribute("href")==="#"+en.target.id)); } }), {threshold:.4});
  navLinks.forEach(a => { const s=document.querySelector(a.getAttribute("href")); if(s) secIO.observe(s); });

  // ---------- Kelopak bunga ----------
  function petals(){
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cs = getComputedStyle(document.documentElement), cv = k => cs.getPropertyValue(k).trim();
    const box = $("#petals"), colors = [cv("--peach2")||"#F9D6C5", cv("--rose")||"#F4B9B2", cv("--sage-l")||"#E3EFE0", cv("--peach")||"#FCE7D6"];
    let n = 0; const iv = setInterval(() => {
      const p = document.createElement("div"); p.className = "petal";
      p.style.left = Math.random()*100 + "vw"; p.style.background = colors[n%4];
      const s = 8 + Math.random()*10; p.style.width = p.style.height = s + "px";
      p.style.animationDuration = 6 + Math.random()*6 + "s";
      box.appendChild(p); setTimeout(()=>p.remove(), 13000);
      if(++n > 40) clearInterval(iv);
    }, 350);
  }
})();
