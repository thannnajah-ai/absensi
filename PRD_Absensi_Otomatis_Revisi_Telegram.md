# PRD: Aplikasi Absensi Otomatis (Selfie + Jam + Lokasi)

**Versi:** 1.1 (Draft) · **Tanggal:** 10 Oktober 2026 · **Status:** Siap
review

## 1. Ringkasan

Aplikasi web (PWA, bisa di-install di HP) untuk mencatat kehadiran
**siswa** secara otomatis, dirancang untuk kurang dari 250 pengguna.
Setiap absen **wajib** menyertakan foto selfie, waktu absen yang dicatat
server, dan koordinat lokasi saat absen. Pengenalan wajah untuk
mencocokkan selfie dengan siswa terdaftar masuk di Rilis 2. Backend
menggunakan layanan free tier agar biaya operasional rendah. Notifikasi
orang tua/wali sementara menggunakan Telegram Bot API yang tidak
memungut biaya API untuk pesan bot standar; infrastruktur tetap tunduk
pada batas free tier dan dapat menimbulkan biaya.

## 2. Tujuan & Metrik Keberhasilan

  -----------------------------------------------------------------------
  Tujuan                  Metrik                  Target
  ----------------------- ----------------------- -----------------------
  Absen cepat             Waktu dari buka app     \< 20 detik
                          sampai absen terkirim   

  Mengurangi titip absen  Absen tanpa selfie      0% (selfie wajib)
                          valid                   

  Data akurat             Absen dengan lokasi     100%
                          tercatat                

  Biaya rendah            Biaya bulanan           Rp0 pada skala awal
                          infrastruktur           
  -----------------------------------------------------------------------

## 3. Pengguna

-   **Siswa:** melakukan absen masuk dan pulang, mengajukan koreksi,
    melihat riwayat sendiri.

-   **Admin sekolah (guru, wali kelas, tata usaha):** mengelola siswa,
    kelas, lokasi sekolah, dan jam masuk; meninjau absen di luar area
    dan wajah tidak cocok; melihat dan mengekspor rekap semua kelas.
    Wali kelas tidak dibatasi pada kelasnya sendiri.

-   **Orang tua/wali:** menerima notifikasi log absen melalui Telegram
    setelah akun Telegram ditautkan ke siswa; persetujuan pemrosesan
    data dikumpulkan melalui mekanisme digital terpisah. Orang tua/wali
    tidak perlu memiliki akun aplikasi sekolah.

## 4. Ruang Lingkup

**Termasuk (MVP):** login, absen masuk/pulang dengan selfie + jam
server + lokasi, absen di luar area dengan alasan, riwayat pribadi,
persetujuan digital orang tua/wali, pengajuan izin dan sakit, notifikasi
log absen ke akun Telegram orang tua/wali yang ditautkan, dashboard
admin, rekap dan ekspor CSV, pengaturan lokasi sekolah dan jam masuk,
pengelolaan penautan akun Telegram.

**Rilis 2 (setelah MVP):** pengenalan wajah (pendaftaran wajah,
pencocokan, liveness sederhana). **Tidak termasuk:** aplikasi native,
penggajian, dan pengenalan wajah sebelum Rilis 2. Notifikasi Telegram
melalui bot termasuk dalam MVP; notifikasi push aplikasi terpisah tidak
termasuk.

## 5. Kebutuhan Fungsional

### 5.1 Autentikasi

-   FR-1: Login dengan NIS atau email + password; akun siswa dibuat
    admin (impor massal).
-   FR-2: Peran: `student` dan `admin` (guru, wali kelas, tata usaha).
-   FR-3: Admin dapat menambah, menonaktifkan, dan mengimpor siswa (CSV:
    NIS, nama, kelas).

### 5.2 Absen (inti)

-   FR-4: Tombol **Absen Masuk** dan **Absen Pulang**; status hari ini
    ditampilkan jelas.
-   FR-5: **Selfie wajib.** Foto diambil langsung dari kamera depan
    (`getUserMedia`); upload dari galeri dinonaktifkan. Tombol kirim
    aktif hanya setelah selfie diambil.
-   FR-6: **Lokasi wajib.** Aplikasi meminta izin geolokasi
    (`navigator.geolocation`, akurasi tinggi). Tanpa izin lokasi, absen
    ditolak dengan pesan jelas.
-   FR-7: **Jam otomatis.** Jam absen selalu diambil dari **server**
    saat data diterima (anti-manipulasi jam HP); siswa tidak mengisi
    jam. Bila lupa absen, siswa mengajukan **koreksi manual** (jam +
    alasan) berstatus `pending` yang butuh persetujuan admin.
