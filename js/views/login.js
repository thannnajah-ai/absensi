/**
 * LOGIN VIEW COMPONENT
 * Inspirasi Dribbble: Fluid Aurora, Split-Screen EduTech, Levitation Badge,
 * Sliding Pill Role Tabs, Morphing Submit Button, dan Micro-Interactions
 */

class LoginView {
  static currentTab = 'student'; // 'student' or 'admin'
  static errorMessage = '';
  static clockTimer = null;
  static isPasswordVisible = false;

  static render(container) {
    const isProd = window.AppConfig && window.AppConfig.isProduction;

    container.innerHTML = `
      <div class="login-page-wrapper panel-enter">
        <div class="login-split-card" id="loginSplitCard">
          
          <!-- PANEL KIRI: Aurora Showcase & Identitas Sekolah -->
          <div class="login-hero-panel">
            <div class="aurora-container">
              <div class="aurora-orb aurora-orb-1"></div>
              <div class="aurora-orb aurora-orb-2"></div>
              <div class="aurora-orb aurora-orb-3"></div>
            </div>

            <div class="login-hero-content">
              <div class="login-hero-badge">
                ${Icons.schoolBadge(36)}
              </div>
              <h1 class="login-hero-title">
                ${window.AppConfig?.schoolName || 'SMAN 1 Teladan'}
              </h1>
              <p class="login-hero-desc">
                Portal Presensi Terpadu dengan Verifikasi Wajah, Waktu Server & Geofencing GPS.
              </p>

              <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px; font-size: 0.82rem; color: #E2E8F0;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #38BDF8;">${Icons.camera(16)}</span>
                  <span>Kamera Selfie Anti-Spoofing & Geofencing GPS</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #818CF8;">${Icons.send(16)}</span>
                  <span>Notifikasi Otomatis ke Telegram Orang Tua / Wali</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #34D399;">${Icons.shieldCheck(16)}</span>
                  <span>Kepatuhan Kerahasiaan Data Pribadi UU No. 27/2022</span>
                </div>
              </div>
            </div>

            <!-- Jam Server Dinamis & Indikator Status -->
            <div class="login-hero-footer">
              <div class="hero-clock-card">
                <div class="hero-clock-left">
                  <div class="hero-clock-dot"></div>
                  <div>
                    <div class="hero-clock-label">Waktu Resmi Server</div>
                    <div class="hero-clock-time" id="heroClockTime">--:--:-- WIB</div>
                  </div>
                </div>
                <div style="font-size: 0.72rem; color: #94A3B8; text-align: right;">
                  <span style="color: #10B981; font-weight: 700;">Online</span><br/>
                  <span>Sinkron Presisi</span>
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL KANAN: Formulir Login Glassmorphism -->
          <div class="login-form-panel login-form-stagger">
            <div style="margin-bottom: 22px;">
              <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; letter-spacing: -0.3px;">
                Masuk ke Sistem
              </h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
                Pilih peran dan masukkan kredensial resmi Anda.
              </p>
            </div>

            <!-- Tab Peran dengan Sliding Pill -->
            <div class="role-tabs-wrapper">
              <div class="role-sliding-pill ${this.currentTab === 'admin' ? 'slide-right' : ''}" id="roleSlidingPill"></div>
              <button 
                type="button" 
                class="role-tab-btn ${this.currentTab === 'student' ? 'active' : ''}"
                id="btnRoleStudent"
                onclick="LoginView.setTab('student')"
              >
                ${Icons.user(16)} <span>Siswa (NIS)</span>
              </button>
              <button 
                type="button" 
                class="role-tab-btn ${this.currentTab === 'admin' ? 'active' : ''}"
                id="btnRoleAdmin"
                onclick="LoginView.setTab('admin')"
              >
                ${Icons.building(16)} <span>Admin / Guru</span>
              </button>
            </div>

            <!-- Error Banner -->
            <div id="loginErrorBanner" style="display: ${this.errorMessage ? 'flex' : 'none'}; background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; padding: 10px 14px; border-radius: var(--radius-input); margin-bottom: 16px; font-size: 0.82rem; align-items: flex-start; gap: 8px;">
              <span style="flex-shrink: 0; margin-top: 1px;">${Icons.alertTriangle(16)}</span>
              <span id="loginErrorText">${this.errorMessage}</span>
            </div>

            <!-- Form -->
            <form id="loginForm" onsubmit="LoginView.handleSubmit(event)">
              <div class="login-input-group">
                <label class="form-label form-label-required" id="labelIdentifier" for="loginIdentifier">
                  ${this.currentTab === 'student' ? 'Nomor Induk Siswa (NIS)' : 'Email atau NIP Pengajar'}
                </label>
                <div class="login-input-wrapper">
                  <input 
                    type="text" 
                    id="loginIdentifier" 
                    class="login-input-field" 
                    placeholder="${this.currentTab === 'student' ? 'Contoh: 1024' : 'Contoh: admin@sekolah.id'}" 
                    required 
                    autocomplete="username"
                    value="${isProd ? '' : (this.currentTab === 'student' ? '1024' : 'admin@sekolah.id')}"
                  />
                  <div class="login-input-icon-btn" style="pointer-events: none;" id="identifierIcon">
                    ${this.currentTab === 'student' ? Icons.user(18) : Icons.building(18)}
                  </div>
                </div>
                <span class="form-help" id="helpIdentifier">
                  ${this.currentTab === 'student' ? 'Masukkan NIS resmi yang terdaftar di buku induk sekolah.' : 'Gunakan alamat email dinas atau akun pengelola sekolah.'}
                </span>
              </div>

              <div class="login-input-group">
                <label class="form-label form-label-required" for="loginPassword">
                  Kata Sandi
                </label>
                <div class="login-input-wrapper">
                  <input 
                    type="${this.isPasswordVisible ? 'text' : 'password'}" 
                    id="loginPassword" 
                    class="login-input-field" 
                    placeholder="Masukkan kata sandi" 
                    required 
                    autocomplete="current-password"
                    value="${isProd ? '' : (this.currentTab === 'student' ? '123' : 'admin')}"
                  />
                  <button 
                    type="button" 
                    class="login-input-icon-btn" 
                    onclick="LoginView.togglePassword()" 
                    title="Tampilkan / Sembunyikan Kata Sandi"
                    id="btnTogglePassword"
                  >
                    ${this.isPasswordVisible ? Icons.eyeOff(18) : Icons.eye(18)}
                  </button>
                </div>
              </div>

              <!-- Morphing Button -->
              <button type="submit" id="btnLoginSubmit" class="btn-login-submit">
                <span class="btn-label" style="display: inline-flex; align-items: center; gap: 8px;">
                  ${Icons.logIn(18)} Masuk ke Sistem
                </span>
                <div class="btn-login-spinner"></div>
                <div class="btn-login-checkmark">
                  ${Icons.checkCircle(24)}
                </div>
              </button>
            </form>

            <!-- Kredensial Pengujian -->
            ${!isProd ? `
              <div style="margin-top: 20px; padding: 12px 14px; background: #F8FAFC; border-radius: var(--radius-input); border: 1px dashed var(--border); font-size: 0.76rem; color: var(--text-muted); line-height: 1.5;">
                <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Informasi Kredensial Pengujian:</div>
                <div>&bull; Siswa: NIS <code>1024</code> / Sandi <code>123</code> (Budi Santoso)</div>
                <div>&bull; Siswa Lain: NIS <code>1025</code> (Siti), <code>1026</code> (Ahmad)</div>
                <div>&bull; Admin: Email <code>admin@sekolah.id</code> / Sandi <code>admin</code></div>
              </div>
            ` : `
              <div style="margin-top: 20px; text-align: center; font-size: 0.76rem; color: var(--text-muted);">
                Lupa kata sandi? Hubungi Bagian Tata Usaha SMAN 1 Teladan.
              </div>
            `}

            <div style="margin-top: 16px; text-align: center; font-size: 0.72rem; color: var(--text-muted);">
              Dilindungi Kebijakan Kerahasiaan Data Pribadi UU No. 27/2022
            </div>
          </div>

        </div>
      </div>
    `;

    this.startLiveClock();
    setTimeout(() => {
      document.getElementById('loginIdentifier')?.focus();
    }, 150);
  }

