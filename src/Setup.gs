// =====================================================================
// Setup.gs — Jalankan SEKALI untuk setup seluruh spreadsheet restoran
// =====================================================================
// Cara pakai:
// 1. Buka Google Spreadsheet baru (kosong)
// 2. Extensions → Apps Script
// 3. Hapus kode default, paste semua kode ini
// 4. Klik Run → setupRestaurantSpreadsheet
// 5. Izinkan akses saat diminta
// 6. Selesai! Kembali ke spreadsheet
// =====================================================================

function setupRestaurantSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('Asia/Makassar');
  ss.rename('Restoran Sasak Lombok — Database');

  _setupMenuSheet(ss);
  _setupOrdersSheet(ss);
  _setupReservationsSheet(ss);
  _setupSessionsSheet(ss);
  _setupBroadcastsSheet(ss);

  // Hapus sheet default kosong jika ada
  const defaultNames = ['Sheet1', 'Lembar1'];
  defaultNames.forEach(name => {
    const s = ss.getSheetByName(name);
    if (s) ss.deleteSheet(s);
  });

  // Aktifkan sheet pertama
  ss.setActiveSheet(ss.getSheetByName('Orders'));

  SpreadsheetApp.getUi().alert(
    '✅ Setup Selesai!',
    'Semua sheet sudah dibuat:\n\n' +
    '• Menu (16 item sudah diisi)\n' +
    '• Orders\n' +
    '• Reservations\n' +
    '• Sessions\n' +
    '• Broadcasts\n\n' +
    'Salin Spreadsheet ID dari URL untuk diisi di .env',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// =====================================================================
// SHEET: Menu
// =====================================================================
function _setupMenuSheet(ss) {
  let sheet = ss.getSheetByName('Menu');
  if (!sheet) sheet = ss.insertSheet('Menu');
  sheet.clear();

  const headers = ['id', 'category', 'name', 'description', 'price', 'available'];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#1c4587');

  // Data menu Lombok
  const menuData = [
    [1,  'Ayam',    'Ayam Taliwang Pedas',      'Ayam bakar bumbu taliwang, super pedas khas Lombok', 45000, true],
    [2,  'Ayam',    'Ayam Taliwang Tidak Pedas', 'Ayam bakar bumbu taliwang tanpa cabai',              45000, true],
    [3,  'Ayam',    'Pelecing Ayam',             'Ayam goreng dengan sambal pelecing tomat',           40000, true],
    [4,  'Sate',    'Sate Rembiga',              'Sate sapi bumbu merah khas Rembiga, Mataram',        35000, true],
    [5,  'Sate',    'Sate Ayam Bulayak',         'Sate ayam disajikan dengan lontong bulayak',         30000, true],
    [6,  'Sayuran', 'Plecing Kangkung',          'Kangkung rebus dengan sambal tomat pedas',           20000, true],
    [7,  'Sayuran', 'Beberuk Terong',            'Terong mentah dengan bumbu kelapa khas Lombok',      15000, true],
    [8,  'Sayuran', 'Urap Sayur',                'Sayuran rebus dengan bumbu kelapa parut',            18000, true],
    [9,  'Nasi',    'Nasi Balap Puyung',         'Nasi dengan ayam suwir, kacang, dan keripik pedas',  25000, true],
    [10, 'Nasi',    'Nasi Putih',                'Nasi putih pulen',                                   5000,  true],
    [11, 'Ikan',    'Ikan Bakar Bumbu Lombok',   'Ikan segar bakar dengan bumbu khas Lombok',          55000, true],
    [12, 'Ikan',    'Ikan Goreng Pedas',         'Ikan goreng dengan sambal cabai merah',               50000, true],
    [13, 'Minuman', 'Es Kelapa Muda',            'Kelapa muda segar langsung dari buahnya',            15000, true],
    [14, 'Minuman', 'Es Teh Manis',              'Teh manis dingin',                                    8000,  true],
    [15, 'Minuman', 'Es Jeruk',                  'Jeruk peras segar',                                  10000, true],
    [16, 'Minuman', 'Air Mineral',               'Air mineral dingin',                                  5000,  true],
  ];
  sheet.getRange(2, 1, menuData.length, headers.length).setValues(menuData);

  // Format kolom price sebagai Rupiah
  sheet.getRange(2, 5, menuData.length, 1).setNumberFormat('"Rp "#,##0');

  // Dropdown available: TRUE/FALSE
  const availableRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TRUE', 'FALSE'])
    .setAllowInvalid(false).build();
  sheet.getRange(2, 6, 50, 1).setDataValidation(availableRule);

  // Checkbox untuk available
  sheet.getRange(2, 6, menuData.length, 1).insertCheckboxes();

  // Warna baris per kategori
  const categoryColors = { 'Ayam': '#fff2cc', 'Sate': '#fce5cd', 'Sayuran': '#d9ead3', 'Nasi': '#fff2cc', 'Ikan': '#cfe2f3', 'Minuman': '#e8def8' };
  menuData.forEach((row, i) => {
    const color = categoryColors[row[1]] || '#ffffff';
    sheet.getRange(i + 2, 1, 1, headers.length).setBackground(color);
  });

  // Dropdown category
  const catRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Ayam', 'Sate', 'Sayuran', 'Nasi', 'Ikan', 'Minuman', 'Lainnya'])
    .setAllowInvalid(false).build();
  sheet.getRange(2, 2, 50, 1).setDataValidation(catRule);

  _setColumnWidths(sheet, [50, 90, 220, 320, 100, 90]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Menu restoran. Ubah available=FALSE untuk sembunyikan menu dari bot.');
}

// =====================================================================
// SHEET: Orders
// =====================================================================
function _setupOrdersSheet(ss) {
  let sheet = ss.getSheetByName('Orders');
  if (!sheet) sheet = ss.insertSheet('Orders');
  sheet.clear();

  const headers = ['order_id', 'phone', 'customer_name', 'items', 'order_type', 'status', 'order_time'];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#38761d');

  // Dropdown order_type
  const typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['dine-in', 'take-away'])
    .setAllowInvalid(false).build();
  sheet.getRange(2, 5, 200, 1).setDataValidation(typeRule);

  // Dropdown status
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['confirmed', 'processing', 'feedback_sent', 'done', 'cancelled'])
    .setAllowInvalid(false).build();
  sheet.getRange(2, 6, 200, 1).setDataValidation(statusRule);

  // Format kolom order_time
  sheet.getRange(2, 7, 200, 1).setNumberFormat('dd/MM/yyyy HH:mm');

  // Conditional formatting berdasarkan status
  const rules = [];
  const statusColors = [
    { status: 'confirmed',     bg: '#fff2cc', text: '#7f6000' },
    { status: 'processing',    bg: '#cfe2f3', text: '#1c4587' },
    { status: 'feedback_sent', bg: '#d0e0e3', text: '#134f5c' },
    { status: 'done',          bg: '#d9ead3', text: '#274e13' },
    { status: 'cancelled',     bg: '#f4cccc', text: '#990000' },
  ];
  statusColors.forEach(s => {
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=$F2="${s.status}"`)
      .setBackground(s.bg)
      .setFontColor(s.text)
      .setRanges([sheet.getRange('A2:G200')])
      .build();
    rules.push(rule);
  });
  sheet.setConditionalFormatRules(rules);

  _setColumnWidths(sheet, [110, 130, 150, 280, 100, 120, 140]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Rekap pesanan. Status diupdate otomatis oleh n8n atau manual oleh staff.');
}

// =====================================================================
// SHEET: Reservations
// =====================================================================
function _setupReservationsSheet(ss) {
  let sheet = ss.getSheetByName('Reservations');
  if (!sheet) sheet = ss.insertSheet('Reservations');
  sheet.clear();

  const headers = ['reservation_id', 'phone', 'customer_name', 'guests', 'date', 'time', 'status', 'created_at'];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#7f6000');

  // Dropdown status
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['confirmed', 'arrived', 'no-show', 'cancelled'])
    .setAllowInvalid(false).build();
  sheet.getRange(2, 7, 200, 1).setDataValidation(statusRule);

  sheet.getRange(2, 8, 200, 1).setNumberFormat('dd/MM/yyyy HH:mm');

  // Conditional formatting
  const rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$G2="confirmed"').setBackground('#fff2cc').setFontColor('#7f6000')
      .setRanges([sheet.getRange('A2:H200')]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$G2="arrived"').setBackground('#d9ead3').setFontColor('#274e13')
      .setRanges([sheet.getRange('A2:H200')]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$G2="no-show"').setBackground('#ead1dc').setFontColor('#4a1942')
      .setRanges([sheet.getRange('A2:H200')]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$G2="cancelled"').setBackground('#f4cccc').setFontColor('#990000')
      .setRanges([sheet.getRange('A2:H200')]).build(),
  ];
  sheet.setConditionalFormatRules(rules);

  _setColumnWidths(sheet, [130, 130, 150, 70, 120, 80, 110, 140]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Reservasi meja. Ubah status ke arrived saat tamu datang.');
}

// =====================================================================
// SHEET: Sessions
// =====================================================================
function _setupSessionsSheet(ss) {
  let sheet = ss.getSheetByName('Sessions');
  if (!sheet) sheet = ss.insertSheet('Sessions');
  sheet.clear();

  const headers = [
    'phone', 'name', 'state',
    'pending_order', 'order_customer_name', 'order_type', 'last_order_id',
    'reservation_guests', 'reservation_date', 'reservation_time', 'reservation_name', 'last_reservation_id',
    'cart', 'last_updated'
  ];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#4a1942');

  // Dropdown state
  const stateRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'start', 'main_menu', 'ordering', 'order_confirm',
      'order_name', 'order_type', 'order_final',
      'reservation_guests', 'reservation_date', 'reservation_time',
      'reservation_name', 'reservation_confirm'
    ])
    .setAllowInvalid(true).build();
  sheet.getRange(2, 3, 500, 1).setDataValidation(stateRule);

  sheet.getRange(2, 14, 500, 1).setNumberFormat('dd/MM/yyyy HH:mm');

  _setColumnWidths(sheet, [130, 120, 140, 200, 150, 100, 110, 80, 110, 80, 130, 130, 150, 140]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Session percakapan pelanggan. Dikelola otomatis oleh n8n. Jangan diedit manual kecuali untuk debug.');
}

// =====================================================================
// SHEET: Broadcasts
// =====================================================================
function _setupBroadcastsSheet(ss) {
  let sheet = ss.getSheetByName('Broadcasts');
  if (!sheet) sheet = ss.insertSheet('Broadcasts');
  sheet.clear();

  const headers = ['broadcast_id', 'message', 'status', 'recipients', 'sent_at', 'created_at'];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#990000');

  // Dropdown status
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['pending', 'sent', 'cancelled'])
    .setAllowInvalid(false).build();
  sheet.getRange(2, 3, 100, 1).setDataValidation(statusRule);

  sheet.getRange(2, 5, 100, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  sheet.getRange(2, 6, 100, 1).setNumberFormat('dd/MM/yyyy HH:mm');

  // Contoh baris broadcast
  const example = [
    ['BC-001',
     'Halo! Restoran Sasak Lombok buka kembali hari ini. Nikmati promo GRATIS Es Kelapa Muda untuk setiap pemesanan Ayam Taliwang! Berlaku hari ini saja 🌶️',
     'pending', '', '', new Date()]
  ];
  sheet.getRange(2, 1, 1, headers.length).setValues(example);
  sheet.getRange(2, 1, 1, headers.length).setBackground('#fff2cc');

  // Conditional formatting
  const rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$C2="pending"').setBackground('#fff2cc').setFontColor('#7f6000')
      .setRanges([sheet.getRange('A2:F100')]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$C2="sent"').setBackground('#d9ead3').setFontColor('#274e13')
      .setRanges([sheet.getRange('A2:F100')]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$C2="cancelled"').setBackground('#f4cccc').setFontColor('#990000')
      .setRanges([sheet.getRange('A2:F100')]).build(),
  ];
  sheet.setConditionalFormatRules(rules);

  _setColumnWidths(sheet, [100, 400, 90, 100, 140, 140]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Tulis pesan promo di kolom message, set status=pending, lalu jalankan workflow Broadcast di n8n.');
}

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

function _styleHeader(range, bgColor) {
  range
    .setBackground(bgColor)
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  range.getSheet().setFrozenRows(1);
  range.getSheet().setRowHeight(1, 32);
}

function _setColumnWidths(sheet, widths) {
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
}

function _freezeAndProtectHeader(sheet) {
  sheet.setFrozenRows(1);
  // Protect header dari edit tidak sengaja
  const protection = sheet.getRange('1:1').protect().setDescription('Header — jangan diedit');
  protection.setWarningOnly(true);
}

function _addSheetNote(sheet, note) {
  sheet.getRange('A1').setNote(note);
}
