# e-Absensi Sekolah (Aplikasi Absensi Otomatis)

Aplikasi Web Progressive (PWA) dan Dashboard Admin untuk pencatatan kehadiran siswa secara otomatis menggunakan **Selfie Wajib**, **Jam Resmi Server**, **Koordinat Geolokasi GPS (Haversine)**, dan **Notifikasi Telegram Bot**.

Sesuai dengan spesifikasi:
- Dokumen Desain: `design(3).md` (Arah visual Modern School / Trustworthy Blue)
- PRD: `PRD_Absensi_Otomatis_Revisi_Telegram.md` (Versi 1.1)

---

## Fitur Utama

### 1. Antarmuka Siswa (PWA Mobile-First)
- **Status Hari Ini & Jam Real-Time:** Menampilkan waktu server terkini, jam masuk sekolah, dan status absen masuk/pulang hari ini.
- **Selfie Wajib (FR-5):** Kamera depan (`getUserMedia`) dengan bingkai panduan posisi wajah (*face guide oval*), pratinjau foto, opsi ulangi, dan kompresi JPEG 480px (~50 KB) otomatis. Didukung simulator kamera cerdas untuk testing tanpa webcam fisik.
- **Validasi Radius GPS (FR-6 & FR-8):** Perhitungan jarak akurat menggunakan formula Haversine. Jika berada di luar radius sekolah (>100 m), absensi tetap dapat dikirim dengan kewajiban mengisi alasan yang masuk ke antrean tinjauan admin.
- **Jam Server Anti-Manipulasi (FR-7):** Waktu resmi ditentukan server, bukan jam internal perangkat siswa.
- **Deteksi Keterlambatan Otomatis (FR-9):** Status `on_time` atau `late` dihitung dari jam masuk sekolah + toleransi.
- **Mode Offline & Sinkronisasi Otomatis (FR-11):** Jika jaringan terputus, data absensi disimpan di antrean lokal dengan label *Terkirim Tertunda* dan otomatis disinkronkan saat koneksi online pulih.
- **Riwayat Absensi (FR-12):** Timeline riwayat lengkap dengan thumbnail selfie, jarak, koordinat, dan status.
- **Pengajuan Izin & Sakit (FR-31 s/d FR-36):** Formulir izin/sakit dengan rentang tanggal, keterangan, dan unggah surat dokter (maks 300 KB).

### 2. Dashboard Admin Sekolah (Desktop & Tablet)
- **Ringkasan Hari Ini:** Metrik total hadir, tepat waktu, terlambat, di luar area, dan belum absen.
- **Rekap & Log Absensi (FR-13 & FR-14):** Tabel lengkap dengan pencarian nama/NIS, filter kelas dan status, modal detail selfie & GPS, serta ekspor ke file CSV (Excel).
- **Antrean Tinjauan (Review Queue):** Tinjauan absensi luar radius dengan alasan siswa dan persetujuan/penolakan izin sakit.
- **Manajemen Siswa & Kelas (FR-1 s/d FR-3):** Tambah siswa manual dan fitur impor massal CSV.
- **Pengelolaan Orang Tua & Penautan Telegram (FR-44 & FR-45):** Pembuatan kode penautan unik 6-karakter (berlaku 24 jam, sekali pakai), status penautan, dan pemutusan tautan dengan catatan audit.
- **Antrean Notifikasi Telegram (FR-37 s/d FR-43):** Log status pengiriman per penerima (`queued`, `sent`, `failed`, `unlinked`), tombol eksekusi worker (maks 3 kali percobaan ulang), dan simulator interaktif bot Telegram.
- **Persetujuan Digital UU PDP (FR-25 s/d FR-30a):** Formulir persetujuan digital orang tua dengan checkbox terpisah (kamera/lokasi, notifikasi Telegram, data wajah Rilis 2).
- **Pengaturan Lokasi & Peta Leaflet (FR-15 & FR-16):** Pengaturan titik koordinat sekolah, radius meter, jam masuk/pulang, dan peta interaktif OpenStreetMap.

---

## Cara Menjalankan Aplikasi

Aplikasi dibangun dengan arsitektur ringan tanpa dependensi pihak ketiga yang rumit:

```bash
# 1. Jalankan server lokal
npm start
# atau
node server.js
```

Akses aplikasi di browser:
**[http://localhost:3000](http://localhost:3000)**

---

## Toolbar Simulasi & Akun Demo

Pada bagian atas halaman aplikasi, tersedia **Toolbar Pengujian** untuk memudahkan demonstrasi fitur:
- **Pengganti Peran:** Beralih cepat antara **Siswa (PWA)** dan **Admin Sekolah**.
- **Pilihan Siswa Demo:** 
  - Budi Santoso (NIS: 1024, XII-IPA-1)
  - Siti Rahma (NIS: 1025, XII-IPA-1)
  - Ahmad Fauzi (NIS: 1026, XII-IPS-2)
- **Mode GPS:** 
  - *Di Sekolah (Radius Aman 15m)*
  - *Di Luar Radius (1.5 km)*
  - *Akurasi Rendah (>50m)*
  - *GPS Perangkat Nyata*
- **Simulasi Offline:** Centang opsi ini untuk menguji antrean offline (FR-11) dan lepas centang untuk melihat sinkronisasi otomatis.
- **Simulator Bot Telegram:** Buka jendela obrolan simulasi Telegram untuk mencoba menautkan akun wali dengan kode 6-karakter atau `/start <kode>`.

---

## Skema Basis Data (Supabase / PostgreSQL)

Skema database produksi lengkap tersedia di file:
`supabase_schema.sql`

Memuat DDL tabel:
- `profiles`
- `sites`
- `attendance` (dengan indeks unik 1 check-in dan 1 check-out per hari)
- `settings`
- `student_guardians`
- `telegram_link_codes`
- `consents`
- `leave_requests`
- `notification_queue`
- Fungsi SQL `calculate_distance(lat1, lon1, lat2, lon2)` (Haversine Formula)
- Aturan Keamanan Baris (*Row Level Security / RLS Policies*)
