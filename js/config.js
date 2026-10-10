/**
 * APP CONFIGURATION & ENVIRONMENT TOGGLE
 * Ubah isProduction menjadi true untuk deployment langsung ke siswa/guru.
 */

const AppConfig = {
  isProduction: true, // Ubah ke true untuk mode resmi
  appName: 'e-Absensi Sekolah',
  schoolName: 'SMAN 1 Teladan',
  appVersion: '1.1.0',
  supabaseUrl: 'https://dxrnpayzynimwelyglae.supabase.co',
  supabaseAnonKey: 'sb_publishable_UDPYWT0jKe8gey7bwrEbrA_Z7CxWrMg',
  telegramBotToken: '8798424586:AAFpMPg8MtFlMmLHdpZ8OA3R5cyWSzznsmg',
  telegramBotUsername: 'AbsenM3INBot'
};


window.AppConfig = AppConfig;
