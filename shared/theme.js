/* Tema warna undangan: preset + warna kustom */
(function(){
  const PRESETS = {
    "peach-rose":  { nama:"Peach Rose",   primary:"#E59A92", accent:"#A9C4A5", gold:"#C9A36B" },
    "sage-garden": { nama:"Sage Garden",  primary:"#7FA37A", accent:"#E8B4A0", gold:"#B89B5E" },
    "dusty-blue":  { nama:"Dusty Blue",   primary:"#7C9CC0", accent:"#E7C2B0", gold:"#B9A06A" },
    "lavender":    { nama:"Lavender",     primary:"#A88BC9", accent:"#F0B9C4", gold:"#C2A36B" },
    "gold-cream":  { nama:"Gold Cream",   primary:"#C9A36B", accent:"#9DB59A", gold:"#B8893F" },
    "terracotta":  { nama:"Terracotta",   primary:"#D2785A", accent:"#9CAF88", gold:"#C99A5B" },
    "blush-pink":  { nama:"Blush Pink",   primary:"#EC8FA8", accent:"#9FC7C0", gold:"#CFA66E" },
    "mint-fresh":  { nama:"Mint Fresh",   primary:"#5FB8A3", accent:"#F3B59B", gold:"#C3A060" }
  };
  const hex = h => { h = String(h||"").replace("#",""); if(h.length===3) h=h.split("").map(c=>c+c).join(""); const n=parseInt(h,16); return isNaN(n)?[229,154,146]:[n>>16&255,n>>8&255,n&255]; };
  const toHex = a => "#" + a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0")).join("");
  const mix = (a,b,t) => toHex(hex(a).map((v,i)=>v+(hex(b)[i]-v)*t));
  function resolve(theme){
    theme = theme || {};
    const p = PRESETS[theme.preset] || PRESETS["peach-rose"];
    return { primary: theme.primary || p.primary, accent: theme.accent || p.accent, gold: theme.gold || p.gold };
  }
  function vars(theme){
    const t = resolve(theme);
    return {
      "--rose": t.primary, "--rose-d": mix(t.primary,"#000000",.2),
      "--peach": mix(t.primary,"#ffffff",.86), "--peach2": mix(t.primary,"#ffffff",.66),
      "--sage": t.accent, "--sage-d": mix(t.accent,"#000000",.28), "--sage-l": mix(t.accent,"#ffffff",.8),
      "--gold": t.gold, "--cream": mix(t.primary,"#ffffff",.965), "--ink": mix(t.primary,"#3a2a28",.85)
    };
  }
  function apply(theme, el){
    const v = vars(theme), root = el || document.documentElement;
    Object.entries(v).forEach(([k,val]) => root.style.setProperty(k,val));
    const m = document.querySelector('meta[name="theme-color"]'); if(m) m.content = v["--peach"];
  }
  window.TEMA = { PRESETS, resolve, vars, apply, mix };
})();