-   FR-8: Validasi **radius lokasi**: valid jika jarak ke titik sekolah
    ≤ radius (default 100 m, bisa diatur). Di luar radius, absen **tetap
    bisa dikirim dengan alasan wajib**; status `outside_area` dan masuk
    antrean tinjauan admin.
-   FR-9: Status keterlambatan dihitung otomatis dari jam masuk sekolah
    (`tepat waktu` / `terlambat`).
-   FR-10: Satu absen masuk dan satu absen pulang per hari; duplikat
    ditolak.
-   FR-11: Mode offline sederhana: data absen disimpan sementara di
    perangkat dan dikirim ulang saat online, dengan penanda
    `dikirim tertunda` (waktu server tetap dicatat saat sinkron; waktu
    perangkat disimpan sebagai pembanding).

### 5.3 Riwayat & Rekap

-   FR-12: Siswa melihat riwayat absen (tanggal, jam, status, lokasi di
    peta, thumbnail selfie).
-   FR-13: Admin melihat rekap harian/bulanan, filter per
    kelas/siswa/tanggal/status, serta detail selfie dan peta. Semua
    admin, termasuk wali kelas, dapat melihat seluruh kelas.
-   FR-14: Ekspor rekap ke CSV.

### 5.4 Pengaturan Admin

-   FR-15: Kelola lokasi sekolah (nama, koordinat, radius); bisa lebih
    dari satu.
-   FR-16: Kelola jam masuk/pulang dan toleransi keterlambatan.
-   FR-17: Kebijakan tetap: jam absen selalu dari server; absen di luar
    radius diizinkan dengan alasan dan ditinjau admin.

### 5.5 Pengenalan Wajah (Rilis 2)

-   FR-18: **Pendaftaran wajah.** Tiap siswa mendaftarkan wajah (3 foto:
    depan, kiri, kanan) di bawah pengawasan guru. Sistem menyimpan
    vektor wajah (embedding), bukan menggantikan selfie absen.
-   FR-19: **Pencocokan.** Setiap selfie dibandingkan dengan vektor
    terdaftar; skor ≥ ambang berstatus `wajah_cocok`.
-   FR-20: Skor di bawah ambang **tidak langsung menolak** absen:
    ditandai `wajah_tidak_cocok` dan masuk antrean tinjauan admin, agar
    siswa yang benar tidak salah ditolak.
-   FR-21: **Liveness sederhana.** Siswa diminta berkedip atau menoleh
    sesaat sebelum foto diambil, untuk mencegah foto dari foto.
-   FR-22: Siswa yang belum mendaftarkan wajah tetap bisa absen dengan
    status `wajah_belum_terdaftar`.
-   FR-23: Admin dapat mengatur ambang kecocokan, mendaftar ulang, dan
    menghapus data wajah siswa.
-   FR-24: Persetujuan orang tua/wali untuk data wajah dikumpulkan
    secara digital dan harus tercatat sebelum pendaftaran wajah (lihat
    bagian 5.6 dan 7).

### 5.6 Persetujuan Orang Tua/Wali (Digital)

Persetujuan pemrosesan data dikumpulkan secara digital. Penghubungan
akun Telegram merupakan proses teknis untuk menerima notifikasi dan
**bukan** pengganti persetujuan pemrosesan data. Ketentuan hukum, dasar
pemrosesan, serta kebutuhan persetujuan untuk data siswa di bawah umur
harus ditinjau pihak sekolah atau penasihat hukum sebelum peluncuran.

-   FR-25: Admin mengimpor data wali bersama data siswa (misalnya NIS,
    nama, kelas, nama wali, dan informasi kontak yang diperlukan). Data
    Telegram tidak harus tersedia saat siswa dibuat.
-   FR-26: Sistem menyediakan mekanisme persetujuan digital dengan
    tautan sekali pakai yang kedaluwarsa dalam 7 hari dan dapat dikirim
    ulang admin. Mekanisme ini terpisah dari kode penautan Telegram.
-   FR-27: Halaman persetujuan menjelaskan data yang dikumpulkan
    (selfie, lokasi saat absen, dan jam), tujuan, masa retensi, hak
    subjek data, serta cara mengajukan penarikan persetujuan. Setiap
    tujuan memiliki pilihan persetujuan yang terpisah, termasuk
    kamera/lokasi untuk absensi, notifikasi Telegram, dan data wajah
    (Rilis 2).
