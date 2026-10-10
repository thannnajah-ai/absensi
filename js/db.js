/**
 * DATABASE & STORAGE LAYER (LocalStorage Mock + Supabase-Compatible Data Schema)
 * Berdasarkan PRD Bagian 10 & 11
 */

const DB_KEY = 'absensi_database_v1';

// Seed Initial Data jika belum ada di LocalStorage
const DEFAULT_DB = {
  sites: [
    {
      id: 'site-1',
      name: 'SMAN 1 Teladan',
      lat: -6.2088,
      lng: 106.8456,
      radius_m: 100,
      time_in: '07:00',
      time_out: '15:00',
      late_tolerance_min: 15
    }
  ],
  profiles: [
    {
      id: 'usr-1',
      full_name: 'Budi Santoso',
      nis: '1024',
      password: '123',
      email: 'budi@siswa.id',
      class_name: 'XII-IPA-1',
      role: 'student',
      active: true,
      created_at: new Date('2026-07-01').toISOString()
    },
    {
      id: 'usr-2',
      full_name: 'Siti Rahma',
      nis: '1025',
      password: '123',
      email: 'siti@siswa.id',
      class_name: 'XII-IPA-1',
      role: 'student',
      active: true,
      created_at: new Date('2026-07-01').toISOString()
    },
    {
      id: 'usr-3',
      full_name: 'Ahmad Fauzi',
      nis: '1026',
      password: '123',
      email: 'ahmad@siswa.id',
      class_name: 'XII-IPS-2',
      role: 'student',
      active: true,
      created_at: new Date('2026-07-01').toISOString()
    },
    {
      id: 'adm-1',
      full_name: 'Hendra Wijaya, S.Pd',
      nis: null,
      email: 'admin@sekolah.id',
      password: 'admin',
      class_name: 'Guru / Wali Kelas',
      role: 'admin',
      active: true,
      created_at: new Date('2026-01-01').toISOString()
    }
  ],
  guardians: [
    {
      id: 'grd-1',
      student_id: 'usr-1',
      guardian_name: 'Joko Santoso (Ayah Budi)',
      guardian_contact: '081234567890',
      telegram_chat_id: null,
      telegram_username: null,
      linked_at: null,
      status: 'active',
      consent_ref: 'CONSENT-1024',
      created_at: new Date('2026-07-01').toISOString()
    },
    {
      id: 'grd-2',
      student_id: 'usr-2',
      guardian_name: 'Ibu Nurhayati (Ibu Siti)',
      guardian_contact: '081298765432',
      telegram_chat_id: '987654321',
      telegram_username: '@nurhayati_wali',
      linked_at: new Date('2026-08-01').toISOString(),
      status: 'active',
      consent_ref: 'CONSENT-1025',
      created_at: new Date('2026-07-01').toISOString()
    }
  ],
  telegram_link_codes: [],
  consents: [
    {
      id: 'cst-1',
      user_id: 'usr-1',
      guardian_name: 'Joko Santoso',
      scope: 'camera_location',
      text_version: 'v1.1-2026',
      consented_at: new Date('2026-07-05').toISOString(),
      device_info: 'Chrome Android'
    },
    {
      id: 'cst-2',
      user_id: 'usr-2',
      guardian_name: 'Ibu Nurhayati',
      scope: 'telegram_notification',
      text_version: 'v1.1-2026',
      consented_at: new Date('2026-07-05').toISOString(),
      device_info: 'Safari iOS'
    }
  ],
  attendance: [
    {
      id: 'att-101',
      user_id: 'usr-2',
      site_id: 'site-1',
      type: 'in',
      server_time: new Date(new Date().setHours(6, 55, 0, 0)).toISOString(),
      device_time: new Date(new Date().setHours(6, 55, 0, 0)).toISOString(),
      lat: -6.2088,
      lng: 106.8456,
      accuracy_m: 14,
      distance_m: 12,
      selfie_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23DBEAFE"/><circle cx="100" cy="80" r="40" fill="%232563EB"/><path d="M40 180 C40 130 160 130 160 180 Z" fill="%231E40AF"/><text x="100" y="195" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23FFF">Siti Rahma</text></svg>',
      status: 'on_time',
      flags: {},
      created_at: new Date(new Date().setHours(6, 55, 0, 0)).toISOString()
    }
  ],
  leave_requests: [
    {
      id: 'lev-1',
      user_id: 'usr-3',
      type: 'sakit',
      date_from: new Date().toISOString().split('T')[0],
      date_to: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      note: 'Flu berat dan demam tinggi, istirahat dokter 2 hari.',
      attachment_path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%23FEF3C7"/><text x="20" y="40" font-family="sans-serif" font-size="16" fill="%2392400E">Surat Keterangan Dokter</text><text x="20" y="80" font-family="sans-serif" font-size="12" fill="%2378350F">Klinik Sehat Sejahtera - Ahmad Fauzi</text></svg>',
      status: 'pending',
      reviewed_by: null,
      review_note: null,
      created_at: new Date().toISOString()
    }
  ],
  notification_queue: [
    {
      id: 'ntf-1',
      user_id: 'usr-2',
      attendance_id: 'att-101',
      student_guardian_id: 'grd-2',
      channel: 'telegram',
      template: 'checkin',
      to_chat_id: '987654321',
      payload: {
        student_name: 'Siti Rahma',
        type: 'Masuk',
        time: '06:55 WIB',
        date: new Date().toLocaleDateString('id-ID'),
        status: 'Tepat Waktu',
        school: 'SMAN 1 Teladan'
      },
      status: 'sent',
      attempts: 1,
      provider_message_id: 'tg-msg-78921',
      created_at: new Date(new Date().setHours(6, 55, 5, 0)).toISOString(),
      sent_at: new Date(new Date().setHours(6, 55, 7, 0)).toISOString()
    }
  ],
  settings: {
    selfie_retention_days: 30,
    face_threshold: 0.8,
    telegram_notifications_enabled: true
  }
};

