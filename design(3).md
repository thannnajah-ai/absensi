# DESIGN.md --- Aplikasi Absensi Otomatis

**Versi:** 1.0\
**Berdasarkan:** PRD Aplikasi Absensi Otomatis (Selfie + Jam + Lokasi),
revisi kanal notifikasi Telegram\
**Status:** Usulan arah visual dan interaksi --- siap menjadi acuan
desain UI/UX

------------------------------------------------------------------------

## 1. Tujuan Desain

Desain harus membuat siswa bisa melakukan absensi masuk atau pulang
dengan cepat, jelas, dan minim kesalahan, sementara admin dapat memantau
data dalam jumlah besar tanpa kehilangan konteks. Antarmuka harus terasa
tepercaya, ramah untuk penggunaan harian di sekolah, dan tetap ringan
pada perangkat kelas menengah.

### Prinsip utama

1.  **Absensi adalah aksi utama.** Tombol masuk/pulang harus langsung
    terlihat di beranda siswa.
2.  **Status tidak boleh ambigu.** Bedakan status hadir, terlambat, di
    luar area, terkirim tertunda, dan menunggu tinjauan dengan teks plus
    ikon---jangan hanya mengandalkan warna.
3.  **Berikan umpan balik di setiap tahap.** Jelaskan status kamera,
    lokasi, pengiriman, dan hasil simpan.
4.  **Jangan menghukum siswa karena masalah notifikasi.** Gangguan
    Telegram tidak boleh menghalangi absensi.
5.  **Privasi terlihat sejak desain.** Jangan menampilkan lokasi detail
    atau selfie pada notifikasi Telegram. Batasi informasi sensitif pada
    halaman yang memang berwenang mengaksesnya.
6.  **Utamakan layar ponsel.** Siswa paling mungkin menggunakan PWA di
    ponsel; admin mendapat layout desktop yang efisien dan tetap usable
    di tablet.
7.  **Animasi membantu pemahaman.** Gunakan gerakan singkat sebagai
    penanda transisi dan status, bukan dekorasi yang memperlambat alur.

------------------------------------------------------------------------

## 2. Konsep Desain Terpilih: A — Modern School / Trustworthy Blue

**Status keputusan: DISETUJUI.** Seluruh layar menggunakan arah visual Modern School / Trustworthy Blue. Gaya ini bersih, modern, profesional, tenang, dan mudah dipercaya. Tampilan siswa dibuat ramah dan sederhana, sedangkan dashboard admin menggunakan kepadatan informasi yang lebih tinggi tanpa mengubah identitas visual.

### Karakter visual yang wajib dipertahankan

- **Warna utama:** biru untuk navigasi, tombol utama, tautan, dan elemen aktif.
- **Warna pendamping:** biru muda untuk informasi; hijau untuk sukses; amber untuk peringatan; merah untuk kesalahan atau tindakan berisiko.
- **Permukaan:** latar abu-abu kebiruan sangat muda, kartu putih, dan garis pembatas tipis.
- **Bentuk:** kartu dengan radius 14–18 px dan tombol dengan radius 12–14 px.
- **Tipografi:** Inter sebagai pilihan utama, dengan Plus Jakarta Sans atau system font sebagai fallback.
- **Ikon:** satu keluarga ikon garis yang konsisten dan mudah dikenali.
- **Ilustrasi:** digunakan seperlunya pada keadaan kosong, panduan izin, atau hasil berhasil; bukan sebagai dekorasi pada setiap kartu.
- **Dashboard admin:** tetap memakai konsep A, dengan tabel dan filter yang lebih padat agar data mudah dipindai.

### Keputusan desain

Opsi B dan C tidak digunakan sebagai tema terpisah. Nuansa ramah untuk siswa diterapkan melalui bahasa yang hangat, ilustrasi terbatas, dan micro-interaction yang halus. Kepadatan informasi dari dashboard utilitarian diterapkan khusus pada area admin. Semua layar harus terasa sebagai satu produk yang konsisten.

---

## 3. Sistem Visual

### 3.1 Palet warna awal

Warna berikut adalah titik awal, bukan aturan merek yang final.
Sesuaikan dengan identitas sekolah setelah logo dan warna resmi
tersedia.

  Token              Warna       Penggunaan
  ------------------ ----------- ------------------------------------
  `primary-700`      `#1D4ED8`   Tombol utama, tautan, elemen aktif
  `primary-900`      `#1E3A8A`   Heading/nav tertentu, fokus visual
  `primary-50`       `#EFF6FF`   Latar kartu informasi
  `background`       `#F8FAFC`   Latar utama
  `surface`          `#FFFFFF`   Kartu, dialog, panel
  `text-primary`     `#0F172A`   Teks utama
  `text-secondary`   `#475569`   Keterangan dan metadata
  `border`           `#E2E8F0`   Garis pembatas
  `success`          `#15803D`   Berhasil/tepat waktu
  `warning`          `#B45309`   Terlambat/perlu perhatian
  `danger`           `#B91C1C`   Error atau aksi berisiko
  `info`             `#0369A1`   Informasi dan status proses