-   FR-28: Sistem mencatat waktu, versi teks persetujuan, tujuan yang
    disetujui, nama wali, dan informasi teknis minimum yang diperlukan
    (`consent_ref`).
-   FR-29: Wali dapat mengajukan penarikan persetujuan melalui mekanisme
    yang disediakan. Sistem mencatat penarikan, menghentikan notifikasi
    Telegram untuk tujuan yang ditarik, dan memberi tahu admin.
    Penarikan tidak boleh menghapus catatan audit yang perlu
    dipertahankan secara sah.
-   FR-30: Admin melihat status persetujuan per siswa dan kelas (belum
    dikirim, menunggu, disetujui, ditarik).
-   FR-30a: Kegagalan penautan Telegram atau belum tersedianya akun
    Telegram wali tidak boleh menjadi alasan teknis untuk menolak
    absensi. Kewajiban hukum dan persetujuan untuk pemrosesan data
    absensi tetap harus ditangani secara terpisah oleh sekolah.

### 5.7 Izin dan Sakit

Siswa yang tidak hadir karena izin atau sakit tercatat resmi, bukan
dihitung belum absen.

-   FR-31: Siswa mengajukan **izin** atau **sakit** dengan tanggal mulai
    dan selesai, keterangan, dan lampiran opsional (foto surat, maksimal
    300 KB). Admin dapat mengajukan atas nama siswa.
-   FR-32: Pengajuan berstatus `pending`, lalu `approved` atau
    `rejected` oleh admin (guru, wali kelas, tata usaha) dengan catatan
    singkat.
-   FR-33: Pada hari yang disetujui, siswa tidak wajib absen; rekap
    menampilkan status `izin` atau `sakit`.
-   FR-34: Rekap bulanan per siswa dan kelas menghitung hadir,
    terlambat, izin, sakit, dan tanpa keterangan; dapat diekspor ke CSV.
-   FR-35: Lampiran (misalnya surat dokter) tergolong data kesehatan:
    disimpan di bucket privat, hanya dapat dibuka admin, dan dihapus
    mengikuti masa retensi.
-   FR-36: Wali menerima notifikasi Telegram saat pengajuan izin/sakit
    disetujui atau ditolak, jika akun Telegram tertaut dan persyaratan
    persetujuan notifikasi terpenuhi (bagian 5.8).

### 5.8 Notifikasi Telegram

Notifikasi log absensi dikirim ke orang tua/wali melalui Telegram Bot
API. Penerima hanya orang tua/wali yang terdaftar dan telah menautkan
akun Telegram ke siswa, serta memenuhi status persetujuan notifikasi
yang berlaku. Satu siswa dapat memiliki beberapa wali dan beberapa akun
Telegram yang tertaut.

-   FR-37: Setiap absensi masuk dan pulang yang berhasil tersimpan
    membuat satu pekerjaan notifikasi untuk setiap akun wali yang
    tertaut dan memenuhi status persetujuan notifikasi. Absensi tetap
    berhasil walaupun Telegram belum ditautkan atau layanan notifikasi
    sedang gagal.
-   FR-38: Isi pesan meliputi nama siswa, jenis absensi (masuk/pulang),
    waktu server, tanggal, status absensi, dan nama sekolah. Koordinat
    GPS dan foto selfie tidak dikirim ke Telegram.
-   FR-39: Absensi disimpan lebih dahulu. Pekerjaan notifikasi dibuat
    dan diproses secara terpisah melalui antrean agar gangguan Telegram
    tidak menggagalkan atau memperlambat absensi. Untuk kegagalan
    sementara, sistem mencoba ulang maksimal 3 kali dengan jeda
    bertahap.
-   FR-40: Admin dapat melihat status pengiriman per penerima (`queued`,
    `sent`, `failed`, `unlinked`) dan meminta percobaan ulang bila
    sesuai. Kesalahan permanen dicatat agar dapat ditindaklanjuti.
-   FR-41: Notifikasi tambahan dapat mencakup hasil pengajuan
    izin/sakit. Notifikasi persetujuan dan pengingat absensi yang belum
    tercatat dapat diatur sebagai pengembangan berikutnya dan tidak
    wajib pada MVP.
-   FR-42: Mode utama MVP adalah `setiap absen`: notifikasi dikirim
    untuk setiap check-in dan check-out. Mode lain (pengecualian atau
    ringkasan harian) tidak termasuk keputusan MVP dan dapat ditambahkan
    kemudian.
-   FR-43: Integrasi Telegram ditempatkan melalui fungsi server/adapter
    agar detail pengiriman terpisah dari logika absensi. Token bot hanya
    disimpan sebagai secret server-side dan tidak pernah dikirim ke
    klien.
