// =====================================================================
// Code.gs v2 — Staff tools + laporan revenue + feedback summary
// =====================================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Restoran')
    .addSubMenu(
      ui.createMenu('Pesanan')
        .addItem('Tandai Selesai (baris terpilih)', 'tandaiPesananSelesai')
        .addItem('Tandai Dibatalkan (baris terpilih)', 'tandaiPesananBatal')
        .addSeparator()
        .addItem('Selesaikan Semua Pesanan Hari Ini', 'selesaikanSemuaHariIni')
    )
    .addSubMenu(
      ui.createMenu('Laporan')
        .addItem('Laporan Harian (revenue + orders)', 'generateLaporanHarian')
        .addItem('Laporan Mingguan', 'generateLaporanMingguan')
        .addSeparator()
        .addItem('Ringkasan Feedback', 'lihatRingkasanFeedback')
    )
    .addSubMenu(
      ui.createMenu('Utilitas')
        .addItem('Format Ulang Semua Sheet', 'formatSemuaSheet')
        .addItem('Hapus Session Lama (>30 hari)', 'hapusSessionLama')
        .addSeparator()
        .addItem('Test Koneksi WA', 'testKoneksiWA')
    )
    .addToUi();
}

// =====================================================================
// PESANAN
// =====================================================================

function tandaiPesananSelesai() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_ORDERS);
  const range = sheet.getActiveRange();
  const row = range.getRow();
  if (row < 2) { SpreadsheetApp.getUi().alert('Pilih baris pesanan terlebih dahulu.'); return; }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const get = col => data[headers.indexOf(col)];

  const orderId = get('order_id');
  const phone = get('phone');
  const customerName = get('customer_name');
  if (!orderId) { SpreadsheetApp.getUi().alert('Baris ini tidak memiliki Order ID.'); return; }

  const statusCol = headers.indexOf('status') + 1;
  sheet.getRange(row, statusCol).setValue('done');
  sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground('#d9ead3');

  const message = `Halo ${customerName}! 🍽️\n\nPesanan *${orderId}* sudah siap!\n\nSilakan ambil di kasir.\nTerima kasih sudah memesan di ${CONFIG.RESTAURANT_NAME}! 🙏`;
  kirimWA(phone, message);
  SpreadsheetApp.getUi().alert(`Pesanan ${orderId} selesai. Notifikasi dikirim ke ${phone}.`);
}

function tandaiPesananBatal() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_ORDERS);
  const range = sheet.getActiveRange();
  const row = range.getRow();
  if (row < 2) { SpreadsheetApp.getUi().alert('Pilih baris pesanan terlebih dahulu.'); return; }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const get = col => data[headers.indexOf(col)];

  const orderId = get('order_id');
  const phone = get('phone');
  const customerName = get('customer_name');

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Konfirmasi', `Batalkan pesanan ${orderId} atas nama ${customerName}?`, ui.ButtonSet.YES_NO);
  if (response !== ui.Button.YES) return;

  const statusCol = headers.indexOf('status') + 1;
  sheet.getRange(row, statusCol).setValue('cancelled');
  sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground('#f4cccc');

  const message = `Maaf ${customerName},\n\nPesanan *${orderId}* harus kami batalkan.\n\nInfo: ${CONFIG.WA_OWNER_NUMBER}\nMohon maaf atas ketidaknyamanannya. 🙏`;
  kirimWA(phone, message);
  ui.alert(`Pesanan ${orderId} dibatalkan. Notifikasi dikirim ke ${phone}.`);
}

function selesaikanSemuaHariIni() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Konfirmasi', 'Tandai SEMUA pesanan hari ini sebagai selesai?', ui.ButtonSet.YES_NO);
  if (response !== ui.Button.YES) return;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_ORDERS);
  const today = new Date().toISOString().slice(0, 10);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const statusIdx = headers.indexOf('status');
  const orderTimeIdx = headers.indexOf('order_time');
  const phoneIdx = headers.indexOf('phone');
  const nameIdx = headers.indexOf('customer_name');
  const idIdx = headers.indexOf('order_id');

  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const orderTime = String(row[orderTimeIdx] || '');
    if (orderTime.startsWith(today) && row[statusIdx] === 'confirmed') {
      sheet.getRange(i + 1, statusIdx + 1).setValue('done');
      sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).setBackground('#d9ead3');
      const msg = `Halo ${row[nameIdx]}!\n\nPesanan *${row[idIdx]}* sudah selesai.\nTerima kasih sudah makan di ${CONFIG.RESTAURANT_NAME}! 🌶️`;
      kirimWA(String(row[phoneIdx]), msg);
      count++;
      Utilities.sleep(1500);
    }
  }
  ui.alert(`${count} pesanan ditandai selesai dan notifikasi dikirim.`);
}