**Aturan warna:** - Pasangkan warna status dengan teks dan ikon,
misalnya ikon centang + "Absensi berhasil". - Jangan memakai hijau/merah
sebagai satu-satunya pembeda. - Pastikan teks kecil dan tombol memenuhi
kontras aksesibilitas. - Hindari warna neon, gradien berat, dan banyak
warna aksen sekaligus.

### 3.2 Tipografi

-   Gunakan **Inter**, **Plus Jakarta Sans**, atau font sistem yang
    tersedia.
-   Ukuran teks isi pada ponsel: 16 px sebagai default yang nyaman.
-   Label dan metadata: idealnya 12--14 px, tetapi jangan mengecilkan
    teks penting.
-   Heading berjenjang jelas: judul halaman, judul kartu, lalu
    keterangan.
-   Gunakan angka tabular untuk jam, jumlah hadir, dan statistik agar
    tidak tampak bergeser saat berubah.

### 3.3 Grid, jarak, dan bentuk

-   Sistem jarak berbasis kelipatan 4 px.
-   Padding halaman ponsel: 16--20 px.
-   Jarak antarkartu: 12--16 px.
-   Radius kartu: 16 px; radius input: 10--12 px.
-   Tinggi target sentuh minimal 44--48 px.
-   Lebar konten desktop dibatasi agar tabel dan teks tidak melebar
    tanpa kendali.
-   Gunakan bayangan tipis hanya untuk membedakan lapisan; garis
    pembatas lebih diutamakan daripada bayangan berat.

### 3.4 Ikon dan ilustrasi

-   Gunakan satu keluarga ikon garis yang konsisten.
-   Ikon kamera, lokasi, jam, riwayat, notifikasi, dan pengaturan harus
    mudah dikenali.
-   Hindari ikon dekoratif yang tidak menambah makna.
-   Ilustrasi hanya untuk keadaan kosong, panduan izin kamera/lokasi,
    dan pesan berhasil---bukan untuk memenuhi setiap kartu.

------------------------------------------------------------------------

## 4. Struktur Navigasi

### Siswa --- PWA mobile-first

Navigasi utama yang disarankan:

1.  **Beranda** --- status hari ini dan aksi absensi.
2.  **Riwayat** --- daftar absensi dan detail.
3.  **Izin & Sakit** --- ajukan dan lihat status permohonan.
4.  **Profil** --- informasi akun dan bantuan.

Gunakan bottom navigation pada ponsel. Letakkan tombol utama absensi di
area atas beranda dan jangan menyembunyikannya di menu.

### Admin --- dashboard responsif

Navigasi sisi kiri pada desktop dan drawer pada tablet/mobile:

-   Ringkasan
-   Rekap Absensi
-   Tinjauan
-   Siswa & Kelas
-   Orang Tua/Wali
-   Persetujuan Data
-   Notifikasi Telegram
-   Lokasi & Jadwal
-   Pengaturan

Menu "Tinjauan" mengumpulkan absensi di luar radius, koreksi manual, dan
kasus lain yang memerlukan keputusan admin. Beri badge jumlah item yang
menunggu tindakan.

### Orang tua/wali

PRD tidak mensyaratkan akun aplikasi sekolah bagi wali. Karena itu,
pengalaman wali berpusat pada bot Telegram: memulai bot, memasukkan kode
penautan, dan menerima log absensi. Halaman web persetujuan digital
tetap menjadi alur terpisah dan harus menjelaskan tujuan pemrosesan data
secara jelas.

------------------------------------------------------------------------

## 5. Rekomendasi Layar dan Komponen

### 5.1 Beranda siswa

Urutan konten:

1.  Sapaan singkat, nama siswa, kelas, dan tanggal.
2.  Kartu "Status hari ini" dengan status masuk/pulang.
3.  Tombol **Absen Masuk** dan **Absen Pulang** yang besar.
4.  Ringkasan jam masuk, status terlambat, dan status lokasi bila
    relevan.
5.  Riwayat terbaru dan tautan "Lihat semua".

Tombol absensi harus menunjukkan state: - **Siap** --- aksi dapat
dimulai. - **Memproses** --- aksi sedang berlangsung, tombol dikunci
untuk mencegah klik ganda. - **Berhasil** --- server sudah menyimpan
absensi. - **Terkirim tertunda** --- tersimpan di antrean offline;
jangan menampilkan seolah-olah sudah tercatat server. - **Perlu
tindakan** --- misalnya izin kamera/lokasi belum diberikan.

Jangan membuat status "Telegram gagal" menjadi alarm utama siswa. Bila
perlu, jelaskan secara sekunder bahwa absensi sudah tersimpan tetapi
notifikasi wali belum terkirim.