-   FR-44: Admin dapat memutuskan tautan akun Telegram setelah
    memverifikasi permintaan. Setelah dilepas, akun tersebut tidak
    menerima notifikasi baru. Riwayat pengiriman sebelumnya tetap
    menjadi catatan audit sesuai kebijakan retensi.
-   FR-45: Sistem otomatis menerbitkan kode unik untuk setiap wali
    terdaftar yang perlu menautkan Telegram. Wali memulai percakapan
    dengan bot dan memasukkan kode tersebut. Kode berlaku 24 jam, hanya
    dapat digunakan sekali, terikat pada siswa/wali yang ditentukan
    sistem, disimpan dalam bentuk hash, dan tidak dapat digunakan
    kembali setelah dipakai atau kedaluwarsa. Sistem dapat menerbitkan
    kode pengganti.
-   FR-46: Notifikasi diproses per penerima, sehingga kegagalan
    pengiriman ke satu wali tidak menghentikan pengiriman ke wali lain
    yang tertaut.

**Alur teknis:** setelah absensi tersimpan, sistem memasukkan pekerjaan
ke `notification_queue`. Worker terjadwal atau fungsi server memproses
antrean, memanggil Telegram Bot API, lalu mencatat hasil, jumlah
percobaan, dan ID pesan provider jika tersedia.

**Biaya:** Telegram Bot API tidak memungut biaya API untuk pengiriman
pesan bot standar. Hosting, database, penyimpanan, bandwidth, dan
penjadwal tetap tunduk pada batas free tier serta dapat menimbulkan
biaya jika batas terlampaui. Batas dan ketentuan layanan perlu
diverifikasi sebelum peluncuran.

## 6. Alur Pengguna (Absen)

1.  Siswa membuka aplikasi dan login (sesi tersimpan).
2.  Siswa menekan **Absen Masuk** atau **Absen Pulang**.
3.  Aplikasi meminta izin kamera dan lokasi sesuai kebutuhan.
4.  Aplikasi mengambil lokasi dan menampilkan jarak ke sekolah.
5.  Siswa mengambil selfie, melihat pratinjau, lalu mengonfirmasi.
6.  Server mencatat waktu, memvalidasi radius, dan menyimpan absensi
    serta foto; aplikasi menampilkan konfirmasi.
7.  Sistem membuat pekerjaan notifikasi Telegram untuk setiap akun wali
    yang sudah tertaut dan memenuhi persyaratan persetujuan notifikasi.
    Proses ini berjalan terpisah dan tidak menentukan keberhasilan
    absensi.

### 6.1 Alur Penautan Telegram Orang Tua/Wali

1.  Sistem menerbitkan kode unik untuk wali terdaftar yang perlu
    menautkan akun Telegram.
2.  Wali membuka bot Telegram dan menekan **Start**.
3.  Wali memasukkan kode penautan yang masih berlaku.
4.  Server memvalidasi kode, status wali/siswa, masa berlaku 24 jam, dan
    status belum pernah dipakai.
5.  Jika valid, sistem menautkan `telegram_chat_id` ke relasi wali-siswa
    yang sesuai dan menandai kode sudah digunakan.
6.  Jika kode kedaluwarsa atau sudah digunakan, wali meminta kode baru
    melalui prosedur yang ditetapkan sekolah.
7.  Untuk melepas tautan, wali menghubungi admin; admin memverifikasi
    permintaan sebelum memutus tautan.

## 7. Kebutuhan Non-Fungsional

-   **Keamanan:** HTTPS wajib; Row Level Security (RLS) agar siswa hanya
    melihat data sendiri; foto di bucket privat dengan signed URL
    berumur pendek.
-   **Privasi anak dan biometrik:** pemrosesan data siswa, lokasi,
    selfie, dan terutama data wajah harus memiliki dasar pemrosesan yang
    sesuai dan ditinjau pihak sekolah/penasihat hukum berdasarkan UU
    Pelindungan Data Pribadi serta aturan terkait anak. Penautan
    Telegram tidak sama dengan persetujuan pemrosesan data. Lokasi hanya
    diambil saat absen; selfie dan data wajah dihapus sesuai jadwal
    retensi dan kebutuhan hukum yang telah ditetapkan. Akses dan
    penghapusan harus diaudit.
