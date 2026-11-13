/* =========================================================
   CONFIG UNDANGAN — CUKUP EDIT FILE INI SAJA
   Semua teks, tanggal, lokasi, rekening, foto, video & musik
   diatur dari sini. (Data di bawah masih CONTOH.)
   ========================================================= */
window.UNDANGAN = {
  judul: "The Wedding of Nama Pria & Nama Wanita",

  // ---------- MEMPELAI ----------
  pria: {
    panggilan: "Pria",
    namaLengkap: "Nama Pria Lengkap, S.Kom",
    anakKe: "Putra pertama dari",
    ayah: "Bapak Nama Ayah Pria",
    ibu: "Ibu Nama Ibu Pria",
    foto: "assets/img/mempelai-pria.jpg",
    instagram: "namapria" // tanpa @, kosongkan "" jika tidak ada
  },
  wanita: {
    panggilan: "Wanita",
    namaLengkap: "Nama Wanita Lengkap, S.Kep",
    anakKe: "Putri kedua dari",
    ayah: "Bapak Nama Ayah Wanita",
    ibu: "Ibu Nama Ibu Wanita",
    foto: "assets/img/mempelai-wanita.jpg",
    instagram: "namawanita"
  },

  // ---------- FOTO SAMPUL ----------
  fotoCover: "assets/img/cover.jpg",
  fotoHero: "assets/img/hero.jpg",
  fotoPenutup: "assets/img/penutup.jpg",

  // ---------- AYAT / QUOTE ----------
  ayat: {
    teks: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.",
    sumber: "QS. Ar-Rum : 21"
  },

  // ---------- ACARA ----------
  // Format tanggal: "YYYY-MM-DDTHH:MM:SS+07:00" (+07:00 = WIB, +08:00 = WITA, +09:00 = WIT)
  tanggalUtama: "2027-02-20T08:00:00+07:00", // dipakai untuk hitung mundur
  acara: [
    {
      nama: "Akad Nikah",
      mulai: "2027-02-20T08:00:00+07:00",
      selesai: "2027-02-20T10:00:00+07:00",
      zona: "WIB",
      tempat: "Masjid Contoh Al-Ikhlas",
      alamat: "Jl. Contoh No. 1, Kel. Contoh, Kab. Sintang, Kalimantan Barat",
      maps: "https://maps.google.com/?q=Sintang+Kalimantan+Barat"
    },
    {
      nama: "Resepsi",
      mulai: "2027-02-20T11:00:00+07:00",
      selesai: "2027-02-20T15:00:00+07:00",
      zona: "WIB",
      tempat: "Gedung Contoh Serbaguna",
      alamat: "Jl. Contoh No. 2, Kel. Contoh, Kab. Sintang, Kalimantan Barat",
      maps: "https://maps.google.com/?q=Sintang+Kalimantan+Barat"
    }
  ],
  // Peta yang ditampilkan (cukup tulis nama tempat / alamat / koordinat "-0.0738,111.4950")
  petaQuery: "Sintang, Kalimantan Barat",

  // ---------- LOVE STORY ----------
  loveStory: [
    { tahun: "2019", judul: "Pertama Bertemu", teks: "Kami pertama kali bertemu di sebuah acara kampus. (Cerita contoh — ganti dengan kisah kalian.)", foto: "assets/img/story-1.jpg" },
    { tahun: "2022", judul: "Menjalin Hubungan", teks: "Dari teman diskusi menjadi teman berbagi cerita setiap hari.", foto: "assets/img/story-2.jpg" },
    { tahun: "2026", judul: "Lamaran", teks: "Dengan restu kedua keluarga, kami resmi bertunangan.", foto: "assets/img/story-3.jpg" },
    { tahun: "2027", judul: "Hari Bahagia", teks: "Insya Allah kami melangkah ke jenjang pernikahan.", foto: "" }
  ],

  // ---------- GALERI FOTO ----------
  // Tambah/kurangi daftar ini. Taruh file foto di folder assets/img/
  galeri: [
    "assets/img/galeri-01.jpg", "assets/img/galeri-02.jpg", "assets/img/galeri-03.jpg",
    "assets/img/galeri-04.jpg", "assets/img/galeri-05.jpg", "assets/img/galeri-06.jpg",
    "assets/img/galeri-07.jpg", "assets/img/galeri-08.jpg", "assets/img/galeri-09.jpg",
    "assets/img/galeri-10.jpg", "assets/img/galeri-11.jpg", "assets/img/galeri-12.jpg"
  ],

  // ---------- VIDEO ----------
  // tipe "mp4" -> file di assets/video/ ; tipe "youtube" -> isi id video YouTube (kode setelah v=)
  video: [
    { tipe: "mp4", src: "assets/video/video-1.mp4", poster: "assets/img/video-poster.jpg", judul: "Prewedding (contoh)" }
    // , { tipe: "youtube", src: "ID_VIDEO_YOUTUBE", judul: "Video Lamaran" }
  ],

  // ---------- AMPLOP DIGITAL ----------
  rekening: [
    { bank: "BRI", nomor: "0000 0000 0000 000", atasNama: "Nama Pria (CONTOH)" },
    { bank: "BCA", nomor: "0000000000", atasNama: "Nama Wanita (CONTOH)" },
    { bank: "DANA", nomor: "0812 0000 0000", atasNama: "Nama Wanita (CONTOH)" }
  ],
  qris: "assets/img/qris.png", // kosongkan "" jika tidak memakai QRIS
  alamatKado: {
    penerima: "Nama Penerima (CONTOH)",
    alamat: "Jl. Contoh No. 3, RT 01/RW 02, Kel. Contoh, Kab. Sintang, Kalimantan Barat 78611",
    hp: "0812-0000-0000"
  },

  // ---------- MUSIK ----------
  musik: "assets/music/lagu.mp3",
  kreditMusik: "\"Canon in D Major\" — Kevin MacLeod (incompetech.com), CC BY 4.0",

  // ---------- RSVP & UCAPAN ----------
  // Kosong = ucapan hanya tersimpan di HP tamu (mode demo).
  // Isi dengan URL Google Apps Script (lihat README) agar semua ucapan tersimpan
  // di Google Sheets & tampil untuk semua tamu.
  rsvpEndpoint: "",
  nomorWhatsApp: "", // opsional, mis. "6281200000000" untuk konfirmasi via WA

  // ---------- PENUTUP ----------
  penutup: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
  hashtag: "#PriaWanitaBahagia"
};
