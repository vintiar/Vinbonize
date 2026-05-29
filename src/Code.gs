// =====================================================================
// Vinbonize — Google Apps Script untuk Restoran Sasak Lombok
// =====================================================================

// Buat menu custom saat spreadsheet dibuka
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
        .addItem('Laporan Harian', 'generateLaporanHarian')
        .addItem('Laporan Mingguan', 'generateLaporanMingguan')
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

  if (row < 2) {
    SpreadsheetApp.getUi().alert('Pilih baris pesanan terlebih dahulu (bukan baris header).');
    return;
  }

  const data = sheet.getRange(row, 1, 1, 7).getValues()[0];
  const orderId = data[0];
  const phone = data[1];
  const customerName = data[2];
  const items = data[3];

  if (!orderId) {
    SpreadsheetApp.getUi().alert('Baris ini tidak memiliki Order ID.');
    return;
  }

  // Update status
  const statusCol = getColumnIndex(sheet, 'status');
  sheet.getRange(row, statusCol).setValue('done');
  sheet.getRange(row, 1, 1, sheet.getLastColumn())
    .setBackground('#d9ead3'); // hijau muda

  // Kirim notifikasi ke customer via WA
  const message = `Halo ${customerName}!\n\nPesanan kamu *${orderId}* sudah siap!\n\n${CONFIG.RESTAURANT_NAME} siap menyajikan.\nTerima kasih! 🙏`;
  kirimWA(phone, message);

  SpreadsheetApp.getUi().alert(`Pesanan ${orderId} ditandai selesai.\nNotifikasi dikirim ke ${phone}.`);
}

function tandaiPesananBatal() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_ORDERS);
  const range = sheet.getActiveRange();
  const row = range.getRow();

  if (row < 2) {
    SpreadsheetApp.getUi().alert('Pilih baris pesanan terlebih dahulu.');
    return;
  }

  const data = sheet.getRange(row, 1, 1, 7).getValues()[0];
  const orderId = data[0];
  const phone = data[1];
  const customerName = data[2];

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Konfirmasi Pembatalan',
    `Batalkan pesanan ${orderId} atas nama ${customerName}?`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  const statusCol = getColumnIndex(sheet, 'status');
  sheet.getRange(row, statusCol).setValue('cancelled');
  sheet.getRange(row, 1, 1, sheet.getLastColumn())
    .setBackground('#f4cccc'); // merah muda

  const message = `Maaf ${customerName},\n\nPesanan *${orderId}* harus kami batalkan.\n\nUntuk info hubungi: ${CONFIG.WA_OWNER_NUMBER}\nMohon maaf atas ketidaknyamanannya. 🙏`;
  kirimWA(phone, message);

  ui.alert(`Pesanan ${orderId} dibatalkan.\nNotifikasi dikirim ke ${phone}.`);
}

function selesaikanSemuaHariIni() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Konfirmasi',
    'Tandai SEMUA pesanan hari ini sebagai selesai dan kirim notif ke semua customer?',
    ui.ButtonSet.YES_NO
  );
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
    const status = row[statusIdx];
    if (orderTime.startsWith(today) && status === 'confirmed') {
      sheet.getRange(i + 1, statusIdx + 1).setValue('done');
      sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).setBackground('#d9ead3');
      const msg = `Halo ${row[nameIdx]}!\n\nPesanan *${row[idIdx]}* sudah selesai.\nTerima kasih sudah makan di ${CONFIG.RESTAURANT_NAME}! 🌶️`;
      kirimWA(String(row[phoneIdx]), msg);
      count++;
      Utilities.sleep(1500); // jeda 1.5 detik antar notif
    }
  }
  ui.alert(`${count} pesanan ditandai selesai dan notifikasi dikirim.`);
}

// =====================================================================
// LAPORAN
// =====================================================================

function generateLaporanHarian() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  const resSheet = ss.getSheetByName(CONFIG.SHEET_RESERVATIONS);

  const today = new Date().toISOString().slice(0, 10);
  const orders = getRowsByDate(ordersSheet, 'order_time', today);
  const reservations = getRowsByDate(resSheet, 'created_at', today);

  const dineIn = orders.filter(o => o.order_type === 'dine-in').length;
  const takeAway = orders.filter(o => o.order_type === 'take-away').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;

  const tanggal = Utilities.formatDate(new Date(), 'Asia/Makassar', 'EEEE, d MMMM yyyy');

  const laporan = [
    `*LAPORAN HARIAN*`,
    `*${CONFIG.RESTAURANT_NAME}*`,
    `${tanggal}`,
    ``,
    `*PESANAN*`,
    `Total: ${orders.length}`,
    `Makan di Tempat: ${dineIn}`,
    `Bawa Pulang: ${takeAway}`,
    `Dibatalkan: ${cancelled}`,
    ``,
    `*RESERVASI*`,
    `Total Hari Ini: ${reservations.length}`,
    ``,
    `_Generated dari Google Sheets_`
  ].join('\n');

  // Kirim ke owner
  kirimWA(CONFIG.WA_OWNER_NUMBER, laporan);

  // Tampilkan di dialog
  SpreadsheetApp.getUi().alert('Laporan Harian', laporan, SpreadsheetApp.getUi().ButtonSet.OK);
}

