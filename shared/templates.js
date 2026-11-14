/* =========================================================
   REGISTRI DESAIN TEMPLATE UNDANGAN
   - Data katalog (harga, paket, aktif, urutan) ada di tabel Supabase `templates`
     dan bisa diubah admin. File ini menyimpan DESAIN tiap template (font, palet,
     ornamen, efek). Gaya visual lengkap ada di /templates.css (body.tpl-<slug>).
   ========================================================= */
(function(){
  const G = "https://fonts.googleapis.com/css2?display=swap&family=";
  const SVG = {
    leaf: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="2"><path d="M10 110 C 60 80, 120 60, 190 10"/></g><g fill="currentColor" opacity=".9"><path d="M40 92c-6-18 4-32 20-36-2 18-8 30-20 36z"/><path d="M42 94c18 4 32-4 38-18-18-2-30 4-38 18z"/><path d="M80 70c-6-18 4-32 20-36-2 18-8 30-20 36z"/><path d="M82 72c18 4 32-4 38-18-18-2-30 4-38 18z"/><path d="M122 46c-6-16 4-28 18-32-2 16-7 26-18 32z"/><path d="M124 48c16 3 28-4 34-16-16-2-27 4-34 16z"/><path d="M162 24c-4-12 3-20 13-22-1 11-5 18-13 22z"/></g></svg>`,
    gunungan: `<svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d98b"/><stop offset="1" stop-color="#b8862e"/></linearGradient></defs><path d="M60 4 C 92 40, 116 86, 112 130 C 110 150, 92 162, 60 166 C 28 162, 10 150, 8 130 C 4 86, 28 40, 60 4 Z" fill="url(#gg)" stroke="#7a5418" stroke-width="2"/><path d="M60 22 C 84 52, 100 88, 96 122 C 94 138, 80 148, 60 150 C 40 148, 26 138, 24 122 C 20 88, 36 52, 60 22 Z" fill="none" stroke="#7a5418" stroke-width="1.5"/><path d="M60 40 V150 M60 70 l-18 -14 M60 70 l18 -14 M60 92 l-24 -16 M60 92 l24 -16 M60 114 l-28 -16 M60 114 l28 -16" stroke="#7a5418" stroke-width="1.6" fill="none"/><rect x="42" y="128" width="36" height="22" fill="#7a5418" opacity=".85"/><path d="M48 150v-14h24v14" fill="none" stroke="#f3d98b" stroke-width="1.5"/><circle cx="60" cy="56" r="5" fill="#7a5418"/></svg>`,
    star8: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="3"><rect x="22" y="22" width="56" height="56"/><rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="12"/></g></svg>`,
    rainbow: `<svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-width="12"><path d="M20 105a80 80 0 0 1 160 0" stroke="#C9714F"/><path d="M38 105a62 62 0 0 1 124 0" stroke="#E2A27A"/><path d="M56 105a44 44 0 0 1 88 0" stroke="#E9C9A3"/><path d="M74 105a26 26 0 0 1 52 0" stroke="#9A6B52"/></svg>`,
    deco: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M0 30h70M130 30h70"/><path d="M100 6 L124 30 L100 54 L76 30 Z"/><path d="M100 16 L114 30 L100 44 L86 30 Z" fill="currentColor"/><path d="M70 22v16M130 22v16M60 26v8M140 26v8"/></svg>`,
    sprocket: ``,
    melati: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><g fill="#fffdf6" stroke="#e8dcc0" stroke-width=".8"><ellipse cx="20" cy="10" rx="5" ry="9"/><ellipse cx="20" cy="10" rx="5" ry="9" transform="rotate(72 20 20)"/><ellipse cx="20" cy="10" rx="5" ry="9" transform="rotate(144 20 20)"/><ellipse cx="20" cy="10" rx="5" ry="9" transform="rotate(216 20 20)"/><ellipse cx="20" cy="10" rx="5" ry="9" transform="rotate(288 20 20)"/></g><circle cx="20" cy="20" r="3.5" fill="#f2d27a"/></svg>`
  };
  const LIST = [
    { slug:"classic-bloom", name:"Classic Bloom", category:"Floral", tier:"basic", price:250000,
      desc:"Bunga pastel lembut, kelopak berjatuhan, nuansa cerah & romantis.",
      fonts:"Great+Vibes&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Poppins:wght@300;400;500;600",
      palette:{ primary:"#E59A92", accent:"#A9C4A5", gold:"#C9A36B" }, fx:"petals" },
    { slug:"mono-minimal", name:"Mono Minimal", category:"Minimalis", tier:"basic", price:250000,
      desc:"Editorial hitam-putih ala majalah, bersih dan modern.",
      fonts:"Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600",
      palette:{ primary:"#1A1A1A", accent:"#8A8A8A", gold:"#B5A27A" }, fx:"none",
      text:{ coverEyebrow:"Save the Date", heroEyebrow:"Two become one" } },
    { slug:"pastel-pop", frame:true, name:"Pastel Pop", category:"Playful", tier:"basic", price:250000,
      desc:"Ceria, warna permen, bentuk bubble & confetti.",
      fonts:"Fredoka:wght@400;500;600;700&family=Pacifico",
      palette:{ primary:"#FF8FB1", accent:"#7FD6C2", gold:"#FFC857" }, fx:"confetti",
      text:{ coverEyebrow:"Yay! We're getting married", heroEyebrow:"It's official!" } },
    { slug:"rustic-kraft", frame:true, name:"Rustic Kraft", category:"Rustic", tier:"premium", price:350000,
      desc:"Kertas kraft, foto polaroid & selotip, hangat dan personal.",
      fonts:"Amatic+SC:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Caveat:wght@500;700",
      palette:{ primary:"#9C6B43", accent:"#7D8B5E", gold:"#C49A5A" }, fx:"leaves", leafColors:["#A8763E","#7D8B5E","#C49A5A","#8C5A3C"],
      text:{ coverEyebrow:"Together with their families", heroEyebrow:"Just married soon" } },
    { slug:"botanical-leaf", frame:true, name:"Botanical Leaf", category:"Botanical", tier:"premium", price:350000,
      desc:"Hijau daun tropis, bingkai lengkung, daun berguguran.",
      fonts:"Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Montserrat:wght@300;400;500;600",
      palette:{ primary:"#2F5D46", accent:"#C9A27E", gold:"#B9975B" }, fx:"leaves", leafColors:["#3E7A5A","#6E9E6B","#2F5D46","#A9C49A"],
      decor:{ cover:"leaf", divider:"leaf" } },
    { slug:"boho-sunset", frame:true, name:"Boho Sunset", category:"Boho", tier:"premium", price:350000,
      desc:"Terakota & pasir, motif pelangi boho dan jendela lengkung.",
      fonts:"Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;700&family=Mrs+Saint+Delafield",
      palette:{ primary:"#C9714F", accent:"#9A6B52", gold:"#D9A86C" }, fx:"none",
      decor:{ cover:"rainbow", divider:"rainbow" } },
    { slug:"islamic-arabesque", frame:true, name:"Arabesque Islami", category:"Islami", tier:"premium", price:350000,
      desc:"Hijau zamrud & emas, pola geometri islami dan kaligrafi.",
      fonts:"Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:wght@500;600;700&family=Lato:wght@300;400;700",
      palette:{ primary:"#0F5B46", accent:"#C8A24A", gold:"#D4AF37" }, fx:"stars",
      text:{ coverEyebrow:"Walimatul 'Urs", heroEyebrow:"بَارَكَ اللهُ لَكُمَا" },
      decor:{ cover:"star8", divider:"star8", bismillah:true } },
    { slug:"jawa-keraton", name:"Jawa Keraton", category:"Adat", tier:"exclusive", price:500000,
      desc:"Adat Jawa klasik: batik kawung, gunungan wayang, melati.",
      fonts:"Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500",
      palette:{ primary:"#8A5A2B", accent:"#5C3A1E", gold:"#C9A04A" }, fx:"melati",
      text:{ coverEyebrow:"Sugeng Rawuh · Pawiwahan", heroEyebrow:"Pawiwahan Ageng" },
      decor:{ cover:"gunungan", divider:"gunungan" } },
    { slug:"noir-gold", name:"Noir Gold Luxury", category:"Luxury", tier:"exclusive", price:500000,
      desc:"Hitam pekat & emas art-deco, glamor dan elegan.",
      fonts:"Cinzel:wght@400;600;700&family=Italiana&family=Montserrat:wght@300;400;500",
      palette:{ primary:"#C9A45C", accent:"#8C7A55", gold:"#E5C97B" }, fx:"sparkle",
      text:{ coverEyebrow:"The Wedding Celebration of", heroEyebrow:"An evening of love" },
      decor:{ cover:"deco", divider:"deco" } },
    { slug:"cinematic-film", name:"Cinematic Story", category:"Modern", tier:"exclusive", price:500000,
      desc:"Gaya film bioskop: letterbox, film-strip, kredit penutup.",
      fonts:"Bebas+Neue&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600",
      palette:{ primary:"#E8B04B", accent:"#6B7A8F", gold:"#E8B04B" }, fx:"grain",
      text:{ coverEyebrow:"A Love Story · Now Showing", heroEyebrow:"Coming soon to your heart" } }
  ];
  const MAP = Object.fromEntries(LIST.map(t => [t.slug, t]));
  const DEFAULT = "classic-bloom";
  const get = slug => MAP[slug] || MAP[DEFAULT];

  /* Tema warna efektif: preset "template" (atau kosong) = palet bawaan template (+ warna kustom jika ada) */
  function themeFor(slug, theme){
    const t = get(slug), th = theme || {};
    if (th.preset && th.preset !== "template") return th;
    const o = Object.assign({}, t.palette); ["primary","accent","gold"].forEach(k => { if (th[k]) o[k] = th[k]; }); return o;
  }
  function apply(slug, opts = {}){
    const t = get(slug), body = document.body;
    [...body.classList].filter(c => c.startsWith("tpl-")).forEach(c => body.classList.remove(c));
    body.classList.add("tpl-" + t.slug); if (t.frame) body.classList.add("tpl-frame"); body.dataset.template = t.slug;
    let l = document.getElementById("tplFonts");
    if (!l) { l = document.createElement("link"); l.id = "tplFonts"; l.rel = "stylesheet"; document.head.appendChild(l); }
    l.href = G + t.fonts;
    // teks khusus template
    const tx = t.text || {};
    const setTx = (id, v, dflt) => { const el = document.getElementById(id); if (el) el.textContent = v || dflt; };
    setTx("coverEyebrow", tx.coverEyebrow, "The Wedding of");
    setTx("heroEyebrow", tx.heroEyebrow, "We Are Getting Married");
    // ornamen
    document.querySelectorAll(".tpl-orn").forEach(e => e.remove());
    const d = t.decor || {};
    const orn = (key, cls) => { const s = document.createElement("div"); s.className = "tpl-orn " + cls; s.setAttribute("aria-hidden", "true"); s.innerHTML = SVG[key] || ""; return s; };
    if (d.bismillah) { const b = document.createElement("div"); b.className = "tpl-orn bismillah"; b.textContent = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ"; document.querySelector(".cover-content")?.prepend(b); }
    if (d.cover) { document.querySelector(".cover-content")?.prepend(orn(d.cover, "orn-cover orn-" + d.cover)); document.querySelector(".hero-content")?.prepend(orn(d.cover, "orn-hero orn-" + d.cover)); }
    if (d.divider) document.querySelectorAll("#main .title").forEach(h => h.after(orn(d.divider, "orn-div orn-" + d.divider)));
    if (t.slug === "cinematic-film") {
      const bars = document.createElement("div"); bars.className = "tpl-orn letterbox"; document.getElementById("cover")?.appendChild(bars);
      const rec = document.createElement("div"); rec.className = "tpl-orn rec"; rec.innerHTML = "<span></span>REC · 4K"; document.querySelector(".cover-content")?.prepend(rec);
    }
    if (t.slug === "rustic-kraft") { const tp = document.createElement("div"); tp.className = "tpl-orn tape"; document.getElementById("cover")?.appendChild(tp); }
    if (t.slug === "jawa-keraton") {
      const corner = SVG.melati; ["tl","tr","bl","br"].forEach(p => { const c = document.createElement("div"); c.className = "tpl-orn melati-corner " + p; c.innerHTML = corner + corner + corner; document.getElementById("cover")?.appendChild(c); });
    }
    if (opts.palette !== false && window.TEMA) TEMA.apply(themeFor(t.slug, opts.theme));
    return t;
  }

  /* Efek partikel (dipanggil setelah undangan dibuka) */
  function fx(slug){
    const t = get(slug); if (matchMedia("(prefers-reduced-motion: reduce)").matches || t.fx === "none" || t.fx === "grain") return;
    const box = document.getElementById("petals"); if (!box) return;
    const cs = getComputedStyle(document.documentElement), cv = k => cs.getPropertyValue(k).trim();
    let colors = [cv("--peach2"), cv("--rose"), cv("--sage-l"), cv("--peach")];
    if (t.fx === "confetti") colors = ["#FF8FB1","#7FD6C2","#FFC857","#9B8CFF","#6EC3FF"];
    if (t.fx === "leaves") colors = t.leafColors || colors;
    if (t.fx === "sparkle" || t.fx === "stars") colors = ["#E5C97B","#F7E7B0","#D4AF37","#fff6d5"];
    let n = 0; const iv = setInterval(() => {
      const p = document.createElement("div"); p.className = "petal fx-" + t.fx;
      p.style.left = Math.random() * 100 + "vw"; p.style.background = colors[n % colors.length];
      const s = (t.fx === "sparkle" || t.fx === "stars" ? 3 : t.fx === "confetti" ? 7 : 8) + Math.random() * (t.fx === "sparkle" || t.fx === "stars" ? 4 : 10);
      p.style.width = p.style.height = s + "px";
      if (t.fx === "melati") { p.style.background = "none"; p.innerHTML = SVG.melati; p.style.width = p.style.height = 14 + Math.random() * 10 + "px"; }
      p.style.animationDuration = 6 + Math.random() * 6 + "s";
      box.appendChild(p); setTimeout(() => p.remove(), 13000);
      if (++n > 40) clearInterval(iv);
    }, 350);
  }

  /* Data contoh khusus demo katalog */
  const DEMO_NAMES = { pria: { panggilan: "Raka", namaLengkap: "Raka Aditya Pratama, S.T." }, wanita: { panggilan: "Nadia", namaLengkap: "Nadia Putri Maharani, S.Ked." } };
  function demoData(base){
    const d = JSON.parse(JSON.stringify(base || {}));
    d.pria = Object.assign({}, d.pria, DEMO_NAMES.pria); d.wanita = Object.assign({}, d.wanita, DEMO_NAMES.wanita);
    d.judul = "The Wedding of Raka & Nadia"; d.hashtag = "#RakaNadiaForever";
    return d;
  }
  window.TEMPLATES = { LIST, MAP, DEFAULT, get, apply, fx, demoData, themeFor, SVG };
})();