-   **Performa dan kapasitas:** foto dikompres di klien (±50 KB, lebar
    480 px). Perkiraan 250 siswa × 2 selfie × 50 KB ≈ 25 MB per hari
    sekolah, sehingga retensi selfie 30 hari (±550 MB) muat di storage
    free tier (±1 GB; verifikasi di halaman harga resmi). Lonjakan jam
    masuk (±250 absen dalam 10-15 menit) tetap harus selesai \< 3 detik
    per absen.
-   **Kompatibilitas:** Chrome/Safari mobile terbaru, Android 9+/iOS
    15+.
-   **Aksesibilitas:** teks jelas, tombol besar, pesan error berbahasa
    Indonesia.

## 8. Anti-Kecurangan (MVP)

-   Jam dari server, bukan dari HP.
-   Selfie hanya dari kamera langsung; simpan metadata (waktu server,
    ukuran, user agent).
-   Simpan `accuracy` GPS; tandai absen dengan akurasi buruk (\> 50 m)
    atau indikasi lokasi palsu (lompatan koordinat tidak wajar).
-   Admin dapat meninjau dan menandai absen mencurigakan.
-   Rilis 2: pencocokan wajah dan liveness (FR-18 sampai FR-24).

## 9. Arsitektur & Stack (Backend Gratis)

**Rekomendasi: Supabase (free tier) + Vercel/Cloudflare Pages (free).**

  -----------------------------------------------------------------------
  Lapisan                 Pilihan                 Alasan
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js/React (PWA)     Gratis, deploy otomatis
                          atau Vue, di-host di    dari Git
                          Vercel / Cloudflare     
                          Pages                   

  Auth                    Supabase Auth           Email/password +
                                                  Google, terintegrasi
                                                  RLS

  Database                Supabase Postgres       Relasional, cocok untuk
                                                  rekap & laporan

  Storage selfie          Supabase Storage        Satu platform, signed
                          (bucket privat)         URL

  Logika server           Supabase Edge Functions Validasi radius, jam
                          / RPC (Postgres         server, anti-duplikat,
                          function)               penautan Telegram dan
                                                  antrean notifikasi

  Peta                    Leaflet + OpenStreetMap Gratis, tanpa API key
                                                  berbayar

  Pengenalan wajah (Rilis MediaPipe atau          Gratis dan tidak
  2)                      TensorFlow.js           membebani server;
                          (embedding dibuat di    tinjauan admin menutup
                          perangkat),             celah vektor yang
                          perbandingan vektor di  dimanipulasi
                          Edge Function           
  -----------------------------------------------------------------------

**Alternatif gratis:** Firebase (Spark plan; catatan: Storage di Spark
kini perlu diperiksa ulang syaratnya), atau PocketBase di VPS
gratis/murah, atau Cloudflare Workers + D1 + R2.

> Catatan: batas free tier (ukuran database, storage, bandwidth, project
> dijeda saat tidak aktif) bisa berubah. Verifikasi di halaman harga
> resmi sebelum rilis. Kompresi selfie dan retensi foto membantu tetap
> di dalam kuota.

    [HP/PWA] --kamera+GPS--> [Frontend] --HTTPS--> [Supabase Edge Function]
                                                  |-- validasi jam server & radius
                                                  |-- simpan foto -> Storage
                                                  '-- simpan record -> Postgres
    [Admin Dashboard] <--RLS--> Postgres/Storage
    [Notification Worker] --bot token (secret)--> [Telegram Bot API] --> [Akun Telegram wali]

## 10. Model Data

**profiles**: `id (uuid, = auth.users.id)`, `full_name`, `nis`,
`class_name`, `role (student|admin)`, `active`, `created_at`

**sites**: `id`, `name`, `lat`, `lng`, `radius_m`, `time_in`,
`time_out`, `late_tolerance_min`

**attendance**: `id`, `user_id`, `site_id`, `type (in|out)`,
`server_time (timestamptz)`, `device_time`, `manual_time`,
`manual_reason`, `outside_reason`, `lat`, `lng`, `accuracy_m`,
`distance_m`, `selfie_path`,
`status (on_time|late|outside_area|pending|approved|rejected)`,
`flags (jsonb)`, `face_score` dan
`face_status (match|mismatch|not_enrolled)` (Rilis 2), `created_at`

**settings**: `selfie_retention_days (default 30)`, `face_threshold`
(Rilis 2), `telegram_notifications_enabled`, `telegram_reminder_time`
(opsional jika fitur pengingat ditambahkan)

**face_templates** (Rilis 2): `user_id`, `embedding (vector)`,
`enrolled_at`, `consent_ref`

