/**
 * MAIN APP CONTROLLER & ROUTER
 * Berdasarkan design(3).md & PRD Versi 1.1
 */

class App {
  static currentUser = null;
  static currentRole = 'guest'; // 'student', 'admin', or 'guest'
  static currentUserId = null;
  static currentStudentTab = 'beranda';

  static init() {
    // 1. Terapkan konfigurasi mode produksi jika aktif
    const isProd = window.AppConfig && window.AppConfig.isProduction;
    const demoToolbar = document.getElementById('demoToolbar');
    if (demoToolbar) {
      demoToolbar.style.display = isProd ? 'none' : 'flex';
    }

    // 2. Muat sesi login tersimpan
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        this.currentUserId = this.currentUser ? this.currentUser.id : null;
        this.currentRole = this.currentUser ? this.currentUser.role : 'guest';
      } else if (!isProd) {
        // Mode demo awal: login otomatis sebagai Budi Santoso untuk kemudahan evaluasi
        this.currentUser = DB.getProfileById('usr-1');
        this.currentUserId = 'usr-1';
        this.currentRole = 'student';
        localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      } else {
        this.currentUser = null;
        this.currentUserId = null;
        this.currentRole = 'guest';
      }
    } catch (e) {
      this.currentUser = null;
      this.currentRole = 'guest';
    }

    this.renderHeaderControls();
    this.renderCurrentView();

    // Register Service Worker untuk PWA Offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration note:', err);
      });
    }

    // Auto-sync notifikasi & penautan Telegram otomatis di background
    if (typeof TelegramService !== 'undefined') {
      TelegramService.syncBotUpdates();
      setInterval(() => {
        TelegramService.syncBotUpdates();
      }, 8000);
    }

    // Auto-sync data dengan Supabase Cloud jika terkonfigurasi
    if (typeof SupabaseService !== 'undefined' && SupabaseService.isConfigured()) {
      SupabaseService.checkConnection().then(conn => {
        if (conn.ok && typeof DB !== 'undefined') {
          DB.syncFromSupabase();
        }
      });
    }
  }

  static login(user, silentToast = false) {
    this.currentUser = user;
    this.currentUserId = user.id;
    this.currentRole = user.role;
    localStorage.setItem('auth_user', JSON.stringify(user));

    this.renderHeaderControls();
    this.renderCurrentView();
    if (!silentToast) {
      this.showToast('Selamat datang, ' + user.full_name, 'success');
    }
  }

  static logout() {
    this.currentUser = null;
    this.currentUserId = null;
    this.currentRole = 'guest';
    localStorage.removeItem('auth_user');

    this.renderHeaderControls();
    this.renderCurrentView();
    this.showToast('Anda telah keluar dari sistem.', 'info');
  }

  static renderHeaderControls() {
    const roleContainer = document.getElementById('headerRoleControls');
    if (!roleContainer) return;

    const isProd = window.AppConfig && window.AppConfig.isProduction;

    // Jika pengguna belum login
    if (!this.currentUser) {
      roleContainer.innerHTML = `
        <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">
          ${window.AppConfig?.schoolName || 'SMAN 1 Teladan'}
        </span>
      `;
      return;
    }

    // Jika Mode Produksi Aktif: Tampilkan identitas resmi dan tombol keluar (tanpa switcher demo)
    if (isProd) {
      roleContainer.innerHTML = `
        <div class="header-user-badge-wrap">
          <span class="badge ${this.currentRole === 'student' ? 'badge-info' : 'badge-admin'}">
            ${this.currentRole === 'student' ? 'Siswa' : 'Admin'}
          </span>
          <span class="header-user-name" title="${this.currentUser.full_name}">
            ${this.currentUser.full_name}
          </span>
          <button class="btn btn-sm btn-outline header-logout-btn" onclick="App.logout()" title="Keluar dari akun" aria-label="Keluar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span class="logout-text">Keluar</span>
          </button>
        </div>
      `;
      return;
    }

    // Mode Pengujian / Demo: Sediakan switcher cepat untuk mempermudah evaluasi
    roleContainer.innerHTML = `
      <div class="header-user-badge-wrap">
        <div class="role-switcher">
          <button class="role-btn ${this.currentRole === 'student' ? 'active' : ''}" onclick="App.switchRole('student')">
            Siswa
          </button>
          <button class="role-btn ${this.currentRole === 'admin' ? 'active' : ''}" onclick="App.switchRole('admin')">
            Admin
          </button>
        </div>

        <select class="test-select header-user-select" id="userSwitcherSelect" onchange="App.switchUser(this.value)">
          <optgroup label="Akun Siswa">
            <option value="usr-1" ${this.currentUserId === 'usr-1' ? 'selected' : ''}>Budi (XII-IPA-1)</option>
            <option value="usr-2" ${this.currentUserId === 'usr-2' ? 'selected' : ''}>Siti (XII-IPA-1)</option>
            <option value="usr-3" ${this.currentUserId === 'usr-3' ? 'selected' : ''}>Ahmad (XII-IPS-2)</option>
          </optgroup>
          <optgroup label="Akun Admin">
            <option value="adm-1" ${this.currentUserId === 'adm-1' ? 'selected' : ''}>Admin Hendra</option>
          </optgroup>
        </select>

        <button class="btn btn-sm btn-outline header-logout-btn" onclick="App.logout()" title="Keluar ke Layar Login" aria-label="Keluar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span class="logout-text">Keluar</span>
        </button>
      </div>
    `;
  }

  static switchRole(role) {
    this.currentRole = role;
    if (role === 'admin') {
      this.currentUserId = 'adm-1';
      this.currentUser = DB.getProfileById('adm-1');
    } else {
      this.currentUserId = 'usr-1';
      this.currentUser = DB.getProfileById('usr-1');
    }
    if (this.currentUser) {
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    }
    this.renderHeaderControls();
    this.renderCurrentView();
  }

  static switchUser(userId) {
    this.currentUserId = userId;
    const user = DB.getProfileById(userId);
    if (user) {
      this.currentUser = user;
      this.currentRole = user.role;
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
    this.renderHeaderControls();
    this.renderCurrentView();
  }

  static setStudentTab(tab) {
    this.currentStudentTab = tab;
    this.renderCurrentView();
  }

  static renderCurrentView() {
    const content = document.getElementById('appContent');
    if (!content) return;

    if (!this.currentUser) {
      LoginView.render(content);
      return;
    }

    if (this.currentRole === 'student') {
      StudentView.render(content, this.currentStudentTab);
    } else {
      AdminView.render(content);
    }
  }

  static showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <span style="cursor: pointer; opacity: 0.7;" onclick="this.parentElement.remove()">&times;</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- Testing Simulator Toolbar Handlers ---
  static setMockGpsMode(mode) {
    GeoService.mockMode = mode;
    this.showToast(`Mode Lokasi diubah: ${mode.toUpperCase()}`, 'info');
  }

  static toggleOfflineSimulation(checkbox) {
    OfflineService.isOfflineSimulated = checkbox.checked;
    if (checkbox.checked) {
      this.showToast('Mode offline aktif. Data disimpan di antrean perangkat.', 'warning');
    } else {
      this.showToast('Koneksi terhubung. Menyinkronkan antrean...', 'success');
      OfflineService.syncQueue((count) => {
        this.showToast(`Berhasil menyinkronkan ${count} absensi ke server.`, 'success');
        this.renderCurrentView();
      });
    }
    this.renderCurrentView();
  }

  // --- Interactive Telegram Bot Simulator Modal ---
  static openTelegramSimulatorModal(prefillCode = '') {
    const existing = document.getElementById('telegramSimulatorModal');
    if (existing) existing.remove();

    const botUser = window.AppConfig?.telegramBotUsername || 'AbsenM3INBot';
    const messages = TelegramService.getSimulatedMessages();

    const modal = document.createElement('div');
    modal.id = 'telegramSimulatorModal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="tg-modal-card">
        <!-- Bot Header -->
        <div class="tg-header">
          <div class="tg-bot-info">
            <div class="tg-avatar">
              ${Icons.send(18)}
            </div>
            <div>
              <div class="tg-name">@${botUser}</div>
              <div class="tg-status">
                <span class="tg-status-dot"></span>
                <span>Bot Resmi Presensi SMAN 1 Teladan</span>
              </div>
            </div>
          </div>
          <button class="modal-close-btn" style="color: #FFF;" onclick="document.getElementById('telegramSimulatorModal').remove()">&times;</button>
        </div>

        <!-- Chat History Area -->
        <div id="tgChatMessages" class="tg-messages-box">
          <div class="tg-date-badge">Hari Ini</div>
          ${messages.map(m => `
            <div class="tg-msg-bubble ${m.sender === 'user' ? 'tg-msg-user' : 'tg-msg-bot'}">
              <span>${m.text.replace(/\*(.*?)\*/g, '<b>$1</b>')}</span>
              <span class="tg-msg-time">
                ${m.time || ''}
                ${m.sender === 'user' ? ' ✓✓' : ''}
              </span>
            </div>
          `).join('')}
        </div>

        <!-- Quick Action Chips -->
        <div class="tg-quick-bar">
          <button type="button" class="tg-chip" onclick="App.setTelegramInput('/start')">/start</button>
          <button type="button" class="tg-chip" onclick="App.setTelegramInput('/start 6XY7AB')">Contoh Kode</button>
          <button type="button" class="tg-chip" style="color: var(--danger); margin-left: auto;" onclick="App.clearTelegramChat()">Bersihkan Chat</button>
        </div>

        <!-- Chat Input Bar -->
        <div class="tg-input-bar">
          <input type="text" id="tgInputText" class="tg-input-field" placeholder="Ketik pesan atau /start <KODE>..." value="${prefillCode}" onkeydown="if(event.key==='Enter') App.sendTelegramSimMessage()" />
          <button class="tg-send-btn scale-press" onclick="App.sendTelegramSimMessage()" title="Kirim">
            ${Icons.send(16)}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => {
      const input = document.getElementById('tgInputText');
      if (input) {
        input.focus();
        if (prefillCode) input.select();
      }
      const chatBox = document.getElementById('tgChatMessages');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }, 80);
  }

  static setTelegramInput(val) {
    const input = document.getElementById('tgInputText');
    if (input) {
      input.value = val;
      input.focus();
    }
  }

  static clearTelegramChat() {
    TelegramService.clearSimulatedMessages();
    const chatBox = document.getElementById('tgChatMessages');
    if (chatBox) {
      chatBox.innerHTML = `
        <div class="tg-date-badge">Hari Ini</div>
        <div class="tg-msg-bubble tg-msg-bot">
          <span>Riwayat obrolan telah dibersihkan. Silakan masukkan <b>Kode Penautan 6-Karakter</b> untuk menautkan akun wali murid.</span>
          <span class="tg-msg-time">${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `;
    }
  }

  static sendTelegramSimMessage() {
    const input = document.getElementById('tgInputText');
    const chatBox = document.getElementById('tgChatMessages');
    if (!input || !chatBox) return;

    const text = input.value.trim();
    if (!text) return;

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Append User Message immediately
    const userMsg = document.createElement('div');
    userMsg.className = 'tg-msg-bubble tg-msg-user';
    userMsg.innerHTML = `<span>${text}</span><span class="tg-msg-time">${nowTime} ✓✓</span>`;
    chatBox.appendChild(userMsg);

    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // Simulate Bot Response
    setTimeout(() => {
      const result = TelegramService.simulateBotInteraction(text, '987654321');
      const botTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const botMsg = document.createElement('div');
      botMsg.className = 'tg-msg-bubble tg-msg-bot';
      botMsg.innerHTML = `<span>${result.reply.replace(/\*(.*?)\*/g, '<b>$1</b>')}</span><span class="tg-msg-time">${botTime}</span>`;
      chatBox.appendChild(botMsg);
      chatBox.scrollTop = chatBox.scrollHeight;

      App.renderCurrentView();
    }, 350);
  }

  static appendLiveTelegramMessage(rawText) {
    const chatBox = document.getElementById('tgChatMessages');
    if (!chatBox) return;

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const botMsg = document.createElement('div');
    botMsg.className = 'tg-msg-bubble tg-msg-bot';
    botMsg.innerHTML = `<span>${rawText.replace(/\*(.*?)\*/g, '<b>$1</b>')}</span><span class="tg-msg-time">${nowTime}</span>`;
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

window.App = App;

// Bootstrap on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
