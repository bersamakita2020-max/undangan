# Undangan Pernikahan Digital 💍

Website undangan pernikahan statis (HTML/CSS/JS) — tanpa build, tinggal edit & upload.
**Semua data saat ini masih CONTOH** (nama, tanggal, lokasi, rekening, foto).

## Fitur
- Cover dengan nama tamu otomatis dari link (`?to=Nama+Tamu`) + tombol **Buka Undangan** (musik mulai berputar)
- Ayat / quote, profil mempelai & orang tua, hitung mundur
- Akad & resepsi: tombol **Petunjuk Arah** (Google Maps), **Simpan ke Kalender** (Google Calendar), peta tertanam
- Love story (timeline), galeri foto (grid + lightbox, bisa geser), video (MP4 atau YouTube)
- Amplop digital: kartu rekening/e-wallet + tombol **Salin**, QRIS, alamat kirim kado
- RSVP + ucapan & doa, statistik kehadiran
- Tombol musik melayang, navigasi bawah, animasi scroll & kelopak bunga

## Cara mengganti isi
Semua teks ada di **`config.js`** — buka, ganti tulisan di antara tanda kutip, simpan.

| Yang diganti | Di mana |
|---|---|
| Nama mempelai, gelar, orang tua, Instagram | `config.js` → `pria`, `wanita` |
| Tanggal & jam (hitung mundur) | `tanggalUtama` (format `2027-02-20T08:00:00+07:00`; WIB `+07:00`, WITA `+08:00`, WIT `+09:00`) |
| Akad/resepsi, tempat, alamat, link Maps | `acara` |
| Peta tertanam | `petaQuery` (nama tempat atau koordinat) |
| Rekening / e-wallet | `rekening` |
| QRIS | ganti file `assets/img/qris.png` (atau `qris: ""` untuk menyembunyikan) |
| Alamat kirim kado | `alamatKado` |
| Musik | ganti file `assets/music/lagu.mp3` (nama file sama) |
| Konfirmasi via WhatsApp (opsional) | `nomorWhatsApp: "6281xxxxxxx"` |

## Upload foto & video
1. Simpan foto ke folder `assets/img/` (JPG, sebaiknya lebar ±1000–1200 px agar ringan).
2. Cara paling mudah: **timpa file dengan nama yang sama** (`cover.jpg`, `hero.jpg`, `penutup.jpg`,
   `mempelai-pria.jpg`, `mempelai-wanita.jpg`, `galeri-01.jpg` … `galeri-12.jpg`, `story-1.jpg` …).
3. Mau menambah foto galeri? Tambahkan baris di `galeri` pada `config.js`, mis. `"assets/img/galeri-13.jpg"`.
4. Video: taruh MP4 (disarankan < 25 MB) di `assets/video/` lalu tulis di `video`,
   atau pakai YouTube: `{ tipe: "youtube", src: "ID_VIDEO", judul: "..." }` (ID = kode setelah `v=`).

Di GitHub: buka repo → **Add file → Upload files** → seret file ke folder yang sesuai → **Commit**.
Situs ter-update otomatis ±1 menit.

## Link untuk tamu
`https://USERNAME.github.io/undangan/?to=Bapak+Ahmad+%26+Keluarga`
(spasi = `+`, tanda `&` = `%26`)

## RSVP & ucapan (penting)
Website statis tidak bisa menyimpan data sendiri.
- **Mode sekarang (demo):** ucapan hanya tersimpan di HP/browser tamu yang mengirim.
- **Agar ucapan tersimpan & tampil untuk semua tamu:** pakai Google Sheets gratis —
  ikuti langkah di `google-apps-script/Code.gs`, lalu isi `rsvpEndpoint` di `config.js` dengan URL Web App.
  Semua RSVP akan masuk ke tab "Ucapan" di Google Sheets Anda.

## Kredit
Foto contoh: Unsplash (lisensi Unsplash). Musik contoh: "Canon in D Major" — Kevin MacLeod (incompetech.com),
CC BY 4.0. Ganti dengan foto & lagu milik sendiri sebelum dibagikan.