### 5.2 Alur kamera dan selfie

-   Tampilkan pratinjau kamera depan dengan bingkai sederhana dan
    instruksi singkat.
-   Letakkan status kamera dan lokasi dalam panel yang terpisah.
-   Tombol "Ambil selfie" terlihat jelas; setelah foto diambil,
    tampilkan pratinjau dengan pilihan "Ulangi" dan "Gunakan foto".
-   Tombol "Kirim absensi" baru aktif setelah selfie tersedia dan lokasi
    berhasil didapatkan.
-   Jika lokasi di luar radius, tampilkan jarak dan kolom alasan wajib
    tanpa menyembunyikan tombol kirim.
-   Jangan gunakan countdown yang menekan pengguna kecuali memang
    diperlukan; PRD tidak mensyaratkan timer selfie.
-   Saat pengiriman, gunakan indikator progres yang tenang. Setelah
    sukses, tampilkan waktu dari server.

### 5.3 Status lokasi

Tampilkan status sebagai teks yang mudah dimengerti: - "Lokasi
ditemukan" - "Akurasi lokasi rendah --- coba lagi" - "Di luar radius
sekolah --- tulis alasan untuk melanjutkan" - "Izin lokasi belum aktif"

Jangan menjanjikan GPS selalu akurat. Sertakan tombol "Coba lagi" dan
panduan singkat untuk mengaktifkan izin lokasi. Peta detail dapat
ditempatkan di halaman riwayat/detail, bukan memenuhi layar absensi.

### 5.4 Riwayat siswa

-   Gunakan daftar/timeline berdasarkan tanggal.
-   Setiap item menampilkan tanggal, jenis masuk/pulang, waktu server,
    status, dan penanda bila dikirim tertunda atau ditinjau admin.
-   Detail dapat memuat peta mini dan thumbnail selfie sesuai kebijakan
    akses serta retensi.
-   Filter tanggal/status sederhana; hindari grafik besar yang tidak
    membantu siswa.

### 5.5 Dashboard admin

Bagian atas: - Total hadir - Tepat waktu - Terlambat - Belum tercatat -
Perlu tinjauan

Bagian berikut: - Grafik ringkas tren harian bila berguna. - Tabel
absensi terbaru dengan filter tanggal, kelas, siswa, dan status. - Panel
"Perlu ditinjau" untuk absensi luar area dan koreksi manual.

Tabel harus memiliki pencarian, sorting, pagination, header yang jelas,
dan aksi yang konsisten. Pada layar kecil, ubah setiap baris menjadi
kartu ringkas atau sediakan tampilan tabel yang bisa digulir horizontal
dengan indikator yang jelas.

### 5.6 Pengelolaan wali dan Telegram

Tampilkan: - Nama wali dan siswa terkait. - Status persetujuan
notifikasi secara terpisah dari status Telegram. - Status tautan: belum
ditautkan, tertaut, dilepas, atau perlu tindakan. - Waktu penerbitan dan
kedaluwarsa kode; jangan tampilkan kode lama yang sudah digunakan. -
Tombol "Terbitkan kode baru" dengan dialog konfirmasi. - Tombol
"Putuskan tautan" hanya untuk admin, disertai verifikasi dan
alasan/audit.

Gunakan indikator pengiriman per penerima pada halaman log notifikasi.
Jangan menampilkan token bot, kode mentah yang sudah kedaluwarsa,
selfie, atau koordinat GPS di halaman notifikasi Telegram.

### 5.7 Halaman persetujuan digital

-   Bahasa sederhana, jelas, dan tidak memaksa.
-   Jelaskan data apa yang dikumpulkan, tujuan, masa retensi, siapa yang
    dapat mengakses, serta cara menarik persetujuan.
-   Pisahkan pilihan berdasarkan tujuan sebagaimana PRD: kamera/lokasi
    untuk absensi, notifikasi Telegram, dan data wajah untuk Rilis 2.
-   Tampilkan versi teks persetujuan dan waktu pengiriman/persetujuan.
-   Jangan menganggap penautan Telegram sebagai bukti persetujuan.

------------------------------------------------------------------------

## 6. Sistem Status

Gunakan label dan ikon secara konsisten di seluruh aplikasi.

  -----------------------------------------------------------------------
  Status                  Label yang disarankan   Visual
  ----------------------- ----------------------- -----------------------
  `on_time`               Tepat waktu             Ikon centang, hijau

  `late`                  Terlambat               Ikon jam, amber

  `outside_area`          Di luar area            Ikon lokasi, amber

  `pending`               Menunggu tinjauan       Ikon jam pasir, amber

  `approved`              Disetujui               Ikon centang, hijau

  `rejected`              Ditolak                 Ikon silang, merah

  Offline queue           Terkirim tertunda /     Ikon sinkronisasi, biru
                          Menunggu koneksi        

  Notification `queued`   Menunggu dikirim        Ikon antrean, netral

  Notification `sent`     Terkirim                Ikon centang, hijau

  Notification `failed`   Gagal dikirim           Ikon peringatan, merah

  Notification `unlinked` Akun tidak tertaut      Ikon putus tautan,
                                                  netral
  -----------------------------------------------------------------------

