/**
 * APP CONFIGURATION & ENVIRONMENT TOGGLE
 * Ubah isProduction menjadi true untuk deployment langsung ke siswa/guru.
 */

const AppConfig = {
  isProduction: true, // Ubah ke true untuk mode resmi
  appName: 'e-Absensi Sekolah',
  schoolName: "Madrasah Mu'allimin Muhammadiyah Yogyakarta",
  schoolAddress: 'Jl. Letjen S.Parman No.68, Wirobrajan, Kota Yogyakarta, D.I. Yogyakarta 55252',
  schoolPhone: '(0274) 373122',
  schoolWebsite: 'https://muallimin.sch.id',
  defaultLat: -7.8037,
  defaultLng: 110.3533,
  appVersion: '1.2.0',
  supabaseUrl: 'https://dxrnpayzynimwelyglae.supabase.co',
  supabaseAnonKey: 'sb_publishable_UDPYWT0jKe8gey7bwrEbrA_Z7CxWrMg',
  telegramBotToken: '8798424586:AAFpMPg8MtFlMmLHdpZ8OA3R5cyWSzznsmg',
  telegramBotUsername: 'AbsenM3INBot'
};


window.AppConfig = AppConfig;
