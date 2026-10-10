/**
 * TELEGRAM BOT & NOTIFICATION SERVICE
 * Sesuai PRD FR-37 s/d FR-46 & Keputusan Final 9 s/d 19
 */

class TelegramService {
  /**
   * Format pesan notifikasi sesuai standar PRD FR-38
   * (Tanpa GPS & tanpa foto selfie untuk menjaga privasi anak)
   */
  static formatMessage(payload) {
    return (
      `*NOTIFIKASI KEHADIRAN SISWA*\n` +
      `-----------------------------------\n` +
      `*Nama:* ${payload.student_name}\n` +
      `*NIS:* ${payload.nis || '-'}\n` +
      `*Sekolah:* ${payload.school}\n` +
      `*Tipe:* Absen ${payload.type}\n` +
      `*Tanggal:* ${payload.date}\n` +
      `*Waktu Server:* ${payload.time}\n` +
      `*Status:* ${payload.status}\n` +
      `-----------------------------------\n` +
      `_Pesan otomatis sistem presensi resmi._`
    );
  }

  /**
   * Simulasi interaksi Bot Telegram (untuk pengujian langsung di browser)
   */
  static simulateBotInteraction(userInput, currentChatId = '123456789') {
    const input = userInput.trim();

    if (input.startsWith('/start')) {
      const parts = input.split(' ');
      if (parts.length > 1) {
        // Direct deep link: /start <code>
        const code = parts[1].trim();
        return this.processCodeInput(code, currentChatId);
      }
      return {
        reply: `Layanan Notifikasi Kehadiran Siswa.\n\nSilakan kirimkan Kode Penautan 6 Karakter yang Anda peroleh dari sekolah untuk menautkan akun ini.`,
        success: true
      };
    }

    // Input presumed to be link code
    return this.processCodeInput(input, currentChatId);
  }

  static processCodeInput(code, chatId) {
    const res = DB.verifyAndLinkTelegram(code, chatId, `@wali_${chatId.slice(-4)}`);
    if (res.success) {
      const student = DB.getProfileById(res.guardian.student_id);
      return {
        reply: `[BERHASIL DITAUTKAN]\n\nAkun Telegram Anda kini resmi ditautkan ke data siswa: *${student?.full_name} (${student?.class_name})*.\n\nNotifikasi kehadiran akan dikirimkan otomatis saat absensi tercatat.`,
        success: true,
        guardian: res.guardian
      };
    } else {
      return {
        reply: `[PENAUTAN GAGAL]\n\n${res.message}\nSilakan periksa kembali kode atau hubungi admin sekolah.`,
        success: false
      };
    }
  }

  /**
   * Worker pemroses antrean pengiriman notifikasi (PRD FR-39, FR-40)
   */
  static runWorker() {
    return DB.processNotificationQueue();
  }
}

window.TelegramService = TelegramService;
