// =====================================================================
// Setup.gs v2 — Jalankan SEKALI untuk setup seluruh spreadsheet
// PERUBAHAN v2: kolom baru Orders/Reservations/Sessions + sheet Feedback
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
  _setupFeedbackSheet(ss);

  const defaultNames = ['Sheet1', 'Lembar1'];
  defaultNames.forEach(name => {
    const s = ss.getSheetByName(name);
    if (s) try { ss.deleteSheet(s); } catch(e) {}
  });

  ss.setActiveSheet(ss.getSheetByName('Orders'));

  SpreadsheetApp.getUi().alert(
    '✅ Setup Selesai!',
    'Semua sheet sudah dibuat:\n\n' +
    '• Menu (16 item sudah diisi)\n' +
    '• Orders (+ order_total, special_requests)\n' +
    '• Reservations (+ table_number, reminder flags)\n' +
    '• Sessions (+ feedback fields)\n' +
    '• Broadcasts\n' +
    '• Feedback (sheet baru)\n\n' +
    'Salin Spreadsheet ID dari URL untuk .env',
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
  sheet.getRange(2, 5, menuData.length, 1).setNumberFormat('"Rp "#,##0');

  const availableRule = SpreadsheetApp.newDataValidation().requireValueInList(['TRUE','FALSE']).setAllowInvalid(false).build();
  sheet.getRange(2, 6, 50, 1).setDataValidation(availableRule);
  sheet.getRange(2, 6, menuData.length, 1).insertCheckboxes();

  const categoryColors = {'Ayam':'#fff2cc','Sate':'#fce5cd','Sayuran':'#d9ead3','Nasi':'#fff2cc','Ikan':'#cfe2f3','Minuman':'#e8def8'};
  menuData.forEach((row, i) => {
    const color = categoryColors[row[1]] || '#ffffff';
    sheet.getRange(i + 2, 1, 1, headers.length).setBackground(color);
  });

  const catRule = SpreadsheetApp.newDataValidation().requireValueInList(['Ayam','Sate','Sayuran','Nasi','Ikan','Minuman','Lainnya']).setAllowInvalid(false).build();
  sheet.getRange(2, 2, 50, 1).setDataValidation(catRule);

  _setColumnWidths(sheet, [50, 90, 220, 320, 100, 90]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Menu restoran. Ubah available=FALSE untuk sembunyikan menu dari bot. Harga langsung dibaca oleh chatbot.');
}

// =====================================================================
// SHEET: Orders (v2 — tambah order_total, special_requests)
// =====================================================================
function _setupOrdersSheet(ss) {
  let sheet = ss.getSheetByName('Orders');
  if (!sheet) sheet = ss.insertSheet('Orders');
  sheet.clear();

  const headers = ['order_id','phone','customer_name','items','order_type','status','order_time','order_total','special_requests'];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#38761d');

  const typeRule = SpreadsheetApp.newDataValidation().requireValueInList(['dine-in','take-away']).setAllowInvalid(false).build();
  sheet.getRange(2, 5, 200, 1).setDataValidation(typeRule);

  const statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['confirmed','processing','feedback_sent','done','cancelled']).setAllowInvalid(false).build();
  sheet.getRange(2, 6, 200, 1).setDataValidation(statusRule);

  sheet.getRange(2, 7, 200, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  sheet.getRange(2, 8, 200, 1).setNumberFormat('"Rp "#,##0');

  const rules = [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2="confirmed"').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([sheet.getRange('A2:I200')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2="processing"').setBackground('#cfe2f3').setFontColor('#1c4587').setRanges([sheet.getRange('A2:I200')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2="feedback_sent"').setBackground('#d0e0e3').setFontColor('#134f5c').setRanges([sheet.getRange('A2:I200')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2="done"').setBackground('#d9ead3').setFontColor('#274e13').setRanges([sheet.getRange('A2:I200')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2="cancelled"').setBackground('#f4cccc').setFontColor('#990000').setRanges([sheet.getRange('A2:I200')]).build(),
  ];
  sheet.setConditionalFormatRules(rules);

  _setColumnWidths(sheet, [110, 130, 150, 280, 100, 120, 140, 110, 200]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Rekap pesanan. order_total diisi otomatis oleh bot. Status diupdate via staff commands WA.');
}

// =====================================================================
// SHEET: Reservations (v2 — tambah table_number, reminder flags, notes)
// =====================================================================
function _setupReservationsSheet(ss) {
  let sheet = ss.getSheetByName('Reservations');
  if (!sheet) sheet = ss.insertSheet('Reservations');
  sheet.clear();

  const headers = ['reservation_id','phone','customer_name','guests','date','time','status','created_at','table_number','reminder_h1_sent','reminder_h2_sent','notes'];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#7f6000');

  const statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['confirmed','arrived','no-show','cancelled']).setAllowInvalid(false).build();
  sheet.getRange(2, 7, 200, 1).setDataValidation(statusRule);

  sheet.getRange(2, 8, 200, 1).setNumberFormat('dd/MM/yyyy HH:mm');

  // Checkboxes untuk reminder flags
  sheet.getRange(2, 10, 200, 1).insertCheckboxes();
  sheet.getRange(2, 11, 200, 1).insertCheckboxes();

  const rules = [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$G2="confirmed"').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([sheet.getRange('A2:L200')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$G2="arrived"').setBackground('#d9ead3').setFontColor('#274e13').setRanges([sheet.getRange('A2:L200')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$G2="no-show"').setBackground('#ead1dc').setFontColor('#4a1942').setRanges([sheet.getRange('A2:L200')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$G2="cancelled"').setBackground('#f4cccc').setFontColor('#990000').setRanges([sheet.getRange('A2:L200')]).build(),
  ];
  sheet.setConditionalFormatRules(rules);

  _setColumnWidths(sheet, [130, 130, 150, 70, 120, 80, 110, 140, 110, 130, 130, 200]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Reservasi meja. reminder_h1_sent/reminder_h2_sent diisi otomatis oleh workflow reminder. table_number diisi staff.');
}

// =====================================================================
// SHEET: Sessions (v2 — tambah feedback fields + order_total)
// =====================================================================
function _setupSessionsSheet(ss) {
  let sheet = ss.getSheetByName('Sessions');
  if (!sheet) sheet = ss.insertSheet('Sessions');
  sheet.clear();

  const headers = [
    'phone','name','state',
    'pending_order','order_customer_name','order_type','last_order_id','order_total',
    'reservation_guests','reservation_date','reservation_time','reservation_name','last_reservation_id',
    'feedback_pending_order_id','feedback_rating','feedback_comment','feedback_status',
    'cart','last_updated'
  ];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#4a1942');

  const stateRule = SpreadsheetApp.newDataValidation().requireValueInList([
    'start','main_menu','ordering','order_confirm','order_name','order_type','order_final',
    'reservation_guests','reservation_date','reservation_time','reservation_name','reservation_confirm',
    'awaiting_feedback'
  ]).setAllowInvalid(true).build();
  sheet.getRange(2, 3, 500, 1).setDataValidation(stateRule);

  sheet.getRange(2, 19, 500, 1).setNumberFormat('dd/MM/yyyy HH:mm');

  _setColumnWidths(sheet, [130,120,140,200,150,100,110,100,80,110,80,130,130,130,80,200,100,150,140]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Session percakapan. Dikelola otomatis oleh n8n. awaiting_feedback = menunggu rating dari customer.');
}

// =====================================================================
// SHEET: Broadcasts
// =====================================================================
function _setupBroadcastsSheet(ss) {
  let sheet = ss.getSheetByName('Broadcasts');
  if (!sheet) sheet = ss.insertSheet('Broadcasts');
  sheet.clear();

  const headers = ['broadcast_id','message','status','recipients','sent_at','created_at'];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#990000');

  const statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['pending','sent','cancelled']).setAllowInvalid(false).build();
  sheet.getRange(2, 3, 100, 1).setDataValidation(statusRule);

  sheet.getRange(2, 5, 100, 2).setNumberFormat('dd/MM/yyyy HH:mm');

  const example = [['BC-001','Halo! Restoran Sasak Lombok buka hari ini. Promo GRATIS Es Kelapa Muda untuk setiap Ayam Taliwang! 🌶️','pending','',''  , new Date()]];
  sheet.getRange(2, 1, 1, headers.length).setValues(example);
  sheet.getRange(2, 1, 1, headers.length).setBackground('#fff2cc');

  const rules = [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$C2="pending"').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([sheet.getRange('A2:F100')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$C2="sent"').setBackground('#d9ead3').setFontColor('#274e13').setRanges([sheet.getRange('A2:F100')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$C2="cancelled"').setBackground('#f4cccc').setFontColor('#990000').setRanges([sheet.getRange('A2:F100')]).build(),
  ];
  sheet.setConditionalFormatRules(rules);

  _setColumnWidths(sheet, [100, 400, 90, 100, 140, 140]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Tulis pesan promo, set status=pending, lalu jalankan workflow Broadcast di n8n.');
}

// =====================================================================
// SHEET: Feedback (BARU)
// =====================================================================
function _setupFeedbackSheet(ss) {
  let sheet = ss.getSheetByName('Feedback');
  if (!sheet) sheet = ss.insertSheet('Feedback');
  sheet.clear();

  const headers = ['feedback_id','phone','customer_name','order_id','rating','comment','created_at'];
  const headerRow = sheet.getRange(1, 1, 1, headers.length);
  headerRow.setValues([headers]);
  _styleHeader(headerRow, '#134f5c');

  // Dropdown rating 1-5
  const ratingRule = SpreadsheetApp.newDataValidation().requireValueInList(['1','2','3','4','5']).setAllowInvalid(true).build();
  sheet.getRange(2, 5, 500, 1).setDataValidation(ratingRule);

  sheet.getRange(2, 7, 500, 1).setNumberFormat('dd/MM/yyyy HH:mm');

  // Conditional formatting berdasarkan rating
  const rules = [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$E2>="4"').setBackground('#d9ead3').setFontColor('#274e13').setRanges([sheet.getRange('A2:G500')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$E2="3"').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([sheet.getRange('A2:G500')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$E2<="2"').setBackground('#f4cccc').setFontColor('#990000').setRanges([sheet.getRange('A2:G500')]).build(),
  ];
  sheet.setConditionalFormatRules(rules);

  _setColumnWidths(sheet, [110, 130, 150, 110, 70, 300, 140]);
  _freezeAndProtectHeader(sheet);
  _addSheetNote(sheet, 'Rating & komentar dari pelanggan. Diisi otomatis oleh bot setelah customer membalas request feedback.');
}

// =====================================================================
// HELPERS
// =====================================================================
function _styleHeader(range, bgColor) {
  range.setBackground(bgColor).setFontColor('#ffffff').setFontWeight('bold').setFontSize(10).setHorizontalAlignment('center').setVerticalAlignment('middle');
  range.getSheet().setFrozenRows(1);
  range.getSheet().setRowHeight(1, 32);
}
function _setColumnWidths(sheet, widths) {
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
}
function _freezeAndProtectHeader(sheet) {
  sheet.setFrozenRows(1);
  const protection = sheet.getRange('1:1').protect().setDescription('Header');
  protection.setWarningOnly(true);
}
function _addSheetNote(sheet, note) {
  sheet.getRange('A1').setNote(note);
}
