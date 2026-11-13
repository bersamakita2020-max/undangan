/**
 * Buku Tamu / RSVP untuk Undangan Digital
 * 1. Buat Google Sheets baru -> menu Ekstensi -> Apps Script
 * 2. Hapus isi Code.gs, tempel seluruh kode ini, Simpan
 * 3. Deploy -> New deployment -> type: Web app
 *    Execute as: Me | Who has access: Anyone -> Deploy -> izinkan akses
 * 4. Salin "Web app URL" (https://script.google.com/macros/s/.../exec)
 *    lalu tempel ke config.js -> rsvpEndpoint: "URL_TADI"
 */
const SHEET = "Ucapan";

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(["waktu", "nama", "hadir", "jumlah", "ucapan"]); }
  return sh;
}

function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const data = rows.map(r => ({ waktu: r[0], nama: r[1], hadir: r[2], jumlah: r[3], ucapan: r[4] })).reverse();
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const clean = (s, n) => String(s || "").slice(0, n);
  sheet_().appendRow([new Date().toISOString(), clean(d.nama, 60), clean(d.hadir, 20), clean(d.jumlah, 3), clean(d.ucapan, 500)]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
