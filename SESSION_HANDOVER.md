# Ringkasan Sesi & Serah Terima Proyek (Session Handover)

**Tanggal:** 10 Oktober 2026  
**Status Repositori:** Bersih & Ter-push ke `origin/main`  
**Deploy Live:** [https://absensigratis.vercel.app](https://absensigratis.vercel.app)

---

## 1. Commit Terbaru pada Sesi Ini

| Commit | Pesan Commit | Deskripsi |
|---|---|---|
| `55e086b` | `feat(admin): add official report sheet print/PDF modal, filtered CSV export, and interactive geofencing map calibration` | Lembar rekapitulasi cetak/PDF berstandar Kop Surat resmi SMAN 1 Teladan dengan blok tanda tangan, ekspor CSV UTF-8 BOM untuk Excel, filter multi-dimensi (kelas, tanggal, status), peta geofencing Leaflet interaktif dengan draggable pin, slider sinkron radius, dan kalibrasi GPS 1-klik. |
| `f5ae447` | `feat(telegram-consent): integrate live telegram bot simulation and UU PDP digital consent flow` | Simulator bot Telegram dengan histori tersimpan, pengiriman pesan presensi instan ke obrolan simulator, tombol uji 1-klik di modal penerbitan kode, formulir persetujuan digital UU PDP No. 27/2022 dengan fitur cabut izin, dan rekap status di profil siswa serta tabel admin. |
| `29a0056` | `feat(leave): polish student leave modal with instant file preview, 300KB validation, and lightbox` | Segmented control jenis izin/sakit, hitung durasi tanggal dinamis, dropzone berkas interaktif dengan validasi 300 KB seketika, preview card thumbnail/PDF, dan in-app lightbox modal untuk surat dokter. |
| `6c1b6dd` | `feat(admin): polish review queue, detailed verification modal, and approval sync with student status` | Modal detail verifikasi selfie & GPS di menu Tinjauan Admin, form catatan verifikasi, tombol keputusan Sah/Tolak, dan sinkronisasi status ke siswa. |
| `0e9a9c9` | `fix(ui): refactor status today boxes to stacked metric cards and prevent badge text wrapping` | Rombak kartu status presensi hari ini menjadi stacked metric card vertikal, tambah `white-space: nowrap` agar badge tidak terjepit atau peyang. |
| `8942bb2` | `feat(ui): polish student checkin modal flow, camera shutter, and geofencing animations` | Stepper pills 3-langkah aktif/selesai, efek tactile camera shutter flash, oval guide biometrik berpendar, transisi mulus peringatan luar radius, dan pop-up sukses presensi. |
| `c148543` | `feat(ui): execute plan 004 - clean dead code and consolidate motion tokens` | Bersihkan kode usang animasi login dan konsolidasi token gerak. |

---

## 2. Fitur yang Telah Selesai & Teruji End-to-End

### A. Alur Presensi Siswa (Check-in & Check-out)
- **Interactive Stepper Pills:** Indikator visual progres 1. Foto Wajah &rarr; 2. Lokasi GPS &rarr; 3. Konfirmasi Presensi yang otomatis tercentang hijau saat langkah terpenuhi.
- **Biometric Glow Face Guide:** Bingkai oval beranimasi breathing pulse untuk panduan posisi wajah.
- **Camera Shutter Flash:** Kilatan kamera (180ms) saat tombol *Ambil Foto* ditekan.
- **Geofencing Nir-Layout Pop:** Kotak peringatan di luar radius 100m berekspansi mulus menggunakan CSS Grid transisi saat GPS mendeteksi siswa di luar area.
- **Dialog Konfirmasi Sukses:** Pop-up centang beranimasi spring dengan rincian jam server resmi, jarak sekolah, dan status notifikasi bot Telegram ke wali.
- **Kartu Metrik Beranda Siswa:** Tata letak vertikal simetris, menampilkan jam besar (`20.42 WIB` atau `--:--`) dan badge pill status tanpa pemotongan teks.

### B. Alur Pengajuan Izin & Sakit Siswa (PRD FR-31 s/d FR-36)
- **Segmented Control Sakit/Izin:** Pilihan jenis izin beranimasi halus dengan petunjuk kontekstual otomatis.
- **Hitung Durasi Otomatis:** Perhitungan hari kalender dinamis (`.date-duration-pill`) saat memilih rentang tanggal.
- **Interactive File Dropzone:** Drag & drop atau klik berkas surat dokter / izin dengan feedback visual.
- **Validasi Klien 300 KB Seketika:** Memeriksa ukuran berkas secara instan sebelum kirim. Jika ukuran melebihi batas, dropzone memerah dan menampilkan peringatan tanpa merusak layout.
- **File Preview Card:** Menampilkan thumbnail gambar / ikon PDF, ukuran file KB, status siap unggah, dan tombol hapus berkas.
- **In-App Lightbox Modal:** Menggantikan `target="_blank"` eksternal dengan modal penampil berkas terintegrasi yang bersih untuk siswa dan admin, lengkap dengan tombol unduh berkas dan navigasi tombol Escape.

### C. Alur Simulator Bot Telegram & Penautan Wali (PRD FR-37 s/d FR-45)
- **Desain Otentik Chat Telegram:** Gelembung chat warna khas Telegram, stempel waktu, tanda centang ganda (`✓✓`), dan avatar bot.
- **Persistensi Riwayat Pesan:** Seluruh interaksi chat simulator kini tersimpan permanen di basis data lokal sehingga tidak terhapus saat modal ditutup.
- **Live Dispatch Notifikasi Presensi:** Ketika siswa melakukan absen Masuk/Pulang, notifikasi resmi otomatis dikirimkan dan langsung muncul di obrolan simulator bot orang tua/wali.
- **Tombol Uji Cepat Admin:** Pada dialog penerbitan kode 6-karakter admin, tersedia tombol *Salin Kode* dan *Uji di Simulator* yang otomatis mengisi `/start <KODE>` di simulator.
- **Chip Navigasi Cepat:** Tombol cepat `/start`, contoh kode, dan pembersih obrolan di bagian bawah chat.

### D. Formulir Persetujuan Digital Kepatuhan UU PDP (PRD FR-25 s/d FR-30a)
- **Checkbox Lingkup Terpisah (Granular Scope):** Izin kamera & geolokasi, izin notifikasi bot Telegram, dan izin vektor wajah biometrik (Rilis 2) dapat dipilih secara independen.
- **Deteksi Riwayat Persetujuan:** Menampilkan banner status persetujuan yang telah ditandatangani sebelumnya oleh orang tua/wali beserta tanggal pencatatan.
- **Hak Pencabutan Persetujuan (FR-30a):** Tombol *Cabut Izin* yang memungkinkan orang tua/wali membatalkan persetujuan pemrosesan data sewaktu-waktu.
- **Visibilitas Profil & Admin:** Rincian izin aktif ditampilkan transparan di menu Profil Siswa dan kolom status khusus di tabel Admin Orang Tua/Wali.

### E. Alur Antrean Tinjauan Admin (*Review Queue*)
- **Menu Tinjauan:** Mengumpulkan seluruh absensi di luar radius sekolah dan permohonan izin/sakit.
- **Modal Detail Verifikasi:** Menampilkan foto selfie resolusi penuh, identitas siswa, koordinat GPS, jarak meter, akurasi, dan alasan siswa.
- **Eksekusi Keputusan Admin:** Admin dapat memilih *Setujui (Hadir Sah)* atau *Tolak Presensi* disertai catatan verifikasi (dengan prompt alasan penolakan jika ditolak).
- **Sinkronisasi Otomatis:** Begitu disetujui admin, status di beranda dan riwayat siswa langsung berubah menjadi `Hadir Sah (Disetujui)` berwarna hijau beserta catatan resmi admin.

### F. Laporan Rekapitulasi Presensi & Cetak PDF Resmi (PRD FR-13 & FR-14)
- **Lembar Cetak Standar Instansi:** Dilengkapi Kop Surat resmi Pemerintah Daerah & Dinas Pendidikan, logo sekolah, nomor kontak, serta tabel absensi berformat formal.
- **Filter Multi-Dimensi Dinamis:** Filter kelas otomatis dari database siswa aktif, filter tanggal (Hari Ini, Bulan Ini, Semua Riwayat), dan status kehadiran.
- **Statistik & Persentase Sah Otomatis:** Ringkasan jumlah log, total hadir tepat waktu & disetujui, terlambat, serta persentase kehadiran sah.
- **Blok Tanda Tangan Ganda:** Mengetahui Wali Kelas / Pembina dan Kepala Sekolah lengkap dengan tempat NIP.
- **Ekspor CSV Kompatibel Excel:** Menyertakan UTF-8 BOM (`\uFEFF`) agar seluruh karakter dan teks bahasa Indonesia terbaca rapi tanpa karakter rusak di Microsoft Excel.

### G. Kalibrasi Peta Geofencing & Lokasi Sekolah (PRD FR-15 & FR-16)
- **Peta Interaktif Leaflet:** Marker pin gerbang sekolah yang dapat digeser (*draggable*) atau dipindahkan dengan klik langsung pada peta.
- **Radius Slider Sinkron:** Slider jangkauan toleransi (20m - 500m) yang langsung memperbesar/memperkecil lingkaran radius biru secara real-time di atas peta tanpa reload.
- **1-Klik Kalibrasi GPS:** Tombol *Gunakan GPS Saya* untuk mengambil koordinat riil perangkat admin saat berada di gerbang sekolah.
- **Desain Formulir Sistem:** Form controls terpadu dengan focus rings, labels, help text, dan feedback pesan validasi.

---

## 3. Langkah Selanjutnya

1. **Uji Coba Penggunaan Lapangan (Field Test Simulation):**
   - Validasi perilaku offline service worker saat jaringan terputus (PRD FR-46 s/d FR-50).
   - Pengujian live di peramban seluler (smartphone Android / iOS) via URL Vercel.