Warna di atas adalah petunjuk, bukan satu-satunya pembeda. Label harus
selalu ditampilkan, termasuk dalam tabel dan tampilan mobile.

------------------------------------------------------------------------

## 7. Bahasa dan Microcopy

Gunakan Bahasa Indonesia yang singkat, tidak menyalahkan, dan
menjelaskan langkah berikutnya.

**Contoh yang disarankan:** - "Mengambil lokasi..." - "Lokasi ditemukan.
Akurasi sekitar 18 meter." - "Kamu berada di luar radius sekolah. Isi
alasan untuk melanjutkan." - "Absensi berhasil disimpan pada 07.02
WIB." - "Koneksi terputus. Absensi disimpan sementara dan akan dicoba
lagi saat online." - "Absensi sudah tersimpan. Notifikasi Telegram
kepada wali masih menunggu pengiriman." - "Kode penautan kedaluwarsa.
Minta admin menerbitkan kode baru." - "Kamera belum diizinkan. Aktifkan
izin kamera di pengaturan browser, lalu coba lagi."

Hindari pesan seperti "Gagal!" tanpa menjelaskan penyebab atau tindakan
yang bisa dilakukan.

------------------------------------------------------------------------

## 8. Sistem Animasi dan Motion Design

### 8.1 Prinsip

-   Animasi harus menginformasikan perubahan status, membantu fokus,
    atau memberi konfirmasi.
-   Gerakan singkat dan konsisten; jangan menunda aksi utama untuk
    animasi.
-   Hindari animasi berulang yang tidak memiliki fungsi, parallax, latar
    bergerak, efek 3D berat, atau confetti setiap kali absensi.
-   Hormati preferensi `prefers-reduced-motion`; sediakan versi minim
    gerak.
-   Jangan memakai animasi sebagai satu-satunya cara menjelaskan status.

### 8.2 Durasi dan easing

  ------------------------------------------------------------------------
  Token                                  Durasi awal Penggunaan
  --------------------- ---------------------------- ---------------------
  `motion-fast`                          120--160 ms Hover, pressed,
                                                     perubahan ikon

  `motion-standard`                      180--240 ms Dropdown, tab, kartu,
                                                     toast

  `motion-emphasis`                      260--320 ms Dialog, panel detail

  `motion-loading`               Tidak mengunci aksi Spinner/progress saat
                                                     proses jaringan
  ------------------------------------------------------------------------

Gunakan easing masuk/keluar yang lembut, misalnya `ease-out` untuk
elemen masuk dan `ease-in-out` untuk perubahan state. Nilai ini
merupakan rekomendasi awal dan perlu diuji di perangkat nyata.

### 8.3 Animasi yang disarankan

1.  **Tombol ditekan:** sedikit perubahan skala atau warna selama
    120--160 ms. Hindari efek memantul besar.
2.  **Kartu status muncul:** opacity + pergeseran vertikal kecil 4--8
    px, sekitar 180--220 ms.
3.  **Kamera siap:** frame kamera muncul dengan fade singkat; indikator
    kamera aktif berubah secara halus.
4.  **Lokasi sedang dicari:** ikon lokasi berputar/berdenyut secara
    terbatas disertai teks "Mengambil lokasi...". Hentikan animasi
    begitu selesai atau gagal.
5.  **Absensi berhasil:** ikon centang digambar/berubah dengan transisi
    singkat dan teks konfirmasi. Hindari confetti besar agar aplikasi
    tetap terasa tepercaya.
6.  **Pengiriman tertunda:** ikon sinkronisasi bergerak hanya ketika
    proses benar-benar sedang mencoba sinkronisasi; jika antrean
    menunggu koneksi, tampilkan status statis.
7.  **Toast notifikasi:** masuk dari atas atau bawah dengan fade/slide
    kecil, lalu hilang otomatis setelah durasi yang cukup untuk dibaca.
    Pesan kritis tetap dapat ditutup manual.
8.  **Modal konfirmasi admin:** fade dan scale kecil; tombol berbahaya
    tidak boleh beranimasi mencolok.
9.  **Filter tabel admin:** perubahan hasil menggunakan fade sangat
    ringan atau tanpa animasi untuk menjaga pemindaian data.
10. **Navigasi halaman:** transisi fade singkat; jangan memakai
    perpindahan horizontal besar yang terasa lambat.

### 8.4 Animasi yang sebaiknya dihindari

-   Countdown wajib sebelum foto diambil.
-   Animasi panjang yang membuat pengguna menunggu setelah absensi
    berhasil.