class DB {
  static get() {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (!data) {
        localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
        return DEFAULT_DB;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading DB:', e);
      return DEFAULT_DB;
    }
  }

  static save(data) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving DB:', e);
    }
  }

  static reset() {
    localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
  }

  // --- Profiles ---
  static getProfiles() {
    return this.get().profiles || [];
  }

  static getProfileById(id) {
    return this.getProfiles().find(p => p.id === id);
  }

  static addProfile(profile) {
    const db = this.get();
    db.profiles.push(profile);
    this.save(db);
    return profile;
  }

  static authenticate(identifier, password) {
    const profiles = this.getProfiles();
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const user = profiles.find(p => {
      const matchNis = p.nis && p.nis.toLowerCase() === cleanId;
      const matchEmail = p.email && p.email.toLowerCase() === cleanId;
      const matchAdmin = p.role === 'admin' && cleanId === 'admin';
      const expectedPass = p.password || (p.role === 'admin' ? 'admin' : '123');
      return (matchNis || matchEmail || matchAdmin) && cleanPass === expectedPass;
    });

    if (!user) {
      return { success: false, message: 'Identitas (NIS/Email) atau kata sandi tidak cocok.' };
    }
    if (!user.active) {
      return { success: false, message: 'Akun Anda dinonaktifkan oleh administrator sekolah.' };
    }

    return { success: true, user };
  }

  // --- Sites ---
  static getSite() {
    const sites = this.get().sites || [];
    return sites[0] || DEFAULT_DB.sites[0];
  }

  static updateSite(siteData) {
    const db = this.get();
    db.sites[0] = { ...db.sites[0], ...siteData };
    this.save(db);
    return db.sites[0];
  }

  // --- Attendance ---
  static getAttendance(filters = {}) {
    let list = this.get().attendance || [];
    if (filters.user_id) {
      list = list.filter(a => a.user_id === filters.user_id);
    }
    if (filters.type) {
      list = list.filter(a => a.type === filters.type);
    }
    if (filters.status) {
      list = list.filter(a => a.status === filters.status);
    }
    if (filters.date) {
      list = list.filter(a => a.server_time.startsWith(filters.date));
    }
    // Sort descending by time
    return list.sort((a, b) => new Date(b.server_time) - new Date(a.server_time));
  }

  static getTodayAttendance(userId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const userRecords = this.getAttendance({ user_id: userId, date: todayStr });
    return {
      in: userRecords.find(r => r.type === 'in'),
      out: userRecords.find(r => r.type === 'out')
    };
  }

  static addAttendance(record) {
    const db = this.get();
    // Validasi anti-duplikasi: hanya 1 'in' dan 1 'out' per hari per siswa (PRD FR-10)
    const recordDate = new Date(record.server_time).toISOString().split('T')[0];
    const exists = db.attendance.some(a => 
      a.user_id === record.user_id && 
      a.type === record.type && 
      a.server_time.startsWith(recordDate)
    );

    if (exists) {
      throw new Error(`Siswa sudah melakukan absen ${record.type === 'in' ? 'masuk' : 'pulang'} hari ini.`);
    }

    db.attendance.push(record);
    this.save(db);

    // Enqueue telegram notification if enabled
    this.createAttendanceNotification(record);

    return record;
  }

  static updateAttendanceStatus(id, newStatus, reviewNote = '') {
    const db = this.get();
    const idx = db.attendance.findIndex(a => a.id === id);
    if (idx !== -1) {
      db.attendance[idx].status = newStatus;
      db.attendance[idx].review_note = reviewNote;
      this.save(db);
      return db.attendance[idx];
    }
    return null;
  }

  static deleteAttendance(id) {
    const db = this.get();
    const idx = (db.attendance || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      const removed = db.attendance.splice(idx, 1)[0];
      if (db.notification_queue) {
        db.notification_queue = db.notification_queue.filter(n => n.attendance_id !== id);
      }
      this.save(db);
      return removed;
    }
    return null;
  }

  static resetTodayAttendance(userId = null) {
    const db = this.get();
    const todayStr = new Date().toISOString().split('T')[0];
    const initialCount = (db.attendance || []).length;
    
    db.attendance = (db.attendance || []).filter(a => {
      const isToday = a.server_time && a.server_time.startsWith(todayStr);
      if (userId) {
        return !(isToday && a.user_id === userId);
      }
      return !isToday;
    });

    this.save(db);
    return initialCount - db.attendance.length;
  }

  // --- Telegram & Guardians ---
  static getGuardians(studentId = null) {
    let list = this.get().guardians || [];
    if (studentId) {
      list = list.filter(g => g.student_id === studentId);
    }
    return list;
  }

  static addGuardian(guardian) {
    const db = this.get();
    db.guardians.push(guardian);
    this.save(db);
    return guardian;
  }

  static generateLinkCode(studentGuardianId) {
    const db = this.get();
    // Unique 6-character alphanumeric code
    const rawCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const codeHash = btoa(rawCode); // Simulated hash for client mock
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const newCode = {
      id: 'code-' + Date.now(),
      student_guardian_id: studentGuardianId,
      rawCode: rawCode,
      code_hash: codeHash,
      issued_at: new Date().toISOString(),
      expires_at: expiresAt,
      used_at: null,
      status: 'active',
      issued_by: 'admin'
    };

    if (!db.telegram_link_codes) db.telegram_link_codes = [];
    db.telegram_link_codes.push(newCode);
    this.save(db);

    return newCode;
  }

  static verifyAndLinkTelegram(rawCode, telegramChatId, telegramUsername = '') {
    const db = this.get();
    const codeItem = (db.telegram_link_codes || []).find(c => 
      c.rawCode === rawCode.trim().toUpperCase() && c.status === 'active'
    );

    if (!codeItem) {
      return { success: false, message: 'Kode penautan tidak valid atau sudah kedaluwarsa.' };
    }

    if (new Date() > new Date(codeItem.expires_at)) {
      codeItem.status = 'expired';
      this.save(db);
      return { success: false, message: 'Kode penautan sudah kedaluwarsa (berlaku 24 jam).' };
    }

    // Mark code used
    codeItem.status = 'used';
    codeItem.used_at = new Date().toISOString();

    // Link Guardian
    const guardian = db.guardians.find(g => g.id === codeItem.student_guardian_id);
    if (guardian) {
      guardian.telegram_chat_id = telegramChatId;
      guardian.telegram_username = telegramUsername || '@wali_' + telegramChatId.slice(-4);
      guardian.linked_at = new Date().toISOString();
      guardian.status = 'active';
    }

    this.save(db);
    return { success: true, guardian, message: 'Akun Telegram berhasil ditautkan!' };
  }

  static unlinkGuardianTelegram(guardianId, auditReason = 'Permintaan orang tua / admin') {
    const db = this.get();
    const guardian = db.guardians.find(g => g.id === guardianId);
    if (guardian) {
      guardian.telegram_chat_id = null;
      guardian.telegram_username = null;
      guardian.status = 'unlinked';
      guardian.unlink_audit = {
        unlinked_at: new Date().toISOString(),
        reason: auditReason
      };
      this.save(db);
      return guardian;
    }
    return null;
  }

  // --- Notifications ---
  static createAttendanceNotification(attendanceRecord) {
    const db = this.get();
    const guardians = this.getGuardians(attendanceRecord.user_id);
    const student = this.getProfileById(attendanceRecord.user_id);
    const site = this.getSite();

    if (!db.notification_queue) db.notification_queue = [];

    const formattedTime = new Date(attendanceRecord.server_time).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });
    const formattedDate = new Date(attendanceRecord.server_time).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const statusLabel = {
      'on_time': 'Tepat Waktu',
      'late': 'Terlambat',
      'outside_area': 'Di Luar Area (Menunggu Tinjauan)',
      'pending': 'Menunggu Persetujuan'
    }[attendanceRecord.status] || attendanceRecord.status;

    guardians.forEach(guardian => {
      const isLinked = !!guardian.telegram_chat_id;
      const queueItem = {
        id: 'ntf-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        user_id: attendanceRecord.user_id,
        attendance_id: attendanceRecord.id,
        student_guardian_id: guardian.id,
        channel: 'telegram',
        template: attendanceRecord.type === 'in' ? 'checkin' : 'checkout',
        to_chat_id: guardian.telegram_chat_id || 'UNLINKED',
        payload: {
          student_name: student?.full_name || 'Siswa',
          nis: student?.nis || '-',
          type: attendanceRecord.type === 'in' ? 'Masuk' : 'Pulang',
          time: formattedTime,
          date: formattedDate,
          status: statusLabel,
          school: site.name
          // Privasi PRD FR-38: Tidak mengirim koordinat GPS dan foto selfie ke Telegram
        },
        status: isLinked ? 'queued' : 'unlinked',
        attempts: 0,
        provider_message_id: null,
        error: isLinked ? null : 'Akun Telegram orang tua/wali belum ditautkan',
        created_at: new Date().toISOString(),
        sent_at: null
      };

      db.notification_queue.push(queueItem);
    });

    this.save(db);
  }

  static getNotificationQueue() {
    return (this.get().notification_queue || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  static processNotificationQueue() {
    const db = this.get();
    let sentCount = 0;
    (db.notification_queue || []).forEach(item => {
      if (item.status === 'queued') {
        item.attempts += 1;
        // Simulasi pengiriman via Telegram Bot API
        item.status = 'sent';
        item.provider_message_id = 'tg-' + Math.floor(Math.random() * 900000 + 100000);
        item.sent_at = new Date().toISOString();
        sentCount++;
      }
    });
    this.save(db);
    return sentCount;
  }

  // --- Leave Requests (Izin / Sakit) ---
  static getLeaveRequests(userId = null) {
    let list = this.get().leave_requests || [];
    if (userId) {
      list = list.filter(l => l.user_id === userId);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  static addLeaveRequest(req) {
    const db = this.get();
    if (!db.leave_requests) db.leave_requests = [];
    db.leave_requests.push(req);
    this.save(db);
    return req;
  }

  static updateLeaveRequest(id, status, reviewNote = '', reviewerId = 'adm-1') {
    const db = this.get();
    const item = (db.leave_requests || []).find(l => l.id === id);
    if (item) {
      item.status = status;
      item.review_note = reviewNote;
      item.reviewed_by = reviewerId;
      this.save(db);
      return item;
    }
    return null;
  }

  // --- Consents ---
  static getConsents(userId = null) {
    let list = this.get().consents || [];
    if (userId) {
      list = list.filter(c => c.user_id === userId);
    }
    return list;
  }

  static addConsent(consent) {
    const db = this.get();
    if (!db.consents) db.consents = [];
    db.consents.push(consent);
    this.save(db);
    return consent;
  }

  static clearConsents(userId) {
    const db = this.get();
    if (db.consents) {
      db.consents = db.consents.filter(c => c.user_id !== userId);
      this.save(db);
    }
  }
}

window.DB = DB;