// =====================================================================
// LAPORAN
// =====================================================================

function generateLaporanHarian() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const today = new Date().toISOString().slice(0, 10);
  const orders = getRowsByDate(ss.getSheetByName(CONFIG.SHEET_ORDERS), 'order_time', today);
  const reservations = getRowsByDate(ss.getSheetByName(CONFIG.SHEET_RESERVATIONS), 'created_at', today);
  const feedback = getRowsByDate(ss.getSheetByName('Feedback'), 'created_at', today);

  const dineIn = orders.filter(o => o.order_type === 'dine-in').length;
  const takeAway = orders.filter(o => o.order_type === 'take-away').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;

  // Hitung revenue dari order_total
  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.order_total) || 0), 0);

  // Rata-rata rating
  const ratings = feedback.map(f => Number(f.rating)).filter(r => r > 0);
  const avgRating = ratings.length > 0 ? (ratings.reduce((a,b) => a+b, 0) / ratings.length).toFixed(1) : '-';

  const tanggal = Utilities.formatDate(new Date(), 'Asia/Makassar', "EEEE, d MMMM yyyy");

  const laporan = [
    `*LAPORAN HARIAN*`,
    `*${CONFIG.RESTAURANT_NAME}*`,
    tanggal,
    ``,
    `*PESANAN*`,
    `Total: ${orders.length} pesanan`,
    `Makan di Tempat: ${dineIn}`,
    `Bawa Pulang: ${takeAway}`,
    `Dibatalkan: ${cancelled}`,
    ``,
    `*REVENUE*`,
    `Total: Rp ${revenue.toLocaleString('id-ID')}`,
    ``,
    `*RESERVASI*`,
    `Total Hari Ini: ${reservations.length}`,
    ``,
    `*FEEDBACK*`,
    `Diterima: ${feedback.length} rating`,
    `Rata-rata: ${avgRating}/5`,
    ``,
    `_Generated otomatis dari Google Sheets_`
  ].join('\n');

  kirimWA(CONFIG.WA_OWNER_NUMBER, laporan);
  SpreadsheetApp.getUi().alert('Laporan Harian', laporan, SpreadsheetApp.getUi().ButtonSet.OK);
}

function generateLaporanMingguan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const timeIdx = headers.indexOf('order_time');
  const typeIdx = headers.indexOf('order_type');
  const statusIdx = headers.indexOf('status');
  const totalIdx = headers.indexOf('order_total');

  let total = 0, dineIn = 0, takeAway = 0, revenue = 0;
  for (let i = 1; i < data.length; i++) {
    const t = new Date(data[i][timeIdx]);
    if (t >= weekAgo && t <= now) {
      total++;
      if (data[i][typeIdx] === 'dine-in') dineIn++;
      else if (data[i][typeIdx] === 'take-away') takeAway++;
      if (data[i][statusIdx] !== 'cancelled') revenue += (Number(data[i][totalIdx]) || 0);
    }
  }

  const laporan = [
    `*LAPORAN MINGGUAN*`,
    `*${CONFIG.RESTAURANT_NAME}*`,
    `7 hari terakhir`,
    ``,
    `Total Pesanan: ${total}`,
    `Makan di Tempat: ${dineIn}`,
    `Bawa Pulang: ${takeAway}`,
    ``,
    `*Total Revenue: Rp ${revenue.toLocaleString('id-ID')}*`,
    `Rata-rata/hari: Rp ${Math.round(revenue/7).toLocaleString('id-ID')}`,
  ].join('\n');

  kirimWA(CONFIG.WA_OWNER_NUMBER, laporan);
  SpreadsheetApp.getUi().alert('Laporan Mingguan', laporan, SpreadsheetApp.getUi().ButtonSet.OK);
}