-   Efek confetti atau suara keras pada setiap check-in/check-out.
-   Animasi peta terus-menerus.
-   Indikator loading palsu ketika aplikasi sebenarnya tidak sedang
    memproses.
-   Memindahkan tombol utama ketika layar berubah.
-   Menggunakan warna berkedip untuk status terlambat atau di luar area.

### 8.5 Reduced motion dan performa

Jika pengguna mengaktifkan pengurangan gerakan: - Ganti slide/scale
dengan perubahan opacity sederhana atau perubahan state langsung. -
Hentikan animasi dekoratif berulang. - Pertahankan indikator proses yang
jelas melalui teks dan ikon statis. - Animasi sebaiknya menggunakan
`transform` dan `opacity` agar lebih ringan. - Jangan memuat video latar
atau animasi besar pada layar absensi.

------------------------------------------------------------------------

## 9. Responsive Design

### Ponsel

-   Satu kolom, padding 16--20 px.
-   Tombol utama selebar kontainer.
-   Bottom navigation untuk area siswa.
-   Kamera dan status lokasi harus terlihat tanpa scroll berlebihan.
-   Gunakan safe-area inset agar tombol tidak tertutup area sistem
    perangkat.

### Tablet

-   Siswa tetap menggunakan layout satu kolom yang lega.
-   Admin dapat menggunakan sidebar yang bisa ditutup dan tabel yang
    lebih ringkas.

### Desktop

-   Admin memakai sidebar tetap, toolbar filter, kartu metrik, dan
    tabel.
-   Batasi lebar panel formulir agar mudah dibaca.
-   Jangan memperbesar semua elemen mobile secara proporsional;
    manfaatkan ruang untuk informasi yang relevan.

------------------------------------------------------------------------

## 10. Aksesibilitas dan Kejelasan

-   Target sentuh minimal 44 × 44 px.
-   Semua input memiliki label yang jelas.
-   Fokus keyboard terlihat; jangan menghilangkan outline tanpa
    pengganti.
-   Status disampaikan lewat teks, ikon, dan warna.
-   Error ditempatkan dekat dengan komponen yang bermasalah.
-   Dialog dapat ditutup dengan cara yang wajar dan tidak kehilangan
    data tanpa peringatan.
-   Jangan mengandalkan hover untuk fungsi penting.
-   Pastikan kontras warna, zoom browser, dan ukuran teks diuji.
-   Pengguna harus dapat memahami status absensi tanpa melihat animasi.

------------------------------------------------------------------------

## 11. Komponen UI yang Perlu Distandardisasi

-   Button: primary, secondary, outline, danger, disabled, loading.
-   Status badge: hadir, terlambat, luar area, tertunda, pending,
    disetujui, ditolak.
-   Camera preview dan selfie preview.
-   Location status card.
-   Attendance summary card.
-   History row / history card.
-   Admin metric card.
-   Filter bar dan search input.
-   Data table, pagination, empty state.
-   Confirmation dialog.
-   Toast/inline alert.
-   Consent scope card.
-   Telegram link status card.
-   Notification delivery log row.
-   Loading skeleton untuk data dashboard.
-   Empty state dengan instruksi tindakan berikutnya.

------------------------------------------------------------------------

## 12. Keadaan Kosong, Error, dan Loading

Setiap halaman utama harus memiliki desain untuk tiga keadaan tersebut,
bukan hanya tampilan normal.

-   **Kosong:** jelaskan mengapa belum ada data dan tindakan yang
    tersedia.
-   **Loading:** gunakan skeleton hanya untuk area data; untuk aksi
    absensi gunakan status proses yang eksplisit.
-   **Error:** jelaskan apakah data sudah tersimpan atau belum, lalu
    berikan tindakan berikutnya.
-   **Offline:** tampilkan indikator koneksi yang tidak menutupi tombol;
    bedakan antrean lokal dari absensi yang sudah diterima server.
-   **Sebagian berhasil:** misalnya absensi tersimpan tetapi notifikasi
    Telegram gagal---tampilkan kedua status secara terpisah.

------------------------------------------------------------------------

## 13. Konsistensi dengan PRD

Desain tidak boleh mengubah aturan produk berikut:

-   Selfie dan lokasi wajib untuk alur absensi sesuai PRD; jika izin
    kamera/lokasi tidak tersedia, jelaskan penyebabnya.
-   Waktu resmi berasal dari server, bukan jam perangkat.
-   Absensi di luar radius tetap dapat dikirim dengan alasan wajib dan
    masuk tinjauan admin.
-   Absensi tetap disimpan ketika Telegram tidak tertaut atau gagal.
-   Telegram menerima nama siswa, jenis absensi, waktu server, tanggal,
    status, dan nama sekolah; foto selfie dan koordinat GPS tidak
    dikirim.
