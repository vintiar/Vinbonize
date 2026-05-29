# Vinbonize — Tools Manajemen Restoran Sasak Lombok

Google Apps Script yang dipasang di Google Spreadsheet restoran untuk memudahkan pengelolaan pesanan, reservasi, dan menu.

## Fitur

- **Menu Custom di Spreadsheet** — Tab "Restoran" dengan tombol-tombol aksi
- **Update Status Pesanan** — Klik satu tombol untuk tandai pesanan selesai/batal
- **Export Laporan** — Generate laporan harian/mingguan ke Google Docs
- **Notifikasi WA** — Kirim notif ke dapur/owner langsung dari spreadsheet
- **Format Otomatis** — Warna baris berdasarkan status pesanan

## Setup

1. Buka Google Spreadsheet yang dipakai untuk n8n-autochat
2. **Extensions → Apps Script**
3. Salin semua kode dari `src/Code.gs` ke editor
4. Salin kode dari `src/Config.gs` dan isi konfigurasi
5. **Save** lalu **Run → `onOpen`** (izinkan akses saat diminta)
6. Refresh spreadsheet — akan muncul menu **"Restoran"** di toolbar

## Menu di Spreadsheet

```
Restoran
├── Pesanan
│   ├── Tandai Selesai (baris terpilih)
│   ├── Tandai Dibatalkan
│   └── Tandai Semua Hari Ini Selesai
├── Laporan
│   ├── Laporan Harian
│   └── Laporan Mingguan
└── Utilitas
    ├── Format Ulang Semua Sheet
    └── Hapus Session Lama (>30 hari)
```
