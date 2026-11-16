/* =========================================================
   TEKS UNDANGAN YANG BISA DIEDIT KLIEN
   Disimpan di invitations.data.teks.<key> (kalimat harapan di data.penutup,
   ayat di data.ayat). Nilai belum diisi = teks bawaan; dikosongkan = baris disembunyikan.
   ========================================================= */
(function(){
  const F = (key, label, def, opt = {}) => ({ key, label, def, ...opt });
  const GROUPS = [
    { title: "Sampul (halaman pembuka)", fields: [
      F("judulCover", "Judul kecil di sampul", "The Wedding of", { tpl: "coverEyebrow" }),
      F("kepadaYth", "Sapaan untuk tamu", "Kepada Yth. Bapak/Ibu/Saudara/i"),
      F("maafNama", "Catatan nama tamu", "Mohon maaf bila ada kesalahan penulisan nama/gelar"),
      F("tombolBuka", "Tulisan tombol buka", "Buka Undangan", { required: true }),
      F("judulHero", "Judul kecil foto utama", "We Are Getting Married", { tpl: "heroEyebrow" }) ]},
    { title: "Salam & kalimat pembuka", preset: true, fields: [
      F("salamPembuka", "Salam pembuka", "Assalamu'alaikum Warahmatullahi Wabarakatuh", { preset: true }),
      F("pengantar", "Kalimat pengantar (sebelum nama mempelai)", "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:", { multi: true, preset: true }),
      F("ayat.teks", "Ayat / kutipan", "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.", { multi: true, preset: true, path: "ayat.teks" }),
      F("ayat.sumber", "Sumber ayat / kutipan", "QS. Ar-Rum : 21", { preset: true, path: "ayat.sumber" }) ]},
    { title: "Judul & keterangan tiap bagian", fields: [
      F("judulCountdown", "Judul hitung mundur", "Menuju Hari Bahagia"),
      F("judulAcara", "Judul acara", "Rangkaian Acara"),
      F("judulCerita", "Judul love story", "Kisah Cinta Kami"),
      F("judulGaleri", "Judul galeri", "Galeri"),
      F("subGaleri", "Keterangan galeri", "Momen-momen bahagia kami"),
      F("judulAmplop", "Judul amplop digital", "Amplop Digital"),
      F("catatanAmplop", "Keterangan amplop digital", "Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika memberi adalah ungkapan tanda kasih, Anda dapat memberi kado secara cashless.", { multi: true }),
      F("judulRsvp", "Judul RSVP", "RSVP & Ucapan"),
      F("subRsvp", "Keterangan RSVP", "Mohon konfirmasi kehadiran dan kirimkan doa terbaik untuk kami", { multi: true }) ]},
    { title: "Penutup", preset: true, fields: [
      F("harapan", "Kalimat harapan kehadiran", "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.", { multi: true, preset: true, path: "penutup" }),
      F("terimaKasih", "Ucapan terima kasih", "Atas kehadiran dan doa restunya, kami ucapkan terima kasih.", { multi: true, preset: true }),
      F("salamPenutup", "Salam penutup", "Wassalamu'alaikum Warahmatullahi Wabarakatuh", { preset: true }),
      F("kamiBerbahagia", "Tulisan sebelum nama mempelai", "Kami yang berbahagia,") ]}
  ];
  const FIELDS = GROUPS.flatMap(g => g.fields).map(f => ({ ...f, path: f.path || "teks." + f.key }));
  const PRESETS = {
    islami: { nama: "Islami", v: {} },
    umum: { nama: "Umum / Nasional", v: {
      salamPembuka: "Salam sejahtera bagi kita semua",
      pengantar: "Dengan penuh rasa syukur dan sukacita, kami bermaksud menyelenggarakan pernikahan putra-putri kami:",
      "ayat.teks": "Cinta bukanlah saling menatap satu sama lain, melainkan bersama-sama memandang ke arah yang sama.",
      "ayat.sumber": "Antoine de Saint-Exupéry",
      harapan: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
      terimaKasih: "Atas kehadiran dan doa restunya, kami ucapkan terima kasih.",
      salamPenutup: "Sampai jumpa di hari bahagia kami" } },
    kristen: { nama: "Kristen / Katolik", v: {
      salamPembuka: "Salam damai sejahtera dalam kasih Tuhan",
      pengantar: "Dengan memohon kasih dan berkat Tuhan, kami bermaksud melangsungkan pernikahan putra-putri kami:",
      "ayat.teks": "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
      "ayat.sumber": "Matius 19 : 6",
      harapan: "Merupakan suatu kehormatan dan sukacita bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
      terimaKasih: "Atas kehadiran dan doa restunya, kami ucapkan terima kasih.",
      salamPenutup: "Tuhan memberkati" } },
    hindu: { nama: "Hindu", v: {
      salamPembuka: "Om Swastyastu",
      pengantar: "Atas Asung Kertha Wara Nugraha Ida Sang Hyang Widhi Wasa, kami bermaksud menyelenggarakan Upacara Manusa Yadnya Pawiwahan putra-putri kami:",
      "ayat.teks": "Wahai pasangan suami-istri, semoga kalian tetap bersatu dan tidak pernah terpisahkan. Semoga kalian mencapai hidup penuh kebahagiaan, tinggal di rumah yang penuh kegembiraan bersama anak dan cucu.",
      "ayat.sumber": "Rgveda X.85.42",
      harapan: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
      terimaKasih: "Atas kehadiran dan doa restunya, kami ucapkan terima kasih.",
      salamPenutup: "Om Shanti Shanti Shanti Om" } }
  };
  FIELDS.filter(f => f.preset).forEach(f => { PRESETS.islami.v[f.key] = f.def; });
  const get = (o, p) => p.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o);
  /* Nilai efektif sebuah field: undefined = pakai bawaan (atau teks template) */
  function value(data, f, tplText){
    const v = get(data || {}, f.path);
    if (v === undefined || v === null || (f.required && !String(v).trim())) return f.tpl && tplText && tplText[f.tpl] ? tplText[f.tpl] : f.def;
    return String(v);
  }
  window.TEKS = { GROUPS, FIELDS, PRESETS, value, byKey: Object.fromEntries(FIELDS.map(f => [f.key, f])) };
})();