-   Persetujuan pemrosesan data terpisah dari proses penautan Telegram.
-   Penautan Telegram menggunakan kode unik yang berlaku 24 jam dan
    sekali pakai.
-   Pengenalan wajah hanya untuk Rilis 2; jangan menampilkan fitur
    seolah-olah tersedia di MVP.
-   Retensi, akses, dan penghapusan data harus mengikuti kebijakan yang
    ditetapkan sekolah.

------------------------------------------------------------------------

## 13A. Wireframe Acuan untuk Layar Utama

Bagian ini menjadi acuan awal sebelum implementasi UI. Wireframe bersifat struktural; teks, logo, data, dan identitas sekolah dapat disesuaikan, tetapi urutan aksi dan aturan absensi dari PRD tidak boleh berubah.

### A. Beranda siswa — mobile/PWA

```text
┌────────────────────────────────┐
│ Logo sekolah       Notifikasi  │
│ Halo, [Nama Siswa]             │
│ [Kelas] · [Tanggal]            │
├────────────────────────────────┤
│ STATUS HARI INI                │
│ Masuk     [Belum absen / 07:12]│
│ Pulang    [Belum absen / 15:00]│
│ [Badge status dengan ikon]     │
├────────────────────────────────┤
│ [      ABSEN MASUK          ]  │
│ [      ABSEN PULANG         ]  │
├────────────────────────────────┤
│ Ringkasan                      │
│ Jam masuk · Ketepatan waktu    │
│ Status lokasi (bila relevan)   │
├────────────────────────────────┤
│ Riwayat terbaru   [Lihat semua]│
│ [Tanggal] [Masuk/Pulang] [Jam] │
├────────────────────────────────┤
│ Beranda   Riwayat   Izin   Profil│
└────────────────────────────────┘
```

**Prioritas:** tombol absensi harus terlihat tanpa pengguna perlu mencari menu. Jika aksi belum tersedia, tampilkan alasan yang jelas. Navigasi bawah tidak boleh menutupi tombol atau konten ketika keyboard terbuka.

### B. Alur selfie dan lokasi

```text
┌────────────────────────────────┐
│ ← Absensi Masuk                │
│ Langkah 1 dari 3: Selfie       │
│ [Selfie]  ── [Lokasi] ── [Kirim]│
├────────────────────────────────┤
│                                │
│       Pratinjau kamera         │
│       [Panduan posisi wajah]   │
│                                │
│ [Ambil selfie]                 │
│ Setelah diambil: [Ulangi]      │
│                  [Gunakan foto]│
├────────────────────────────────┤
│ STATUS LOKASI                  │
│ [Meminta lokasi / Terdeteksi]  │
│ [Dalam radius / Di luar radius]│
│ Jika di luar radius:           │
│ [Alasan wajib................] │
├────────────────────────────────┤
│ [       Kirim Absensi       ]  │
└────────────────────────────────┘
```

**Aturan:** tampilkan status kamera dan lokasi secara terpisah. Jangan mengklaim absensi berhasil sebelum server mengonfirmasi penyimpanan. Jika di luar radius, izinkan pengiriman dengan alasan wajib dan tandai untuk tinjauan admin sesuai PRD.

### C. Konfirmasi hasil absensi

```text
┌────────────────────────────────┐
│          [Ikon centang]        │
│       Absensi berhasil         │
│       Masuk · [Jam server]     │
│       [Tanggal]                │
├────────────────────────────────┤
│ Lokasi: [Status lokasi]        │
│ Catatan: [Status tinjauan jika │
│           diperlukan]          │
├────────────────────────────────┤
│ Notifikasi wali: [Terkirim /   │
│ Belum terkirim / Tidak tertaut]│
│ Status notifikasi terpisah dari│
│ status penyimpanan absensi.    │
├────────────────────────────────┤
│ [      Kembali ke Beranda   ]  │
└────────────────────────────────┘
```

Animasi sukses hanya berjalan setelah status penyimpanan terkonfirmasi. Jika notifikasi Telegram gagal, pertahankan status absensi yang benar dan jelaskan kegagalan notifikasi secara sekunder.

### D. Pengaitan Telegram untuk wali

```text
┌────────────────────────────────┐
│ Hubungkan Telegram             │
│ 1. Buka bot dan tekan Start    │
│ 2. Masukkan kode unik          │
│ [ Kode penautan............. ] │
│ [ Hubungkan akun ]             │
├────────────────────────────────┤
│ Kode berlaku 24 jam dan hanya  │
│ dapat digunakan sekali.        │
│ [Minta kode baru jika kedaluwarsa]│
└────────────────────────────────┘
```

Tampilkan status tertaut, belum tertaut, kode kedaluwarsa, dan kegagalan dengan teks serta ikon. Persetujuan pemrosesan data tetap merupakan alur terpisah dari penautan Telegram.

### E. Dashboard admin