  static startLiveClock() {
    if (this.clockTimer) clearInterval(this.clockTimer);
    const update = () => {
      const el = document.getElementById('heroClockTime');
      if (el) {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      }
    };
    update();
    this.clockTimer = setInterval(update, 1000);
  }

  static setTab(tab) {
    this.currentTab = tab;
    this.errorMessage = '';
    const errBanner = document.getElementById('loginErrorBanner');
    if (errBanner) errBanner.style.display = 'none';

    const pill = document.getElementById('roleSlidingPill');
    const btnStudent = document.getElementById('btnRoleStudent');
    const btnAdmin = document.getElementById('btnRoleAdmin');
    const labelId = document.getElementById('labelIdentifier');
    const inputId = document.getElementById('loginIdentifier');
    const iconId = document.getElementById('identifierIcon');
    const helpId = document.getElementById('helpIdentifier');
    const passInput = document.getElementById('loginPassword');
    const isProd = window.AppConfig && window.AppConfig.isProduction;

    if (tab === 'admin') {
      pill?.classList.add('slide-right');
      btnStudent?.classList.remove('active');
      btnAdmin?.classList.add('active');
      if (labelId) labelId.textContent = 'Email atau NIP Pengajar';
      if (inputId) {
        inputId.placeholder = 'Contoh: admin@sekolah.id';
        if (!isProd && (!inputId.value || inputId.value === '1024')) inputId.value = 'admin@sekolah.id';
      }
      if (iconId) iconId.innerHTML = Icons.building(18);
      if (helpId) helpId.textContent = 'Gunakan alamat email dinas atau akun pengelola sekolah.';
      if (passInput && !isProd && (!passInput.value || passInput.value === '123')) passInput.value = 'admin';
    } else {
      pill?.classList.remove('slide-right');
      btnAdmin?.classList.remove('active');
      btnStudent?.classList.add('active');
      if (labelId) labelId.textContent = 'Nomor Induk Siswa (NIS)';
      if (inputId) {
        inputId.placeholder = 'Contoh: 1024';
        if (!isProd && (!inputId.value || inputId.value === 'admin@sekolah.id')) inputId.value = '1024';
      }
      if (iconId) iconId.innerHTML = Icons.user(18);
      if (helpId) helpId.textContent = 'Masukkan NIS resmi yang terdaftar di buku induk sekolah.';
      if (passInput && !isProd && (!passInput.value || passInput.value === 'admin')) passInput.value = '123';
    }
  }