function lihatRingkasanFeedback() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Feedback');
  if (!sheet) { SpreadsheetApp.getUi().alert('Sheet Feedback belum ada.'); return; }

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) { SpreadsheetApp.getUi().alert('Belum ada data feedback.'); return; }

  const headers = data[0];
  const ratingIdx = headers.indexOf('rating');
  const commentIdx = headers.indexOf('comment');

  const ratings = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
  const comments = [];
  let total = 0;
  let sum = 0;

  for (let i = 1; i < data.length; i++) {
    const r = String(data[i][ratingIdx] || '').trim();
    if (r && ratings[r] !== undefined) { ratings[r]++; total++; sum += parseInt(r); }
    const c = String(data[i][commentIdx] || '').trim();
    if (c) comments.push(`- "${c}"`);
  }

  const avg = total > 0 ? (sum / total).toFixed(2) : '0';
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

  const ringkasan = [
    `*RINGKASAN FEEDBACK*`,
    `*${CONFIG.RESTAURANT_NAME}*`,
    ``,
    `Total: ${total} rating`,
    `Rata-rata: *${avg}/5*`,
    ``,
    `${stars(5)} Sangat Puas (5): ${ratings['5']}`,
    `${stars(4)} Puas (4): ${ratings['4']}`,
    `${stars(3)} Cukup (3): ${ratings['3']}`,
    `${stars(2)} Kurang (2): ${ratings['2']}`,
    `${stars(1)} Sangat Kurang (1): ${ratings['1']}`,
    comments.length > 0 ? `\nKomentar terakhir:\n${comments.slice(-3).join('\n')}` : ''
  ].join('\n');

  SpreadsheetApp.getUi().alert('Ringkasan Feedback', ringkasan, SpreadsheetApp.getUi().ButtonSet.OK);
}

// =====================================================================
// UTILITAS
// =====================================================================

function formatSemuaSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [CONFIG.SHEET_ORDERS, CONFIG.SHEET_RESERVATIONS, CONFIG.SHEET_SESSIONS].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const statusIdx = headers.indexOf('status');
    if (statusIdx < 0) return;
    for (let i = 1; i < data.length; i++) {
      const status = String(data[i][statusIdx]).toLowerCase();
      let color = '#ffffff';
      if (status === 'confirmed') color = '#fff2cc';
      if (status === 'done' || status === 'arrived') color = '#d9ead3';
      if (status === 'cancelled') color = '#f4cccc';
      if (status === 'feedback_sent') color = '#cfe2f3';
      if (status === 'no-show') color = '#ead1dc';
      sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).setBackground(color);
    }
  });
  SpreadsheetApp.getUi().alert('Format semua sheet selesai!');
}

function hapusSessionLama() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Hapus Session Lama', 'Hapus session pelanggan tidak aktif >30 hari?', ui.ButtonSet.YES_NO);
  if (response !== ui.Button.YES) return;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const timeIdx = headers.indexOf('last_updated');
  const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let deleted = 0;
  for (let i = data.length - 1; i >= 1; i--) {
    if (new Date(data[i][timeIdx]) < threshold) { sheet.deleteRow(i + 1); deleted++; }
  }
  ui.alert(`${deleted} session lama dihapus.`);
}

function testKoneksiWA() {
  const ok = kirimWA(CONFIG.WA_OWNER_NUMBER, `*Test Koneksi* ✅\n${CONFIG.RESTAURANT_NAME} — Apps Script berfungsi normal.`);
  SpreadsheetApp.getUi().alert(ok ? `Pesan test berhasil dikirim ke ${CONFIG.WA_OWNER_NUMBER}` : 'Gagal kirim. Cek konfigurasi di Config.gs');
}

// =====================================================================
// HELPERS
// =====================================================================

function kirimWA(phone, text) {
  try {
    const url = `${CONFIG.EVOLUTION_URL}/message/sendText/${CONFIG.EVOLUTION_INSTANCE}`;
    const options = {
      method: 'POST', contentType: 'application/json',
      headers: { apikey: CONFIG.EVOLUTION_API_KEY },
      payload: JSON.stringify({ number: String(phone), text: String(text) }),
      muteHttpExceptions: true
    };
    const resp = UrlFetchApp.fetch(url, options);
    return resp.getResponseCode() < 300;
  } catch(e) { Logger.log('kirimWA error: ' + e.message); return false; }
}

function getColumnIndex(sheet, columnName) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf(columnName) + 1;
}

function getRowsByDate(sheet, dateColumn, dateStr) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const dateIdx = headers.indexOf(dateColumn);
  if (dateIdx < 0) return [];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][dateIdx] || '').startsWith(dateStr)) {
      const obj = {};
      headers.forEach((h, j) => { obj[h] = data[i][j]; });
      result.push(obj);
    }
  }
  return result;
}