```text
┌──────────────┬──────────────────────────────────────┐
│ e-Absensi    │ Ringkasan             [Tanggal/filter]│
│ Beranda      ├──────────────────────────────────────┤
│ Rekap        │ [Total] [Hadir] [Terlambat] [Tinjauan]│
│ Tinjauan     ├──────────────────────────────────────┤
│ Siswa/Kelas  │ Grafik ringkasan dan tren absensi     │
│ Orang Tua    ├──────────────────────────────────────┤
│ Persetujuan  │ Tabel absensi terbaru                 │
│ Telegram     │ Cari · Filter kelas · Status · Ekspor │
│ Lokasi/Jadwal├──────────────────────────────────────┤
│ Pengaturan   │ Status pengiriman Telegram            │
└──────────────┴──────────────────────────────────────┘
```

Dashboard harus mengutamakan pemindaian data, filter yang jelas, status yang konsisten, dan akses cepat ke item yang perlu ditinjau. Pada layar sempit, sidebar berubah menjadi drawer dan tabel menyediakan pola responsif yang tetap bisa digunakan.

---

## 13B. Sistem Animasi dan Micro-interaction — Semua Animasi yang Disetujui

**Keputusan: seluruh animasi yang tercantum di bawah ini termasuk dalam spesifikasi desain.** Terapkan hanya ketika membantu pengguna memahami perubahan status atau memberi umpan balik. Animasi tidak boleh menghalangi absensi, menunda penyimpanan, atau menjadi satu-satunya cara untuk menyampaikan status.

### Token durasi dan gerakan

| Token | Durasi | Penggunaan |
|---|---:|---|
| `motion-fast` | 120–160 ms | Tekan tombol, perubahan ikon, toggle |
| `motion-standard` | 180–240 ms | Toast, dropdown, tab, perubahan status |
| `motion-emphasis` | 260–320 ms | Modal, transisi langkah, konfirmasi sukses |
| `motion-loop` | Berulang, hemat gerak | Spinner/progres saat proses benar-benar berlangsung |

Gunakan easing lembut seperti `ease-out` untuk elemen masuk dan `ease-in-out` untuk perubahan posisi. Hindari efek pantulan berlebihan, zoom besar, parallax, animasi dekoratif terus-menerus, dan confetti yang mengganggu.

### Daftar animasi wajib

| Interaksi | Perilaku animasi | Ketentuan |
|---|---|---|
| Tombol ditekan | Sedikit mengecil (sekitar 0,98), lalu kembali | 120–160 ms; tetap jelas untuk keyboard dan sentuhan |
| Tombol loading | Ikon spinner dan label berubah menjadi “Memproses…” | Tombol dinonaktifkan agar tidak terjadi klik ganda |
| Perpindahan halaman | Fade singkat disertai gerak vertikal kecil | 180–240 ms; jangan membuat navigasi terasa lambat |
| Kartu dan daftar masuk | Fade-in dengan pergeseran vertikal ringan | Hanya saat konten baru muncul; hindari animasi ulang pada setiap render |
| Meminta lokasi | Spinner/progress kecil dengan teks “Mencari lokasi…” | Berhenti saat berhasil, gagal, atau timeout |
| Lokasi terdeteksi | Ikon lokasi berubah menjadi centang dan teks status diperbarui | Status tetap dapat dipahami tanpa animasi |
| Kamera siap | Indikator status kamera berubah secara halus | Jangan menambahkan flash yang dapat disangka sebagai foto |
| Selfie diambil | Pratinjau berganti dengan transisi singkat | Sediakan tombol “Ulangi” yang jelas |
| Langkah proses absensi | Indikator Selfie → Lokasi → Kirim menandai langkah aktif | Jangan menandai langkah selesai sebelum syaratnya terpenuhi |
| Absensi berhasil | Ikon centang muncul dengan skala/fade ringan | Hanya setelah server mengonfirmasi penyimpanan |
| Toast/alert | Muncul dengan fade dan pergeseran kecil, lalu hilang bila aman | Pesan penting tidak hilang terlalu cepat; error dapat ditutup pengguna |
| Modal/dialog | Fade pada backdrop dan gerak masuk ringan pada panel | Fokus keyboard terjaga; tutup dengan cara yang wajar |
| Dropdown/tab | Perubahan indikator aktif dan panel dengan transisi singkat | Jangan mengandalkan animasi untuk menunjukkan pilihan |
| Skeleton loading | Placeholder statis atau shimmer sangat lembut | Untuk data dashboard saja; jangan gunakan shimmer berkedip cepat |
| Sinkronisasi offline | Ikon antrean berubah saat proses sinkronisasi | Bedakan “Menunggu sinkronisasi” dari “Tersimpan di server” |
| Status notifikasi Telegram | Ikon/status penerima berubah setelah hasil pengiriman diterima | Jangan mengubah status absensi karena kegagalan Telegram |
| Filter dan pencarian | Hasil diperbarui tanpa transisi besar | Pertahankan konteks filter dan posisi yang wajar |
| Badge jumlah tinjauan | Perubahan angka diperbarui dengan transisi singkat | Hindari animasi mencolok yang terus menarik perhatian |
| Empty state | Ilustrasi dan pesan masuk secara halus saat keadaan kosong tampil | Gerak ringan dan tidak berulang |
| Validasi formulir | Pesan error muncul dekat kolom terkait | Hindari mengguncang seluruh formulir; fokus ke kolom yang bermasalah |
| Tombol salin kode Telegram | Ikon berubah sesaat menjadi centang setelah berhasil disalin | Tetap tampilkan pesan teks “Kode disalin” |
| Berhasil menghubungkan Telegram | Badge status berubah menjadi “Terhubung” | Jangan menampilkan data wali yang tidak diperlukan |

