# Platform Undangan Pernikahan Digital 💍

Website undangan statis (GitHub Pages) + database **Supabase** (gratis).
Klien login ke dashboard untuk mengisi data, upload foto/video/musik, memilih tema warna,
mengimpor daftar tamu dari Excel, mengirim undangan via WhatsApp, dan melihat RSVP.

| Halaman | Alamat |
|---|---|
| Undangan (per klien) | `https://undangan.cendekiaportal.site/?u=SLUG&to=Nama+Tamu` atau `/SLUG/?to=Nama+Tamu` |
| Dashboard klien | `https://undangan.cendekiaportal.site/dashboard/` |
| Admin (pemilik) | `https://undangan.cendekiaportal.site/admin/` |
| Katalog template (publik) | `https://undangan.cendekiaportal.site/katalog/` |
| Demo template | `https://undangan.cendekiaportal.site/?demo=noir-gold` (ganti slug template) |
| Template Excel tamu | `https://undangan.cendekiaportal.site/dashboard/template-tamu.xlsx` |

## Alur kerja
1. **Admin** login di `/admin/` → *Buat Akun Klien Baru* (nama, email, slug, password) → kirim info login ke klien.
2. **Klien** login di `/dashboard/` → isi menu Mempelai, Acara, Love Story, Foto/Video/Musik, Amplop, Tema → *Simpan*.
3. Menu **Tamu**: download template Excel → isi nama & nomor WA → upload → klik **Kirim WA** per tamu
   (pesan berisi link pribadi `?to=Nama`). Template pesan bisa diedit.
4. Menu **RSVP & Ucapan**: lihat konfirmasi kehadiran & ucapan, export ke Excel.

## Struktur file
- `index.html`, `app.js`, `style.css` — halaman undangan publik (membaca data dari Supabase berdasarkan slug)
- `404.html` — mengubah link `/slug/` menjadi `/?u=slug`
- `dashboard/` — dashboard klien · `admin/` — halaman admin
- `config.js` — URL Supabase + *publishable key* (aman untuk publik) + slug default
- `shared/default-data.js` — isi contoh untuk undangan baru · `shared/theme.js` — 8 preset tema
- `assets/` — foto/musik contoh

## Keamanan
- Semua tabel memakai Row Level Security: klien hanya bisa mengubah undangan, media, dan tamunya sendiri.
- Tamu (publik) hanya bisa membaca undangan yang aktif dan mengirim RSVP.
- Pendaftaran publik diblokir; akun hanya dibuat admin lewat Edge Function `admin-users`
  (service key hanya ada di server Supabase, tidak di website).

## Batas paket gratis Supabase
- Database 500 MB, Storage 1 GB, upload maks 50 MB per file, bandwidth ±5 GB/bulan.
- Proyek gratis **dijeda otomatis setelah 7 hari tanpa aktivitas** — buka dashboard Supabase untuk mengaktifkan lagi.
- Video panjang sebaiknya lewat YouTube agar hemat storage & bandwidth.

## Kredit contoh
Foto contoh: Unsplash. Musik contoh: "Canon in D Major" — Kevin MacLeod (incompetech.com), CC BY 4.0.

## Katalog, template & paket (Anara Studio)
- **Katalog** `katalog/` — daftar template, filter kategori/harga, pratinjau, tabel paket, FAQ, tombol *Pesan via WhatsApp*.
- **10 template desain**: registri di `shared/templates.js`, gaya di `templates.css` (`body.tpl-<slug>`). Thumbnail di `assets/templates/`.
- **Database**: tabel `packages` (basic/premium/exclusive) & `templates` (harga, tier, aktif, urutan) — dibaca publik, hanya admin yang bisa mengubah.
  Kolom `invitations.template` & `invitations.package`. Trigger `private.guard_invitation` menolak klien memilih template di atas paketnya
  dan mencegah klien mengubah paketnya sendiri.
- **Admin** mengatur paket tiap klien (kolom *Paket*), harga/tier/aktif template, dan isi paket di halaman Admin.
- **Klien** memilih template di dashboard menu *Template* (template di atas paket tampil terkunci 🔒).
- **Logo & WhatsApp**: diatur di satu tempat, `config.js` → `PLATFORM.brand`. Untuk memakai logo asli, taruh file
  `assets/brand/anara-logo.png` (dan `anara-logo-dark.png` untuk latar gelap) — otomatis menggantikan SVG.
- **Testimoni**: isi `PLATFORM.brand.testimonials` di `config.js` dengan testimoni asli agar bagiannya muncul di katalog.