function generateLaporanMingguan() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_ORDERS);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const orders = sheet.getDataRange().getValues();
  const headers = orders[0];
  const timeIdx = headers.indexOf('order_time');
  const typeIdx = headers.indexOf('order_type');
  const statusIdx = headers.indexOf('status');

  let total = 0, dineIn = 0, takeAway = 0;
  for (let i = 1; i < orders.length; i++) {
    const t = new Date(orders[i][timeIdx]);
    if (t >= weekAgo && t <= now) {
      total++;
      if (orders[i][typeIdx] === 'dine-in') dineIn++;
      else if (orders[i][typeIdx] === 'take-away') takeAway++;
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
  ].join('\n');

  kirimWA(CONFIG.WA_OWNER_NUMBER, laporan);
  SpreadsheetApp.getUi().alert('Laporan Mingguan', laporan, SpreadsheetApp.getUi().ButtonSet.OK);
}

// =====================================================================
// UTILITAS
// =====================================================================

function formatSemuaSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsToFormat = [CONFIG.SHEET_ORDERS, CONFIG.SHEET_RESERVATIONS, CONFIG.SHEET_SESSIONS];

  sheetsToFormat.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const statusIdx = headers.indexOf('status');
    if (statusIdx < 0) return;

    for (let i = 1; i < data.length; i++) {
      const status = String(data[i][statusIdx]).toLowerCase();
      let color = '#ffffff';
      if (status === 'confirmed') color = '#fff2cc';   // kuning
      if (status === 'done') color = '#d9ead3';         // hijau
      if (status === 'cancelled') color = '#f4cccc';   // merah
      if (status === 'feedback_sent') color = '#cfe2f3'; // biru muda
      sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).setBackground(color);
    }
  });

  SpreadsheetApp.getUi().alert('Format semua sheet selesai!');
}

function hapusSessionLama() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Hapus Session Lama',
    'Hapus semua session pelanggan yang tidak aktif lebih dari 30 hari?',
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const timeIdx = headers.indexOf('last_updated');
  const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let deleted = 0;
  for (let i = data.length - 1; i >= 1; i--) {
    const t = new Date(data[i][timeIdx]);
    if (t < threshold) {
      sheet.deleteRow(i + 1);
      deleted++;
    }
  }
  ui.alert(`${deleted} session lama dihapus.`);
}

function testKoneksiWA() {
  const result = kirimWA(
    CONFIG.WA_OWNER_NUMBER,
    `*Test Koneksi* ✅\n${CONFIG.RESTAURANT_NAME} — Apps Script berfungsi normal.`
  );
  if (result) {
    SpreadsheetApp.getUi().alert('Pesan test berhasil dikirim ke ' + CONFIG.WA_OWNER_NUMBER);
  } else {
    SpreadsheetApp.getUi().alert('Gagal kirim. Cek konfigurasi EVOLUTION_URL dan API_KEY di Config.gs');
  }
}

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

function kirimWA(phone, text) {
  try {
    const url = `${CONFIG.EVOLUTION_URL}/message/sendText/${CONFIG.EVOLUTION_INSTANCE}`;
    const payload = JSON.stringify({ number: String(phone), text: String(text) });
    const options = {
      method: 'POST',
      contentType: 'application/json',
      headers: { apikey: CONFIG.EVOLUTION_API_KEY },
      payload: payload,
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    return response.getResponseCode() === 200 || response.getResponseCode() === 201;
  } catch (e) {
    Logger.log('Error kirim WA: ' + e.message);
    return false;
  }
}

function getColumnIndex(sheet, columnName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.indexOf(columnName) + 1;
}

function getRowsByDate(sheet, dateColumn, dateStr) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const dateIdx = headers.indexOf(dateColumn);
  if (dateIdx < 0) return [];

  const result = [];
  for (let i = 1; i < data.length; i++) {
    const cellDate = String(data[i][dateIdx] || '');
    if (cellDate.startsWith(dateStr)) {
      const obj = {};
      headers.forEach((h, j) => { obj[h] = data[i][j]; });
      result.push(obj);
    }
  }
  return result;
}
