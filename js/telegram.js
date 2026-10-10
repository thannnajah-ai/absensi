/**
 * TELEGRAM BOT & NOTIFICATION SERVICE
 * Sesuai PRD FR-37 s/d FR-46 & Keputusan Final 9 s/d 19
 * Mendukung API Bot Telegram Nyata dan Mode Simulator
 */

class TelegramService {
  static lastUpdateId = 0;

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
      `_Pesan otomatis sistem presensi resmi SMAN 1 Teladan._`
    );
  }

  /**
   * Mengirim pesan nyata ke API Telegram Resmi
   */
  static async sendRealMessage(chatId, text) {
    const token = window.AppConfig?.telegramBotToken;
    if (!token) {
      return { success: false, error: 'Token Bot belum diatur di AppConfig' };
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });

      const data = await response.json();
      if (data.ok) {
        return { success: true, messageId: data.result.message_id };
      } else {
        return { success: false, error: data.description || 'Gagal mengirim pesan Telegram' };
      }
    } catch (err) {
      console.error('Error sending Telegram message:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Membaca pesan masuk dari Bot Telegram untuk penautan kode otomatis
   */
  static async syncBotUpdates() {
    const token = window.AppConfig?.telegramBotToken;
    if (!token) {
      return { success: false, count: 0, message: 'Token Bot belum diatur' };
    }

    try {
      const offsetParam = this.lastUpdateId ? `?offset=${this.lastUpdateId + 1}` : '';
      const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates${offsetParam}`);
      const data = await response.json();

      if (!data.ok || !data.result || data.result.length === 0) {
        return { success: true, count: 0, message: 'Tidak ada pesan baru dari wali murid.' };
      }

      let linkedCount = 0;

      for (const update of data.result) {
        if (update.update_id > this.lastUpdateId) {
          this.lastUpdateId = update.update_id;
        }

        const msg = update.message;
        if (!msg || !msg.text) continue;

        const chatId = String(msg.chat.id);
        const username = msg.from.username ? `@${msg.from.username}` : (msg.from.first_name || 'Wali');
        const text = msg.text.trim();

        let linkCode = '';
        if (text.startsWith('/start')) {
          const parts = text.split(' ');
          if (parts.length > 1) {
            linkCode = parts[1].trim();
          }
        } else if (/^[A-Za-z0-9]{6}$/.test(text)) {
          linkCode = text;
        }

        if (linkCode) {
          const linkResult = DB.verifyAndLinkTelegram(linkCode, chatId, username);
          if (linkResult.success) {
            linkedCount++;
            const student = DB.getProfileById(linkResult.guardian.student_id);
            await this.sendRealMessage(
              chatId,
              `*NOTIFIKASI RESMI SMAN 1 TELADAN*\n\n` +
              `Akun Telegram Anda (*${username}*) berhasil ditautkan ke data siswa:\n` +
              `*Nama:* ${student?.full_name}\n` +
              `*Kelas:* ${student?.class_name}\n\n` +
              `Mulai saat ini, notifikasi presensi masuk & pulang ananda akan otomatis dikirimkan ke ruang obrolan ini.`
            );
          } else {
            await this.sendRealMessage(
              chatId,
              `*PENAUTAN GAGAL*\n\n${linkResult.message}\n` +
              `Silakan hubungi pihak sekolah atau minta kode penautan yang baru.`
            );
          }
        }
      }

      if (linkedCount > 0) {
        setTimeout(() => this.runWorker().catch(() => {}), 300);
      }

      return { success: true, count: linkedCount, message: `Berhasil menautkan ${linkedCount} akun wali baru!` };
    } catch (err) {
      console.error('Error syncing bot updates:', err);
      return { success: false, count: 0, error: err.message };
    }
  }

  /**
   * Simulasi interaksi Bot Telegram (untuk pengujian langsung di dialog simulator)
   */
  static simulateBotInteraction(userInput, currentChatId = '123456789') {
    const input = userInput.trim();

    if (input.startsWith('/start')) {
      const parts = input.split(' ');
      if (parts.length > 1) {
        const code = parts[1].trim();
        return this.processCodeInput(code, currentChatId);
      }
      return {
        reply: `Layanan Notifikasi Kehadiran Siswa.\n\nSilakan kirimkan Kode Penautan 6 Karakter yang Anda peroleh dari sekolah untuk menautkan akun ini.`,
        success: true
      };
    }

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
   * Mengirim secara nyata jika bot token aktif, atau memutakhirkan status antrean.
   */
  static async runWorker() {
    // 1. Sinkronkan semua pesan / penautan kode masuk dari Telegram secara otomatis
    try {
      await this.syncBotUpdates();
    } catch (e) {
      console.warn('Sync updates error in worker:', e);
    }

    const db = DB.get();
    const token = window.AppConfig?.telegramBotToken;
    let sentCount = 0;

    const queue = db.notification_queue || [];
    for (const item of queue) {
      // Periksa apakah wali dari item ini baru saja menautkan Telegram
      if (item.status === 'unlinked') {
        const guardian = (db.guardians || []).find(g => g.id === item.student_guardian_id);
        if (guardian && guardian.telegram_chat_id) {
          item.to_chat_id = guardian.telegram_chat_id;
          item.status = 'queued';
        }
      }

      if (item.status === 'queued') {
        item.attempts = (item.attempts || 0) + 1;

        if (token && item.to_chat_id && item.to_chat_id !== 'UNLINKED') {
          // Kirim ke API Telegram Resmi
          const messageText = this.formatMessage(item.payload);
          const sendRes = await this.sendRealMessage(item.to_chat_id, messageText);

          if (sendRes.success) {
            item.status = 'sent';
            item.provider_message_id = 'tg-' + sendRes.messageId;
            item.sent_at = new Date().toISOString();
            item.error = null;
            sentCount++;
          } else {
            item.error = sendRes.error;
            if (item.attempts >= 3) {
              item.status = 'failed';
            }
          }
        } else {
          // Fallback lokal / simulasi
          item.status = 'sent';
          item.provider_message_id = 'tg-mock-' + Math.floor(Math.random() * 900000 + 100000);
          item.sent_at = new Date().toISOString();
          sentCount++;
        }
      }
    }

    DB.save(db);
    return sentCount;
  }
}

window.TelegramService = TelegramService;