**student_guardians**: `id`, `student_id`, `guardian_name`,
`guardian_contact` (opsional), `telegram_chat_id` (nullable),
`telegram_username` (opsional), `linked_at`, `status (active|unlinked)`,
`consent_ref`, `created_at`, `updated_at`. Satu siswa dapat memiliki
beberapa relasi wali; setiap akun Telegram ditautkan pada relasi wali
yang diverifikasi.

**telegram_link_codes**: `id`, `student_guardian_id`, `code_hash`,
`issued_at`, `expires_at`, `used_at`,
`status (active|used|expired|revoked)`, `issued_by (system|admin)`. Kode
mentah hanya ditampilkan/dikirim melalui mekanisme yang aman; simpan
hash, bukan kode mentah. Kode berlaku 24 jam dan satu kali pakai.

**consents**: `id`, `user_id`, `guardian_name`,
`scope (camera_location|telegram_notification|face)`, `text_version`,
`consented_at`, `device_info`, `withdrawn_at`, `token_hash`,
`token_expires_at`

**leave_requests**: `id`, `user_id`, `type (izin|sakit)`, `date_from`,
`date_to`, `note`, `attachment_path`,
`status (pending|approved|rejected)`, `reviewed_by`, `review_note`,
`created_at`

**notification_queue**: `id`, `user_id`, `attendance_id`, `leave_id`,
`student_guardian_id`, `channel (telegram)`,
`template (checkin|checkout|leave_result)`, `to_chat_id`,
`payload (jsonb)`, `status (queued|sent|failed|unlinked)`, `attempts`,
`provider_message_id`, `error`, `created_at`, `sent_at`. Status dan
percobaan dicatat per penerima.

Aturan unik: satu `type` per `user_id` per tanggal (unique index).
`code_hash` harus unik selama kode aktif; kode yang sudah dipakai atau
kedaluwarsa tidak dapat digunakan kembali. Hindari menyimpan token bot
atau kode penautan mentah di database/log.

## 11. Kontrak API (ringkas)

  -----------------------------------------------------------------------------
  Endpoint                              Metode              Deskripsi
  ------------------------------------- ------------------- -------------------
  `/functions/v1/check-in`              POST                Body: `type`,
                                                            `lat`, `lng`,
                                                            `accuracy`,
                                                            `selfie` (file),
                                                            `device_time`,
                                                            opsional
                                                            `manual_time` +
                                                            `reason`. Respons:
                                                            status, jam server,
                                                            jarak. Membuat
                                                            pekerjaan
                                                            notifikasi setelah
                                                            absensi tersimpan.

  `/rest/v1/attendance`                 GET                 Riwayat (difilter
                                                            RLS).

  `/rest/v1/sites`                      GET/POST/PATCH      Kelola lokasi
                                                            (admin).

  `/rest/v1/attendance?select=*` +      GET                 Rekap admin, ekspor
  filter                                                    CSV di klien.

  `/functions/v1/telegram-link-code`    POST                Membuat atau
                                                            menerbitkan ulang
                                                            kode penautan untuk
                                                            wali terdaftar;
                                                            berlaku 24 jam.

  `/functions/v1/telegram-webhook`      POST                Menerima update
                                                            dari Telegram Bot
                                                            API; memvalidasi
                                                            kode dan menautkan
                                                            chat Telegram yang
                                                            benar.

  `/functions/v1/notification-worker`   POST/terjadwal      Memproses antrean
                                                            Telegram, retry
                                                            maksimal 3 kali
                                                            untuk kegagalan
                                                            sementara, dan
                                                            menyimpan hasil per
                                                            penerima.

  `/functions/v1/telegram-unlink`       POST                Admin memutus
                                                            tautan setelah
                                                            verifikasi dan
                                                            mencatat audit.
  -----------------------------------------------------------------------------

**Validasi server absensi:** autentikasi valid, selfie ada (JPEG/WebP, ≤
300 KB), koordinat valid, hitung jarak (rumus Haversine), cek duplikat,
tetapkan jam server, hitung status. Bila di luar radius, `reason` wajib
diisi (status `outside_area`, masuk antrean tinjauan). Rilis 2:
bandingkan vektor wajah dan simpan `face_score`.

**Validasi penautan Telegram:** kode cocok dengan hash, belum digunakan,
belum kedaluwarsa, belum dicabut, dan terikat pada relasi wali-siswa
yang benar. Jangan menerima `telegram_chat_id` dari klien sebagai bukti
identitas; ambil dari update webhook Telegram setelah wali memulai bot
dan memasukkan kode. Verifikasi rahasia webhook sesuai kemampuan
platform, lindungi endpoint dari replay, dan jangan mencatat token/kode
mentah ke log.

