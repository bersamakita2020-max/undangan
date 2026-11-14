/* Helper brand: logo dengan fallback PNG -> SVG, link WhatsApp pemesanan */
(function(){
  const B = (window.PLATFORM && PLATFORM.brand) || {};
  const ROOT = /\.github\.io$/.test(location.hostname) ? "/undangan/" : "/";
  const abs = p => /^(https?:|data:|\/)/.test(p) ? p : ROOT + p;
  function logo(img, dark){
    if (!img) return;
    const main = abs(dark ? B.logoDark : B.logo), fb = abs(dark ? B.logoDarkFallback : B.logoFallback);
    img.onerror = () => { img.onerror = null; img.src = fb; };
    img.src = main; img.alt = B.name || "Logo";
  }
  function waLink(text){ return "https://wa.me/" + String(B.whatsapp || "").replace(/\D/g, "") + (text ? "?text=" + encodeURIComponent(text) : ""); }
  const rupiah = n => "Rp" + Number(n || 0).toLocaleString("id-ID");
  function orderText(tpl, pkg){
    return `Halo ${B.name || "Admin"} 👋\nSaya ingin memesan undangan digital.\n\n` +
      (tpl ? `• Template: *${tpl.name}*${tpl.category ? " (" + tpl.category + ")" : ""}\n` : "") +
      (pkg ? `• Paket: *${pkg.name}* – ${rupiah(pkg.price)}\n` : "") +
      `\nNama pasangan: \nTanggal acara: \n\nMohon info selanjutnya ya, terima kasih 🙏`;
  }
  function init(){ document.querySelectorAll("img[data-brand-logo]").forEach(i => logo(i, i.dataset.brandLogo === "dark")); }
  window.BRAND = { ...B, ROOT, abs, logo, waLink, rupiah, orderText, init };
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
