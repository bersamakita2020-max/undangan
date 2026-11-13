# Platform Undangan Pernikahan Digital 💍

Website undangan statis (GitHub Pages) + database **Supabase** (gratis).
Klien login ke dashboard untuk mengisi data, upload foto/video/musik, memilih tema warna,
mengimpor daftar tamu dari Excel, mengirim undangan via WhatsApp, dan melihat RSVP.

| Halaman | Alamat |
|---|---|
| Undangan (per klien) | `https://undangan.cendekiaportal.site/?u=SLUG&to=Nama+Tamu` atau `/SLUG/?to=Nama+Tamu` |
| Dashboard klien | `https://undangan.cendekiaportal.site/dashboard/` |
| Admin (pemilik) | `https://undangan.cendekiaportal.site/admin/` |
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