### Status animasi proses

- **Loading:** selalu menyebut proses yang sedang berjalan, misalnya “Mengirim absensi…”.
- **Berhasil:** tampilkan hanya setelah ada konfirmasi yang sesuai dari server.
- **Gagal:** hentikan spinner dan berikan pesan serta tindakan lanjutan.
- **Offline:** jelaskan apakah data baru berada di antrean perangkat atau sudah diterima server.
- **Sebagian berhasil:** pisahkan hasil penyimpanan absensi dari hasil pengiriman notifikasi Telegram.

### Aksesibilitas gerakan

- Hormati preferensi sistem `prefers-reduced-motion`.
- Saat pengurangan gerakan aktif, hilangkan pergeseran, scaling, dan shimmer; pertahankan perubahan status instan atau fade minimal.
- Jangan menyampaikan informasi hanya melalui gerakan, warna, atau bunyi.
- Hindari kilatan cepat dan gerakan berulang yang tidak diperlukan.
- Pastikan animasi tidak mengganggu pembaca layar, fokus keyboard, atau pengguna yang memperbesar tampilan.

### Rekomendasi implementasi CSS

```css
:root {
  --motion-fast: 140ms;
  --motion-standard: 220ms;
  --motion-emphasis: 280ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive {
  transition:
    transform var(--motion-fast) var(--ease-out),
    background-color var(--motion-fast) ease,
    border-color var(--motion-fast) ease;
}

.interactive:active {
  transform: scale(0.98);
}

.panel-enter {
  animation: panel-enter var(--motion-standard) var(--ease-out) both;
}

@keyframes panel-enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Contoh di atas merupakan token dan pola awal. Tim implementasi perlu menguji animasi pada perangkat kelas menengah dan memastikan state aplikasi tidak bergantung pada selesainya animasi.

---

## 14. Arah Implementasi yang Disarankan

1.  Buat wireframe low-fidelity untuk beranda siswa, alur kamera/lokasi,
    riwayat, dashboard admin, halaman wali/Telegram, dan persetujuan
    digital.
2.  Validasi alur absensi dengan target waktu kurang dari 20 detik pada
    perangkat ponsel nyata.
3.  Tetapkan design tokens untuk warna, tipografi, jarak, radius,
    bayangan, dan motion.
4.  Bangun komponen status dan error sebelum animasi dekoratif.
5.  Uji mode offline, izin kamera/lokasi ditolak, absensi luar radius,
    dan notifikasi Telegram gagal.
6.  Uji aksesibilitas, kontras, ukuran target sentuh, dan
    `prefers-reduced-motion`.
7.  Lakukan uji kegunaan dengan beberapa siswa dan admin sebelum rilis.

### Prioritas MVP

**P0 --- wajib:** hierarki tombol absensi, alur selfie, lokasi, status
server, error/offline, riwayat, dashboard admin, tabel rekap,
persetujuan digital, status Telegram, aksesibilitas dasar.

**P1 --- setelah alur inti stabil:** animasi micro-interaction, grafik
ringkas admin, ilustrasi empty state, penyempurnaan transisi dan
skeleton.

**Rilis 2:** desain pendaftaran wajah, panduan liveness, hasil
pencocokan dan tinjauan admin. Semua alur ini harus mengikuti
persyaratan persetujuan serta tinjauan privasi yang relevan.

------------------------------------------------------------------------

## 15. Ringkasan Rekomendasi Final

Pilih **Modern School / Trustworthy Blue** sebagai arah utama, dengan
dashboard admin yang lebih padat dan fungsional. Gunakan biru sebagai
warna aksi, latar netral, kartu bersih, tipografi jelas, label status
yang konsisten, serta animasi 120--240 ms yang membantu pemahaman.
Jadikan alur absensi cepat dan status data transparan sebagai prioritas
di atas dekorasi visual.

**Prinsip penutup:** aplikasi harus terasa cepat, tepercaya, dan mudah
dipahami---terutama ketika kamera, GPS, koneksi internet, atau Telegram
sedang bermasalah.