## 12. Kebutuhan UI (Layar Utama)

-   **Beranda:** jam & tanggal, status hari ini, tombol besar Absen
    Masuk/Pulang.
-   **Layar Absen:** pratinjau kamera depan, indikator lokasi (jarak ke
    sekolah, akurasi), tombol ambil selfie, pratinjau, kolom alasan bila
    di luar area, kirim.
-   **Riwayat:** daftar per tanggal, detail dengan peta mini dan selfie.
-   **Admin:** dashboard hari ini (hadir/terlambat/belum), tabel rekap,
    filter kelas, pengaturan sekolah & jam, tinjauan absen luar area dan
    wajah tidak cocok, persetujuan koreksi, daftar wali dan status
    tautan Telegram, penerbitan ulang kode, log notifikasi, serta
    pemutusan tautan setelah verifikasi.

## 13. Kasus Tepi

  ---------------------------------------------------------------------
  Kasus                              Penanganan
  ---------------------------------- ----------------------------------
  Izin kamera/lokasi ditolak         Tampilkan panduan mengaktifkan
                                     izin; absen tidak bisa dikirim

  GPS tidak akurat / di dalam gedung Minta coba lagi; simpan akurasi;
                                     tandai bila \> 50 m

  Sinyal hilang                      Antrean offline, sinkron otomatis

  Lupa absen pulang                  Admin/pengguna ajukan koreksi
                                     manual dengan alasan

  Perangkat tanpa kamera depan       Pesan error; hubungi admin

  Free tier habis                    Peringatan admin, kompresi lebih
                                     agresif, retensi lebih pendek;
                                     tinjau batas layanan Telegram dan
                                     infrastruktur

  Siswa di luar radius               Absen tetap dikirim dengan alasan
                                     wajib; status di luar area, masuk
                                     antrean tinjauan admin

  Lonjakan jam masuk (±250 absen     Edge Function menangani; antrean
  dalam 10-15 menit)                 offline mencegah absen gagal

  Wajah tidak cocok (Rilis 2)        Absen tersimpan dan ditandai;
                                     siswa boleh mengulang selfie;
                                     admin meninjau

  Wali belum menautkan Telegram      Absensi tetap diproses; notifikasi
                                     tidak dikirim ke akun yang belum
                                     tertaut; admin dapat membantu
                                     proses penautan

  Kode Telegram kedaluwarsa/sudah    Tolak kode, tampilkan instruksi
  dipakai                            meminta kode baru; kode berlaku 24
                                     jam dan satu kali pakai

  Pengiriman Telegram gagal          Simpan status per penerima, retry
                                     kegagalan sementara maksimal 3
                                     kali; kegagalan notifikasi tidak
                                     membatalkan absensi

  Satu dari beberapa wali gagal      Lanjutkan pengiriman ke wali lain
  menerima pesan                     dan catat hasil tiap penerima
                                     secara terpisah

  Permintaan melepas akun Telegram   Admin memverifikasi permintaan,
                                     memutus tautan, dan mencatat
                                     tindakan pada audit log
  ---------------------------------------------------------------------

## 14. Rencana Rilis

  -----------------------------------------------------------------------
  Fase                    Cakupan                 Estimasi
  ----------------------- ----------------------- -----------------------
  0                       Setup Supabase, skema,  2-3 hari
                          RLS, auth               

  1                       Absen masuk/pulang      1 minggu
                          (selfie+lokasi+jam      
                          server)                 

  2                       Riwayat + dashboard     1 minggu
                          admin + ekspor CSV      

  3                       Mode manual +           1 minggu
                          persetujuan, offline    
                          queue, anti-fraud dasar 

  4                       UAT, perbaikan, deploy  3-5 hari

  2b                      Persetujuan digital     1,5 minggu
                          orang tua, izin dan     
                          sakit, penautan         
                          Telegram, notifikasi    
                          per wali (antrean, log, 
                          retry, pemutusan        
                          tautan)                 

  5 (Rilis 2)             Pengenalan wajah:       2 minggu
                          persetujuan orang tua,  
                          pendaftaran wajah,      
                          pencocokan, liveness,   
                          antrean tinjauan        
  -----------------------------------------------------------------------

## 15. Risiko

-   **Batas free tier** → selfie ±50 KB, retensi 30 hari, pantau
    penggunaan.

-   **Privasi data siswa (anak) dan biometrik** → persetujuan orang
    tua/wali sebelum pendaftaran wajah, akses terbatas, enkripsi,
    penghapusan saat siswa lulus atau keluar; tinjau kepatuhan UU PDP
    bersama pihak sekolah atau penasihat hukum.

