/**
 * LOGIN VIEW COMPONENT
 * Berdasarkan design(3).md & PRD V1.1
 * Bebas emoji, profesional, mendukung akun Siswa (NIS) dan Admin/Guru (Email/NIP).
 */

class LoginView {
  static currentTab = 'student'; // 'student' or 'admin'
  static errorMessage = '';

  static render(container) {
    const isProd = window.AppConfig && window.AppConfig.isProduction;

    container.innerHTML = `
      <div style="min-height: calc(100vh - 120px); display: flex; align-items: center; justify-content: center; padding: 20px 16px;">
        <div class="card panel-enter" style="width: 100%; max-width: 440px; box-shadow: var(--shadow-lg); border-top: 4px solid var(--primary-700);">
          
          <!-- School Identity Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 56px; height: 56px; margin: 0 auto 12px; background: var(--primary-50); color: var(--primary-800); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--primary-100);">
              ${Icons.schoolBadge(30)}
            </div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; letter-spacing: -0.3px;">
              ${window.AppConfig?.schoolName || 'SMAN 1 Teladan'}
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
              Sistem Presensi & Notifikasi Kehadiran Terpadu
            </p>
          </div>

          <!-- Role Selector Tabs -->
          <div style="display: flex; background: var(--surface-alt); border-radius: var(--radius-button); padding: 4px; margin-bottom: 20px; border: 1px solid var(--border);">
            <button 
              type="button" 
              class="btn btn-sm ${this.currentTab === 'student' ? 'btn-primary' : 'btn-secondary'}" 
              style="flex: 1; border: none; font-size: 0.82rem; min-height: 36px;"
              onclick="LoginView.setTab('student')"
            >
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.user(15)} Siswa (NIS)
              </span>
            </button>
            <button 
              type="button" 
              class="btn btn-sm ${this.currentTab === 'admin' ? 'btn-primary' : 'btn-secondary'}" 
              style="flex: 1; border: none; font-size: 0.82rem; min-height: 36px;"
              onclick="LoginView.setTab('admin')"
            >
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.building(15)} Admin / Guru
              </span>
            </button>
          </div>

          <!-- Error Alert Banner (jika login gagal) -->
          ${this.errorMessage ? `
            <div style="background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; padding: 10px 14px; border-radius: var(--radius-input); margin-bottom: 16px; font-size: 0.82rem; display: flex; align-items: flex-start; gap: 8px;">
              <span style="flex-shrink: 0; margin-top: 1px;">${Icons.alertTriangle(16)}</span>
              <span>${this.errorMessage}</span>
            </div>
          ` : ''}

          <!-- Form Login -->
          <form id="loginForm" onsubmit="LoginView.handleSubmit(event)">
            ${this.currentTab === 'student' ? `
              <div class="form-group">
                <label class="form-label form-label-required" for="loginIdentifier">
                  Nomor Induk Siswa (NIS)
                </label>
                <div style="position: relative;">
                  <input 
                    type="text" 
                    id="loginIdentifier" 
                    class="form-input" 
                    placeholder="Contoh: 1024" 
                    required 
                    autocomplete="username"
                    value="${isProd ? '' : '1024'}"
                  />
                </div>
                <span class="form-help">Masukkan NIS resmi yang terdaftar di buku induk sekolah.</span>
              </div>
            ` : `
              <div class="form-group">
                <label class="form-label form-label-required" for="loginIdentifier">
                  Email atau NIP Pengajar
                </label>
                <div style="position: relative;">
                  <input 
                    type="text" 
                    id="loginIdentifier" 
                    class="form-input" 
                    placeholder="Contoh: admin@sekolah.id" 
                    required 
                    autocomplete="username"
                    value="${isProd ? '' : 'admin@sekolah.id'}"
                  />
                </div>
                <span class="form-help">Gunakan alamat email dinas atau akun pengelola sekolah.</span>
              </div>
            `}

            <div class="form-group">
              <label class="form-label form-label-required" for="loginPassword">
                Kata Sandi
              </label>
              <input 
                type="password" 
                id="loginPassword" 
                class="form-input" 
                placeholder="Masukkan kata sandi" 
                required 
                autocomplete="current-password"
                value="${isProd ? '' : (this.currentTab === 'student' ? '123' : 'admin')}"
              />
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 8px;">
              <span style="display: inline-flex; align-items: center; gap: 8px;">
                ${Icons.logIn(18)} Masuk ke Sistem
              </span>
            </button>
          </form>

          <!-- Petunjuk Akun Pengujian (hanya tampil jika isProduction: false) -->
          ${!isProd ? `
            <div style="margin-top: 20px; padding: 12px; background: var(--surface-alt); border-radius: var(--radius-input); border: 1px dashed var(--border); font-size: 0.76rem; color: var(--text-muted); line-height: 1.5;">
              <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Informasi Kredensial Pengujian:</div>
              <div>&bull; Siswa: NIS <code>1024</code> / Kata Sandi <code>123</code></div>
              <div>&bull; Siswa Lain: NIS <code>1025</code> (Siti), <code>1026</code> (Ahmad)</div>
              <div>&bull; Admin: Email <code>admin@sekolah.id</code> / Sandi <code>admin</code></div>
            </div>
          ` : `
            <div style="margin-top: 20px; text-align: center; font-size: 0.76rem; color: var(--text-muted);">
              Lupa kata sandi? Hubungi Bagian Tata Usaha SMAN 1 Teladan.
            </div>
          `}

          <!-- Footer Regulasi UU PDP -->
          <div style="margin-top: 16px; text-align: center; font-size: 0.72rem; color: var(--text-muted);">
            Dilindungi Kebijakan Kerahasiaan Data Pribadi UU No. 27/2022
          </div>

        </div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById('loginIdentifier')?.focus();
    }, 100);
  }

  static setTab(tab) {
    this.currentTab = tab;
    this.errorMessage = '';
    const container = document.getElementById('appContent');
    if (container) {
      this.render(container);
    }
  }

  static handleSubmit(event) {
    event.preventDefault();
    const identifier = document.getElementById('loginIdentifier')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();

    if (!identifier || !password) {
      this.errorMessage = 'Harap isi seluruh kolom identitas dan kata sandi.';
      this.render(document.getElementById('appContent'));
      return;
    }

    const authResult = DB.authenticate(identifier, password);
    if (!authResult.success) {
      this.errorMessage = authResult.message;
      this.render(document.getElementById('appContent'));
      return;
    }

    // Login Berhasil
    this.errorMessage = '';
    App.login(authResult.user);
  }
}

window.LoginView = LoginView;
