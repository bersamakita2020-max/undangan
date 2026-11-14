/* Pengaturan platform (aman untuk publik: hanya publishable key, BUKAN service key) */
window.PLATFORM = {
  supabaseUrl: "https://oupzxkqqndkzcduoabba.supabase.co",
  supabaseKey: "sb_publishable_Z59D-HUZC-HaTqjl8e-4sA_AgoeZJJR",
  defaultSlug: "demo",          // undangan yang tampil di halaman utama tanpa ?u=
  bucket: "media",

  /* ===== BRAND AGENSI (satu-satunya tempat logo & kontak diatur) =====
     Ganti logo: cukup taruh file PNG asli di  assets/brand/anara-logo.png
     (dan versi untuk latar gelap di assets/brand/anara-logo-dark.png).
     Jika file PNG belum ada, otomatis memakai SVG di bawah. */
  brand: {
    name: "Anara Studio",
    tagline: "Undangan Digital Kekinian",
    logo: "assets/brand/anara-logo.png",
    logoFallback: "assets/brand/anara-logo.svg",
    logoDark: "assets/brand/anara-logo-dark.png",
    logoDarkFallback: "assets/brand/anara-logo-dark.svg",
    mark: "assets/brand/anara-mark.svg",
    // Nomor WhatsApp pemesanan (format internasional tanpa +). Asli: 0858-2189-7002
    whatsapp: "6285821897002",
    instagram: "",              // contoh: "anarastudio" (opsional)
    // Testimoni ASLI klien (kosong = bagian testimoni disembunyikan di katalog).
    // Contoh: { name: "Dewi & Arif, Pontianak", text: "Undangannya cantik banget..." }
    testimonials: []
  }
};