-   **Salah cocok wajah (siswa yang benar ditolak)** → tidak ada
    penolakan otomatis; tinjauan admin; ambang bisa diatur.

-   **Kecurangan GPS/selfie** → validasi server, flag, tinjauan admin;
    liveness di Rilis 2.

-   **Ketergantungan satu vendor** → skema standar Postgres agar mudah
    dimigrasi.

-   **Notifikasi Telegram gagal atau bot diblokir/dihentikan pengguna**
    → absensi tetap disimpan, status per penerima dicatat, retry hanya
    untuk kegagalan sementara, dan admin menyediakan prosedur
    memperbaiki tautan.

-   **Batas free tier/infrastruktur terlampaui** → pantau penggunaan
    database, storage, bandwidth, dan worker; perkirakan biaya
    operasional sebelum peluncuran. Telegram Bot API standar tidak
    mengenakan biaya API untuk pesan bot, tetapi layanan pendukung dapat
    berbiaya.

## 16. Keputusan Final

1.  Pengguna utama adalah siswa, kurang dari 250 orang.
2.  Jam absensi selalu dicatat oleh server.
3.  Absensi di luar radius tetap dapat dikirim dengan alasan wajib dan
    masuk tinjauan admin.
4.  Target awal adalah biaya rendah dengan free tier dan retensi selfie
    30 hari; batas layanan harus diverifikasi sebelum rilis.
5.  Pengenalan wajah diperlukan dan dikerjakan di Rilis 2, setelah
    persetujuan dan tinjauan privasi yang relevan.
6.  Semua admin, termasuk wali kelas, dapat melihat seluruh kelas.
7.  Persetujuan digital pemrosesan data orang tua/wali terpisah dari
    penautan Telegram. Penautan Telegram bukan persetujuan pemrosesan
    data.
8.  Pencatatan izin dan sakit diperlukan dan masuk MVP.
9.  Kanal notifikasi sementara adalah Telegram Bot API; penerima hanya
    orang tua/wali yang terdaftar dan tertaut.
10. Setiap absensi masuk dan pulang memicu notifikasi kepada setiap akun
    wali yang tertaut dan memenuhi status persetujuan notifikasi.
11. Satu siswa boleh memiliki beberapa wali/akun Telegram yang tertaut.
12. Sistem otomatis menerbitkan kode penautan unik per wali; kode
    berlaku 24 jam dan hanya dapat digunakan satu kali. Kode disimpan
    dalam bentuk hash dan dapat diterbitkan ulang.
13. Wali memulai bot Telegram dan memasukkan kode untuk menautkan akun.
    `telegram_chat_id` diperoleh dari webhook Telegram, bukan dari input
    bebas di aplikasi.
14. Pemutusan tautan Telegram hanya dilakukan admin setelah
    memverifikasi permintaan.
15. Absensi tetap dapat diproses jika akun Telegram wali belum tertaut
    atau notifikasi gagal. Ini tidak menghapus kewajiban sekolah untuk
    menetapkan dasar pemrosesan dan memenuhi persyaratan persetujuan
    yang berlaku bagi data absensi.
16. Notifikasi dikirim melalui antrean terpisah; maksimal 3 percobaan
    ulang untuk kegagalan sementara. Hasil dicatat per penerima.
17. Foto selfie dan koordinat GPS tidak dimasukkan ke pesan Telegram.
    Token bot disimpan sebagai secret server-side.
18. Telegram Bot API standar tidak memungut biaya API untuk pesan bot;
    infrastruktur tetap memiliki batas free tier dan kemungkinan biaya.
19. API dan skema yang diusulkan meliputi `student_guardians`,
    `telegram_link_codes`, antrean notifikasi per penerima, serta fungsi
    penautan, webhook, worker, dan pemutusan tautan.

### Pemeriksaan sebelum implementasi

-   Pastikan alur persetujuan, dasar pemrosesan, retensi, dan hak orang
    tua/wali ditinjau oleh pihak sekolah/penasihat hukum.
-   Tetapkan siapa yang memverifikasi identitas wali dan cara aman
    menyampaikan kode penautan.
-   Verifikasi batas free tier dan kebutuhan penjadwal/worker pada
    platform yang dipilih.
-   Uji kegagalan webhook, kode kedaluwarsa/duplikat, akun bot diblokir,
    dan pengiriman ke beberapa wali.
-   Jangan menyimpan token bot atau kode mentah dalam log, dan jangan
    memasukkan foto/GPS ke notifikasi Telegram.
