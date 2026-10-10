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
  }

  static login(user) {
    this.currentUser = user;
    this.currentUserId = user.id;
    this.currentRole = user.role;
    localStorage.setItem('auth_user', JSON.stringify(user));

    this.renderHeaderControls();
    this.renderCurrentView();
    this.showToast('Selamat datang, ' + user.full_name, 'success');
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
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge ${this.currentRole === 'student' ? 'badge-info' : 'badge-admin'}">
            ${this.currentRole === 'student' ? 'Siswa' : 'Admin'}
          </span>
          <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${this.currentUser.full_name}
          </span>
          <button class="btn btn-sm btn-outline" style="padding: 2px 8px; font-size: 0.75rem; min-height: 26px; color: var(--danger); border-color: var(--danger);" onclick="App.logout()">
            Keluar
          </button>
        </div>
      `;
      return;
    }

    // Mode Pengujian / Demo: Sediakan switcher cepat untuk mempermudah evaluasi
    roleContainer.innerHTML = `
      <div class="role-switcher">
        <button class="role-btn ${this.currentRole === 'student' ? 'active' : ''}" onclick="App.switchRole('student')">
          Siswa
        </button>
        <button class="role-btn ${this.currentRole === 'admin' ? 'active' : ''}" onclick="App.switchRole('admin')">
          Admin
        </button>
      </div>

      <select class="test-select" id="userSwitcherSelect" onchange="App.switchUser(this.value)" style="margin-left: 6px;">
        <optgroup label="Akun Siswa">
          <option value="usr-1" ${this.currentUserId === 'usr-1' ? 'selected' : ''}>Siswa: Budi Santoso (XII-IPA-1)</option>
          <option value="usr-2" ${this.currentUserId === 'usr-2' ? 'selected' : ''}>Siswa: Siti Rahma (XII-IPA-1)</option>
          <option value="usr-3" ${this.currentUserId === 'usr-3' ? 'selected' : ''}>Siswa: Ahmad Fauzi (XII-IPS-2)</option>
        </optgroup>
        <optgroup label="Akun Admin">
          <option value="adm-1" ${this.currentUserId === 'adm-1' ? 'selected' : ''}>Admin: Hendra Wijaya, S.Pd</option>
        </optgroup>
      </select>

      <button class="btn btn-sm btn-outline" style="margin-left: 6px; padding: 2px 8px; font-size: 0.72rem; min-height: 24px; color: var(--danger); border-color: var(--danger);" onclick="App.logout()" title="Keluar ke Layar Login">
        Keluar
      </button>
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
  static openTelegramSimulatorModal() {
    const modal = document.createElement('div');
    modal.id = 'telegramSimulatorModal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 480px; height: 600px; display: flex; flex-direction: column;">
        <!-- Bot Header -->
        <div style="background: #2563EB; color: #FFF; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; border-radius: var(--radius-card) var(--radius-card) 0 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #EFF6FF; color: #1D4ED8; display: flex; align-items: center; justify-content: center;">
              ${Icons.send(18)}
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">Bot Kehadiran SMAN 1 Teladan</div>
              <div style="font-size: 0.75rem; opacity: 0.9;">Layanan Resmi Notifikasi Kehadiran</div>
            </div>
          </div>
          <button class="modal-close-btn" style="color: #FFF;" onclick="document.getElementById('telegramSimulatorModal').remove()">&times;</button>
        </div>

        <!-- Chat History Area -->
        <div id="tgChatMessages" style="flex: 1; padding: 16px; overflow-y: auto; background: #F8FAFC; display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem;">
          <div style="align-self: center; background: #E2E8F0; color: #475569; font-size: 0.72rem; padding: 3px 12px; border-radius: 12px; font-weight: 500;">
            Saluran Notifikasi Kehadiran Siswa
          </div>

          <div style="align-self: flex-start; background: #FFF; border: 1px solid #E2E8F0; padding: 12px 14px; border-radius: 12px; max-width: 85%; line-height: 1.45; color: #0F172A;">
Selamat datang di Layanan Notifikasi Kehadiran SMAN 1 Teladan.

Silakan masukkan <b>Kode Penautan 6-Karakter</b> (atau perintah <code>/start &lt;KODE&gt;</code>) yang diterbitkan pihak sekolah untuk menautkan akun ini ke data siswa.
          </div>
        </div>

        <!-- Chat Input Bar -->
        <div style="padding: 10px 14px; background: #FFF; border-top: 1px solid var(--border); display: flex; gap: 8px;">
          <input type="text" id="tgInputText" class="form-input" placeholder="Ketik kode (misal: 6XY7AB) atau /start..." onkeydown="if(event.key==='Enter') App.sendTelegramSimMessage()" />
          <button class="btn btn-primary" style="background: #2AABEE; border-color: #2AABEE;" onclick="App.sendTelegramSimMessage()">
            Kirim
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => document.getElementById('tgInputText')?.focus(), 100);
  }

  static sendTelegramSimMessage() {
    const input = document.getElementById('tgInputText');
    const chatBox = document.getElementById('tgChatMessages');
    if (!input || !chatBox) return;

    const text = input.value.trim();
    if (!text) return;

    // Append User Message
    const userMsg = document.createElement('div');
    userMsg.style.cssText = 'align-self: flex-end; background: #EEFFDE; padding: 8px 14px; border-radius: 14px 14px 4px 14px; max-width: 80%; box-shadow: 0 1px 2px rgba(0,0,0,0.1);';
    userMsg.textContent = text;
    chatBox.appendChild(userMsg);

    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // Simulate Bot Response
    setTimeout(() => {
      const result = TelegramService.simulateBotInteraction(text, '987654321');
      const botMsg = document.createElement('div');
      botMsg.style.cssText = 'align-self: flex-start; background: #FFF; padding: 10px 14px; border-radius: 14px 14px 14px 4px; max-width: 85%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); white-space: pre-wrap; line-height: 1.4;';
      botMsg.innerHTML = result.reply.replace(/\*(.*?)\*/g, '<b>$1</b>');
      chatBox.appendChild(botMsg);
      chatBox.scrollTop = chatBox.scrollHeight;

      App.renderCurrentView();
    }, 400);
  }
}

window.App = App;

// Bootstrap on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