  static togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
    const input = document.getElementById('loginPassword');
    const btn = document.getElementById('btnTogglePassword');
    if (input) {
      input.type = this.isPasswordVisible ? 'text' : 'password';
    }
    if (btn) {
      btn.innerHTML = this.isPasswordVisible ? Icons.eyeOff(18) : Icons.eye(18);
    }
  }

  static handleSubmit(event) {
    event.preventDefault();
    const identifier = document.getElementById('loginIdentifier')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();
    const card = document.getElementById('loginSplitCard');
    const btn = document.getElementById('btnLoginSubmit');
    const errBanner = document.getElementById('loginErrorBanner');
    const errText = document.getElementById('loginErrorText');

    if (!identifier || !password) {
      this.triggerShake();
      if (errBanner && errText) {
        errText.textContent = 'Harap isi seluruh kolom identitas dan kata sandi.';
        errBanner.style.display = 'flex';
      }
      return;
    }

    // Morphing: Mulai animasi loading spinner
    if (btn) {
      btn.classList.add('state-loading');
      btn.disabled = true;
    }
    if (errBanner) errBanner.style.display = 'none';

    // Jeda autentikasi yang mantap (850ms) agar putaran loading spinner terlihat berirama
    setTimeout(() => {
      const authResult = DB.authenticate(identifier, password);

      if (!authResult.success) {
        // Gagal login: kembalikan tombol & goyangkan form
        if (btn) {
          btn.classList.remove('state-loading');
          btn.disabled = false;
        }
        this.triggerShake();
        if (errBanner && errText) {
          errText.textContent = authResult.message;
          errBanner.style.display = 'flex';
        }
        return;
      }

      // Berhasil login: Morphing tombol ke green checkmark circle
      if (btn) {
        btn.classList.remove('state-loading');
        btn.classList.add('state-success');
      }

      // Tahan centang hijau selama 550ms agar mata pengguna nyaman melihat konfirmasi berhasil
      setTimeout(() => {
        this.showWelcomeTransition(authResult.user);
      }, 550);
    }, 850);
  }

  static showWelcomeTransition(user) {
    const roleLabel = user.role === 'admin' 
      ? 'Administrator / Tenaga Pendidik' 
      : (user.class_name ? `${user.class_name} • NIS: ${user.nis}` : 'Siswa SMAN 1 Teladan');

    const overlay = document.createElement('div');
    overlay.className = 'welcome-transition-overlay';
    overlay.id = 'welcomeTransitionOverlay';
    overlay.innerHTML = `
      <div class="welcome-transition-card" id="welcomeTransitionCard">
        <div class="welcome-badge-icon">
          ${Icons.schoolBadge(36)}
        </div>
        <div class="welcome-auth-pill">
          ${Icons.checkCircle(14)}
          <span>Autentikasi Terverifikasi</span>
        </div>
        <h2 class="welcome-name-title">
          Selamat Datang, ${user.full_name}
        </h2>
        <div class="welcome-meta-sub">
          ${roleLabel}
        </div>
        <div class="welcome-progress-track">
          <div class="welcome-progress-bar" id="welcomeProgressBar"></div>
        </div>
        <div class="welcome-status-hint" id="welcomeStatusHint">
          Menyiapkan beranda presensi...
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 1. Munculkan overlay dan kartu secara bersamaan dengan kurva pegas halus
    requestAnimationFrame(() => {
      overlay.classList.add('overlay-visible');
      const card = document.getElementById('welcomeTransitionCard');
      card?.classList.add('card-visible');
    });

    // 2. Mulai animasi bilah progres setelah kartu mendarat secara anggun (200ms)
    setTimeout(() => {
      const bar = document.getElementById('welcomeProgressBar');
      if (bar) bar.style.width = '100%';
    }, 200);

    // 3. Saat progres mendekati penuh (1150ms), ubah teks status menjadi siap
    setTimeout(() => {
      const hint = document.getElementById('welcomeStatusHint');
      if (hint) {
        hint.style.color = '#10B981';
        hint.textContent = 'Presensi siap! Membuka beranda...';
      }
    }, 1150);

    // 4. KUNCI KEHALUSAN (Crossfade Handover): Render dashboard di latar belakang terlebih dahulu
    setTimeout(() => {
      if (this.clockTimer) clearInterval(this.clockTimer);
      
      // Render dashboard sekarang di DOM (masih tertutup lapisan overlay, sehingga bebas kedipan/flash)
      App.login(user, true);

      // 5. Beri jeda 40ms agar browser selesai menata tata letak (layout reflow)
      setTimeout(() => {
        const card = document.getElementById('welcomeTransitionCard');
        card?.classList.add('card-exit');
        overlay.classList.add('overlay-fade-out');

        // 6. Hapus overlay dari DOM setelah animasi memudar selesai (280ms)
        setTimeout(() => {
          overlay.remove();
        }, 280);
      }, 40);
    }, 1420);
  }

  static triggerShake() {
    const card = document.getElementById('loginSplitCard');
    if (card) {
      card.classList.remove('shake-card');
      void card.offsetWidth;
      card.classList.add('shake-card');
      setTimeout(() => card.classList.remove('shake-card'), 500);
    }
  }
}

window.LoginView = LoginView;
