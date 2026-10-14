/**
 * STUDENT VIEWS (PWA Mobile Flow)
 * Berdasarkan design(3).md Wireframe A, B, C & PRD FR-4 s/d FR-12
 */

class StudentView {
  static cameraService = new CameraService();
  static currentStep = 1; // 1: Selfie, 2: Lokasi, 3: Konfirmasi
  static currentCheckinType = 'in'; // 'in' or 'out'
  static capturedPhoto = null;
  static locationData = null;

  static render(container, activeTab = 'beranda') {
    const student = DB.getProfileById(App.currentUserId) || DB.getProfiles().find(p => p.role === 'student');
    const site = DB.getSite();
    const todayRecords = DB.getTodayAttendance(student.id);
    const offlineQueue = OfflineService.getQueue().filter(q => q.user_id === student.id);

    let contentHtml = '';

    if (activeTab === 'beranda') {
      contentHtml = this.renderBeranda(student, site, todayRecords, offlineQueue);
    } else if (activeTab === 'riwayat') {
      contentHtml = this.renderRiwayat(student);
    } else if (activeTab === 'izin') {
      contentHtml = this.renderIzin(student);
    } else if (activeTab === 'profil') {
      contentHtml = this.renderProfil(student);
    }

    container.innerHTML = `
      <div class="student-frame dashboard-cascade-enter">
        ${contentHtml}
      </div>

      <!-- Bottom Navigation Bar (design(3).md Section 4 & Wireframe A) -->
      <nav class="bottom-nav cascade-item-4">
        <button class="bottom-nav-item ${activeTab === 'beranda' ? 'active' : ''}" onclick="App.setStudentTab('beranda')">
          <span class="bottom-nav-icon">${Icons.home(18)}</span>
          <span>Beranda</span>
        </button>
        <button class="bottom-nav-item ${activeTab === 'riwayat' ? 'active' : ''}" onclick="App.setStudentTab('riwayat')">
          <span class="bottom-nav-icon">${Icons.calendar(18)}</span>
          <span>Riwayat</span>
        </button>
        <button class="bottom-nav-item ${activeTab === 'izin' ? 'active' : ''}" onclick="App.setStudentTab('izin')">
          <span class="bottom-nav-icon">${Icons.fileText(18)}</span>
          <span>Izin & Sakit</span>
        </button>
        <button class="bottom-nav-item ${activeTab === 'profil' ? 'active' : ''}" onclick="App.setStudentTab('profil')">
          <span class="bottom-nav-icon">${Icons.user(18)}</span>
          <span>Profil</span>
        </button>
      </nav>
    `;

    // Bind real-time clock if on beranda
    if (activeTab === 'beranda') {
      this.startClock();
    }
  }

  static renderBeranda(student, site, today, offlineQueue) {
    const hasIn = !!today.in;
    const hasOut = !!today.out;
    const pendingOffline = offlineQueue.length > 0;

    const inTime = today.in ? new Date(today.in.server_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '--:--';
    const outTime = today.out ? new Date(today.out.server_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '--:--';

    return `
      <!-- Greeting Header -->
      <div class="card cascade-item-1" style="padding: 14px 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div style="min-width: 0;">
            <div style="font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Profil Siswa</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--primary-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${student.full_name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${student.class_name} • NIS: ${student.nis}</div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <span class="badge badge-info">${site.name}</span>
          </div>
        </div>
      </div>

      ${pendingOffline ? `
        <div class="card" style="background: var(--warning-bg); border-color: var(--warning-border); padding: 12px 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div style="font-size: 0.82rem; color: var(--warning); font-weight: 600;">
              Terdapat ${offlineQueue.length} data absen tersimpan di antrean perangkat (menunggu jaringan).
            </div>
            <button class="btn btn-sm btn-secondary" onclick="OfflineService.syncQueue(() => App.renderCurrentView())">Sinkronkan</button>
          </div>
        </div>
      ` : ''}

      <!-- Attendance Hero Card with Clock and Big Action Buttons (Wireframe A) -->
      <div class="attendance-hero-card cascade-item-2">
        <div class="live-time-display">
          <div>
            <div id="liveClock" class="live-time-clock tabular-nums">--:--:--</div>
            <div class="live-date-text">${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">BATAS MASUK</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary-800);">${site.time_in} WIB</div>
          </div>
        </div>

        <!-- Status Today Summary -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="status-today-box">
            <div class="status-label-group">
              <span class="status-title">Absen Masuk</span>
              <span class="status-value ${!hasIn ? 'empty' : ''}">${inTime}</span>
            </div>
            <div class="status-badge-wrap">
              ${today.in ? `<span class="badge badge-${today.in.status}">${today.in.status === 'on_time' ? 'Tepat Waktu' : today.in.status === 'approved' ? 'Hadir Sah' : today.in.status === 'rejected' ? 'Ditolak' : today.in.status === 'late' ? 'Terlambat' : 'Di Luar Area'}</span>` : '<span class="badge badge-neutral">Belum Absen</span>'}
            </div>
          </div>

          <div class="status-today-box">
            <div class="status-label-group">
              <span class="status-title">Absen Pulang</span>
              <span class="status-value ${!hasOut ? 'empty' : ''}">${outTime}</span>
            </div>
            <div class="status-badge-wrap">
              ${today.out ? `<span class="badge badge-success">Selesai</span>` : '<span class="badge badge-neutral">Belum Absen</span>'}
            </div>
          </div>
        </div>

        <!-- Big Action Buttons (Wireframe A) -->
        <div class="attendance-buttons-grid cascade-item-3">
          <button class="btn-hero-action btn-hero-in scale-press" ${hasIn ? 'disabled' : ''} onclick="StudentView.openCheckinModal('in')">
            <span class="hero-btn-icon" style="color: var(--primary-700);">${Icons.logIn(28)}</span>
            <span class="hero-btn-title">Absen Masuk</span>
            <span class="hero-btn-sub">${hasIn ? 'Sudah Tercatat' : 'Foto Wajah & Lokasi'}</span>
          </button>

          <button class="btn-hero-action btn-hero-out scale-press" ${hasOut ? 'disabled' : ''} onclick="StudentView.openCheckinModal('out')">
            <span class="hero-btn-icon" style="color: var(--text-secondary);">${Icons.logOut(28)}</span>
            <span class="hero-btn-title">Absen Pulang</span>
            <span class="hero-btn-sub">${hasOut ? 'Sudah Tercatat' : 'Foto Wajah & Lokasi'}</span>
          </button>
        </div>
      </div>

      <!-- Quick History Summary -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Riwayat Terakhir</span>
          <button class="btn btn-sm btn-outline" onclick="App.setStudentTab('riwayat')">Lihat Semua</button>
        </div>
        <div id="quickRecentHistory">
          ${this.renderRecentHistoryRows(student.id)}
        </div>
      </div>
    `;
  }

  static renderRecentHistoryRows(studentId) {
    const list = DB.getAttendance({ user_id: studentId }).slice(0, 3);
    if (list.length === 0) {
      return `<div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.88rem;">Belum ada riwayat absensi.</div>`;
    }

    return list.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${item.selfie_path}" alt="Selfie" style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border);" />
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">Absen ${item.type === 'in' ? 'Masuk' : 'Pulang'}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">${new Date(item.server_time).toLocaleDateString('id-ID')} • ${new Date(item.server_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
          </div>
        </div>
        <span class="badge badge-${item.status}">
          ${item.status === 'on_time' ? 'Tepat Waktu' : item.status === 'approved' ? 'Hadir Sah' : item.status === 'rejected' ? 'Ditolak' : item.status === 'late' ? 'Terlambat' : 'Di Luar Area'}
        </span>
      </div>
    `).join('');
  }

  static renderRiwayat(student) {
    const list = DB.getAttendance({ user_id: student.id });
    return `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Riwayat Absensi Siswa</span>
          <span class="badge badge-info">${list.length} Catatan</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${list.length === 0 ? '<div style="text-align: center; padding: 24px; color: var(--text-muted);">Belum ada riwayat absensi yang tercatat.</div>' : ''}
          ${list.map(item => `
            <div class="card" style="padding: 14px; background: var(--surface-alt); border-radius: var(--radius-input);">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <img src="${item.selfie_path}" alt="Selfie" style="width: 60px; height: 60px; border-radius: var(--radius-input); object-fit: cover; border: 1px solid var(--border);" />
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <span style="font-weight: 700; font-size: 0.95rem;">Absen ${item.type === 'in' ? 'Masuk' : 'Pulang'}</span>
                    <span class="badge badge-${item.status}">${item.status === 'on_time' ? 'Tepat Waktu' : item.status === 'approved' ? 'Hadir Sah' : item.status === 'rejected' ? 'Ditolak' : item.status === 'late' ? 'Terlambat' : 'Di Luar Area'}</span>
                  </div>
                  <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
                    Tanggal: ${new Date(item.server_time).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div style="font-size: 0.82rem; color: var(--text-secondary);">
                    Jam Server: <b>${new Date(item.server_time).toLocaleTimeString('id-ID')} WIB</b>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
                    Jarak: ${GeoService.formatDistance(item.distance_m)} • Akurasi GPS: ±${item.accuracy_m}m
                  </div>
                  ${item.outside_reason ? `<div style="font-size: 0.8rem; color: var(--warning); margin-top: 6px; background: #FFF; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--warning-border);">Alasan Luar Area: "${item.outside_reason}"</div>` : ''}
                  ${item.review_note ? `<div style="font-size: 0.8rem; color: var(--primary-900); margin-top: 6px; background: var(--primary-50); padding: 6px 8px; border-radius: 6px; border: 1px solid var(--primary-100);"><b>Catatan Verifikasi Admin:</b> ${item.review_note}</div>` : ''}
                  ${item.flags?.synced_from_offline ? `<div style="font-size: 0.75rem; color: var(--info); margin-top: 4px; font-weight: 600;">Status: Sinkronisasi Tertunda (Offline)</div>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  static renderIzin(student) {
    const list = DB.getLeaveRequests(student.id);
    return `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Pengajuan Izin & Sakit</span>
          <button class="btn btn-sm btn-primary scale-press" onclick="StudentView.openLeaveModal()">+ Ajukan Izin</button>
        </div>
        <p class="card-desc">Siswa yang mengajukan permohonan resmi tidak dihitung mangkir/alpa.</p>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          ${list.length === 0 ? `
            <div class="empty-state-box">
              <div class="empty-state-icon" style="color: var(--primary-600);">${Icons.fileText(28)}</div>
              <div class="empty-state-title">Belum Ada Pengajuan</div>
              <div class="empty-state-desc">Belum ada permohonan izin atau sakit yang diajukan. Klik tombol "+ Ajukan Izin" jika Anda berhalangan hadir.</div>
            </div>
          ` : ''}
          ${list.map(l => `
            <div class="card" style="padding: 14px; background: var(--surface-alt);">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem; color: ${l.type === 'sakit' ? 'var(--danger)' : 'var(--info)'};">
                  ${l.type === 'sakit' ? 'Sakit' : 'Izin'}
                </span>
                <span class="badge badge-${l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}">
                  ${l.status === 'approved' ? 'Disetujui' : l.status === 'rejected' ? 'Ditolak' : 'Menunggu Persetujuan'}
                </span>
              </div>
              <div style="font-size: 0.85rem; font-weight: 600; margin-top: 4px;">
                Tanggal: ${l.date_from} s/d ${l.date_to}
              </div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
                "${l.note}"
              </div>
              ${l.attachment_path ? `
                <div style="margin-top: 8px;">
                  <button type="button" class="btn btn-sm btn-outline scale-press" style="font-size: 0.78rem; display: inline-flex; align-items: center; gap: 6px;" onclick="StudentView.openAttachmentLightbox('${l.attachment_path.replace(/'/g, "\\'")}', 'Surat Keterangan (${l.type.toUpperCase()})')">
                    ${Icons.eye(14)} Lihat Lampiran Berkas
                  </button>
                </div>
              ` : ''}
              ${l.review_note ? `
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px; border-top: 1px dashed var(--border); padding-top: 6px;">
                  Catatan Guru: <i>${l.review_note}</i>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  static renderProfil(student) {
    const guardians = DB.getGuardians(student.id);
    const consents = DB.getConsents(student.id);

    return `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Profil Siswa</span>
          <span class="badge badge-success">Aktif</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 0.9rem;"><b>Nama Lengkap:</b> ${student.full_name}</div>
          <div style="font-size: 0.9rem;"><b>NIS:</b> ${student.nis}</div>
          <div style="font-size: 0.9rem;"><b>Kelas:</b> ${student.class_name}</div>
        </div>
      </div>

      <!-- Orang Tua / Wali Card -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Data Orang Tua / Wali</span>
        </div>
        ${guardians.map(g => `
          <div style="padding: 10px; background: var(--surface-alt); border-radius: var(--radius-sm); margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 0.9rem;">${g.guardian_name}</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">Kontak: ${g.guardian_contact || '-'}</div>
            <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.8rem;">Status Telegram:</span>
              <span class="badge ${g.telegram_chat_id ? 'badge-success' : 'badge-neutral'}">
                ${g.telegram_chat_id ? 'Tertaut (' + g.telegram_username + ')' : 'Belum Ditautkan'}
              </span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Persetujuan Digital Orang Tua Card (PRD FR-25 s/d 30) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Persetujuan Digital (UU PDP)</span>
          <button class="btn btn-sm btn-outline scale-press" onclick="ConsentView.openModal('${student.id}')">
            ${consents.length > 0 ? 'Kelola Izin' : 'Buka Formulir'}
          </button>
        </div>
        <p class="card-desc">Sesuai UU Perlindungan Data Pribadi No. 27/2022, pemrosesan data kamera, lokasi, dan notifikasi wajib mengantongi persetujuan orang tua/wali.</p>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 10px;">
          <div class="consent-summary-row">
            <span>Kamera & Geolokasi</span>
            <span class="badge ${consents.some(c => c.scope === 'camera_location') ? 'badge-success' : 'badge-neutral'}">
              ${consents.some(c => c.scope === 'camera_location') ? 'Disetujui' : 'Belum Ada'}
            </span>
          </div>
          <div class="consent-summary-row">
            <span>Notifikasi Bot Telegram</span>
            <span class="badge ${consents.some(c => c.scope === 'telegram_notification') ? 'badge-success' : 'badge-neutral'}">
              ${consents.some(c => c.scope === 'telegram_notification') ? 'Disetujui' : 'Belum Ada'}
            </span>
          </div>
          <div class="consent-summary-row">
            <span>Vektor Wajah Biometrik</span>
            <span class="badge ${consents.some(c => c.scope === 'face') ? 'badge-success' : 'badge-neutral'}">
              ${consents.some(c => c.scope === 'face') ? 'Disetujui' : 'Belum (Rilis 2)'}
            </span>
          </div>
        </div>
      </div>

      <!-- Tombol Keluar dari Akun Siswa -->
      <div class="card" style="border: 1px solid var(--border); padding: 14px;">
        <button class="btn btn-outline btn-block" style="color: var(--danger); border-color: var(--danger); display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="App.logout()">
          ${Icons.logOut(18)}
          <span>Keluar dari Akun Siswa</span>
        </button>
      </div>
    `;
  }

  static startClock() {
    const updateTime = () => {
      const el = document.getElementById('liveClock');
      if (el) {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      }
    };
    updateTime();
    clearInterval(this.clockInterval);
    this.clockInterval = setInterval(updateTime, 1000);
  }

  // --- Checkin Modal Flow (Wireframe B & C) ---
  static async openCheckinModal(type) {
    this.currentCheckinType = type;
    this.capturedPhoto = null;
    this.locationData = null;

    const modal = document.createElement('div');
    modal.id = 'checkinModal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">Absensi ${type === 'in' ? 'Masuk' : 'Pulang'}</div>
          <button class="modal-close-btn" onclick="StudentView.closeCheckinModal()">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Stepper Guide (design(3).md Wireframe B) -->
          <div class="checkin-stepper" aria-label="Alur langkah presensi">
            <div class="checkin-step-pill active" id="stepPill1">
              <span class="step-num" id="stepNum1">1</span>
              <span class="step-text">Foto Wajah</span>
            </div>
            <div class="checkin-step-connector" id="stepConn1"></div>
            <div class="checkin-step-pill" id="stepPill2">
              <span class="step-num" id="stepNum2">2</span>
              <span class="step-text">Lokasi GPS</span>
            </div>
            <div class="checkin-step-connector" id="stepConn2"></div>
            <div class="checkin-step-pill" id="stepPill3">
              <span class="step-num" id="stepNum3">3</span>
              <span class="step-text">Konfirmasi</span>
            </div>
          </div>

          <!-- Camera Container -->
          <div id="cameraViewArea">
            <div class="camera-container">
              <div id="cameraShutterFlash" class="camera-shutter-flash"></div>
              <video id="selfieVideo" class="camera-video" autoplay playsinline muted></video>
              <canvas id="selfieCanvas" class="camera-canvas" style="display: none;"></canvas>
              
              <!-- Circular Face Guide -->
              <div id="cameraOverlayGuide" class="camera-overlay">
                <div class="face-guide-circle face-guide-oval"></div>
                <div class="camera-guide-text">Posisikan wajah Anda di dalam lingkaran</div>
              </div>
            </div>

            <!-- Camera Controls -->
            <div style="display: flex; gap: 10px; margin-top: 12px;">
              <button id="btnCapturePhoto" class="btn btn-primary btn-block scale-press" onclick="StudentView.captureSelfie()">
                ${Icons.camera(18)} Ambil Foto
              </button>
              <button id="btnRetakePhoto" class="btn btn-secondary btn-block scale-press" style="display: none;" onclick="StudentView.retakeSelfie()">
                ${Icons.refresh(18)} Ulangi Foto
              </button>
            </div>
          </div>

          <!-- Location Status Section (Wireframe B) -->
          <div class="location-card">
            <div class="location-row">
              <div class="location-indicator">
                <div id="locDot" class="location-dot active"></div>
                <div>
                  <div id="locTitle" style="font-weight: 700; font-size: 0.88rem;">Mencari lokasi GPS...</div>
                  <div id="locSub" style="font-size: 0.78rem; color: var(--text-secondary);">Memeriksa jarak ke titik sekolah</div>
                </div>
              </div>
              <button class="btn btn-sm btn-outline scale-press" onclick="StudentView.refreshLocation()">Coba Lagi</button>
            </div>

            <!-- Outside Area Reason Input (Wajib jika di luar radius, PRD FR-8) -->
            <div id="outsideAreaWarningBox" class="outside-area-warning-wrap">
              <div class="outside-area-warning-inner">
                <div style="background: var(--warning-bg); border: 1px solid var(--warning-border); padding: 10px 12px; border-radius: var(--radius-input); font-size: 0.82rem; color: var(--warning);">
                  <b>Perangkat di luar radius sekolah.</b> Absensi tetap dapat dikirim dengan menyertakan alasan yang sah untuk ditinjau oleh pihak sekolah.
                </div>
                <div class="form-group" style="margin-top: 2px;">
                  <label class="form-label form-label-required">Alasan Berada di Luar Radius</label>
                  <textarea id="outsideReasonInput" class="form-textarea" placeholder="Contoh: Mengikuti kegiatan sekolah di luar kampus / Kendala teknis di gerbang" rows="2"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="StudentView.closeCheckinModal()">Batal</button>
          <button id="btnSubmitCheckin" class="btn btn-primary scale-press" disabled onclick="StudentView.submitCheckin()">
            Kirim Absensi
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close when tapping outside modal-content (backdrop click)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        StudentView.closeCheckinModal();
      }
    });

    // Initialize Camera & Location
    const videoEl = document.getElementById('selfieVideo');
    await this.cameraService.startCamera(videoEl);
    await this.refreshLocation();
  }

  static updateStepperState() {
    const p1 = document.getElementById('stepPill1');
    const p2 = document.getElementById('stepPill2');
    const p3 = document.getElementById('stepPill3');
    const c1 = document.getElementById('stepConn1');
    const c2 = document.getElementById('stepConn2');
    const n1 = document.getElementById('stepNum1');
    const n2 = document.getElementById('stepNum2');
    const n3 = document.getElementById('stepNum3');
    if (!p1 || !p2 || !p3) return;

    const hasPhoto = !!this.capturedPhoto;
    const hasLoc = !!this.locationData;

    // Reset classes
    p1.className = 'checkin-step-pill';
    p2.className = 'checkin-step-pill';
    p3.className = 'checkin-step-pill';
    c1?.classList.remove('completed');
    c2?.classList.remove('completed');

    // Step 1: Foto Wajah
    if (hasPhoto) {
      p1.classList.add('completed');
      if (n1) n1.innerHTML = Icons.check ? Icons.check(12) : '✓';
      c1?.classList.add('completed');
    } else {
      p1.classList.add('active');
      if (n1) n1.textContent = '1';
    }

    // Step 2: Lokasi GPS
    if (hasLoc) {
      p2.classList.add('completed');
      if (n2) n2.innerHTML = Icons.check ? Icons.check(12) : '✓';
      c2?.classList.add('completed');
    } else if (hasPhoto) {
      p2.classList.add('active');
      if (n2) n2.textContent = '2';
    } else {
      if (n2) n2.textContent = '2';
    }

    // Step 3: Konfirmasi Presensi
    if (hasPhoto && hasLoc) {
      p3.classList.add('active');
    }
  }

  static captureSelfie() {
    const student = DB.getProfileById(App.currentUserId);
    const canvasEl = document.getElementById('selfieCanvas');
    const videoEl = document.getElementById('selfieVideo');
    const guideOverlay = document.getElementById('cameraOverlayGuide');
    const shutter = document.getElementById('cameraShutterFlash');

    // Tactile camera shutter flash feedback
    if (shutter) {
      shutter.classList.remove('flash-active');
      void shutter.offsetWidth; // Force reflow
      shutter.classList.add('flash-active');
    }

    this.capturedPhoto = this.cameraService.capturePhoto(canvasEl, student?.full_name);

    videoEl.style.display = 'none';
    guideOverlay.style.display = 'none';
    canvasEl.style.display = 'block';

    document.getElementById('btnCapturePhoto').style.display = 'none';
    document.getElementById('btnRetakePhoto').style.display = 'inline-flex';

    this.updateStepperState();
    this.validateFormReadiness();
  }

  static retakeSelfie() {
    const canvasEl = document.getElementById('selfieCanvas');
    const videoEl = document.getElementById('selfieVideo');
    const guideOverlay = document.getElementById('cameraOverlayGuide');

    this.capturedPhoto = null;
    canvasEl.style.display = 'none';
    videoEl.style.display = 'block';
    guideOverlay.style.display = 'flex';

    document.getElementById('btnCapturePhoto').style.display = 'inline-flex';
    document.getElementById('btnRetakePhoto').style.display = 'none';

    this.updateStepperState();
    this.validateFormReadiness();
  }

  static async refreshLocation() {
    const locDot = document.getElementById('locDot');
    const locTitle = document.getElementById('locTitle');
    const locSub = document.getElementById('locSub');
    const outsideBox = document.getElementById('outsideAreaWarningBox');

    locTitle.textContent = 'Mencari lokasi GPS...';
    locSub.textContent = 'Memeriksa akurasi & radius sekolah';
    locDot.className = 'location-dot active';

    try {
      const site = DB.getSite();
      this.locationData = await GeoService.getCurrentLocation(site);

      if (this.locationData.isInsideRadius) {
        locDot.className = 'location-dot active';
        locTitle.textContent = 'Lokasi Valid (Dalam Radius)';
        locSub.textContent = `Jarak: ${GeoService.formatDistance(this.locationData.distance_m)} dari ${site.name} (Akurasi: ±${this.locationData.accuracy_m}m)`;
        outsideBox?.classList.remove('visible');
      } else {
        locDot.className = 'location-dot warning';
        locTitle.textContent = 'Di Luar Radius Sekolah';
        locSub.textContent = `Jarak: ${GeoService.formatDistance(this.locationData.distance_m)} (Batas: ${site.radius_m}m)`;
        outsideBox?.classList.add('visible');
      }
    } catch (err) {
      locDot.className = 'location-dot warning';
      locTitle.textContent = 'Gagal Mengambil Lokasi';
      locSub.textContent = err.message;
      outsideBox?.classList.remove('visible');
    }

    this.updateStepperState();
    this.validateFormReadiness();
  }

  static validateFormReadiness() {
    const btnSubmit = document.getElementById('btnSubmitCheckin');
    const isPhotoReady = !!this.capturedPhoto;
    const isLocationReady = !!this.locationData;

    let canSubmit = isPhotoReady && isLocationReady;
    if (btnSubmit) {
      btnSubmit.disabled = !canSubmit;
    }
  }

  static async submitCheckin() {
    const btnSubmit = document.getElementById('btnSubmitCheckin');
    btnSubmit.classList.add('btn-loading');

    const student = DB.getProfileById(App.currentUserId);
    const site = DB.getSite();
    const isInside = this.locationData.isInsideRadius;
    const outsideReasonEl = document.getElementById('outsideReasonInput');
    const outsideReason = outsideReasonEl ? outsideReasonEl.value.trim() : '';

    // Validasi alasan jika di luar radius (PRD FR-8)
    if (!isInside && !outsideReason) {
      btnSubmit.classList.remove('btn-loading');
      App.showToast('Wajib mengisi alasan jika berada di luar radius sekolah!', 'error');
      outsideReasonEl?.focus();
      return;
    }

    // Hitung status ketepatan waktu (PRD FR-9)
    const now = new Date();
    let status = 'on_time';

    if (this.currentCheckinType === 'in') {
      const [limitH, limitM] = site.time_in.split(':').map(Number);
      const limitMinutes = limitH * 60 + limitM + site.late_tolerance_min;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      if (currentMinutes > limitMinutes) {
        status = 'late';
      }
    }

    if (!isInside) {
      status = 'outside_area'; // Status antrean tinjauan admin
    }

    const attendanceRecord = {
      id: 'att-' + Date.now(),
      user_id: student.id,
      site_id: site.id,
      type: this.currentCheckinType,
      server_time: now.toISOString(),
      device_time: now.toISOString(),
      lat: this.locationData.lat,
      lng: this.locationData.lng,
      accuracy_m: this.locationData.accuracy_m,
      distance_m: this.locationData.distance_m,
      selfie_path: this.capturedPhoto,
      outside_reason: !isInside ? outsideReason : null,
      status: status,
      flags: {
        accuracy_warning: this.locationData.accuracy_m > 50
      },
      created_at: now.toISOString()
    };

    try {
      // Cek apakah offline
      if (!OfflineService.isOnline()) {
        OfflineService.addToQueue(attendanceRecord);
        this.closeCheckinModal();
        this.showSuccessConfirmation(attendanceRecord, true);
      } else {
        if (typeof TelegramService !== 'undefined') {
          try {
            await TelegramService.syncBotUpdates();
          } catch (e) {
            console.warn('Sync updates before checkin error:', e);
          }
        }
        DB.addAttendance(attendanceRecord);
        if (typeof TelegramService !== 'undefined') {
          await TelegramService.runWorker().catch(e => console.error('Telegram worker error:', e));
        }
        this.closeCheckinModal();
        this.showSuccessConfirmation(attendanceRecord, false);
      }

      App.renderCurrentView();
    } catch (err) {
      btnSubmit.classList.remove('btn-loading');
      App.showToast(err.message, 'error');
    }
  }

  static closeCheckinModal() {
    this.cameraService.stopCamera();
    const modal = document.getElementById('checkinModal');
    if (modal) modal.remove();
  }

  // --- Success Confirmation Modal (design(3).md Wireframe C) ---
  static showSuccessConfirmation(record, isOffline = false) {
    const guardians = DB.getGuardians(record.user_id);
    const hasLinkedGuardian = guardians.some(g => !!g.telegram_chat_id);

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content" style="text-align: center; max-width: 440px;">
        <div class="modal-body" style="padding: 28px 24px;">
          <div class="success-pop-icon">
            ${Icons.checkCircle(32)}
          </div>
          
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
            Absensi Berhasil ${isOffline ? 'Disimpan Lokal' : 'Dicatat'}
          </div>
          
          <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">
            Absen ${record.type === 'in' ? 'Masuk' : 'Pulang'} • <b>${new Date(record.server_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</b>
          </div>

          <!-- Detail Card -->
          <div class="success-detail-card">
            <div class="success-detail-row">
              <span class="detail-label">Status Presensi</span>
              <span class="badge badge-${record.status}">${record.status === 'on_time' ? 'Tepat Waktu' : record.status === 'late' ? 'Terlambat' : 'Di Luar Area (Menunggu Tinjauan)'}</span>
            </div>
            <div class="success-detail-row">
              <span class="detail-label">Jarak ke Sekolah</span>
              <span class="detail-value">${GeoService.formatDistance(record.distance_m)}</span>
            </div>
            ${isOffline ? `
            <div class="success-detail-row">
              <span class="detail-label">Antrean Sinkronisasi</span>
              <span class="badge badge-warning">Tersimpan di Perangkat (Offline)</span>
            </div>
            ` : ''}
            
            <div class="success-telegram-badge ${hasLinkedGuardian ? 'linked' : 'unlinked'}">
              <div class="telegram-badge-icon">${Icons.send(16)}</div>
              <div>
                <div class="telegram-badge-title">Notifikasi Telegram Wali</div>
                <div class="telegram-badge-desc">
                  ${hasLinkedGuardian
        ? 'Otomatis terkirim ke Telegram orang tua / wali murid.'
        : 'Akun Telegram wali belum ditautkan (Absensi tetap sah).'}
                </div>
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-block scale-press" style="margin-top: 20px;" onclick="this.closest('.modal-backdrop').remove()">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // --- Modal Pengajuan Izin / Sakit (PRD FR-31 s/d FR-36) ---
  static _currentLeaveFile = null;

  static openLeaveModal() {
    this._currentLeaveFile = null;
    const todayIso = new Date().toISOString().split('T')[0];

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'leaveModalBackdrop';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <div class="modal-title">Ajukan Izin atau Sakit</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">PRD FR-31 s/d FR-36 • Ketidakhadiran Resmi Siswa</div>
          </div>
          <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Segmented Type Selector -->
          <div class="form-group">
            <label class="form-label form-label-required">Jenis Pengajuan</label>
            <div class="segmented-control">
              <button type="button" id="leaveTypeSakit" class="segmented-btn active" onclick="StudentView.selectLeaveType('sakit')">Sakit</button>
              <button type="button" id="leaveTypeIzin" class="segmented-btn" onclick="StudentView.selectLeaveType('izin')">Izin</button>
            </div>
            <input type="hidden" id="leaveType" value="sakit" />
            <div id="leaveTypeHelp" class="form-help" style="margin-top: 6px;">
              Lampirkan surat keterangan dokter dari puskesmas, klinik, atau rumah sakit resmi.
            </div>
          </div>

          <!-- Date Range & Dynamic Duration -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label form-label-required" style="margin-bottom: 0;">Rentang Tanggal</label>
              <span id="leaveDurationPill" class="date-duration-pill">Durasi: 1 Hari</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 4px;">Mulai</span>
                <input type="date" id="leaveDateFrom" class="form-input" value="${todayIso}" onchange="StudentView.onLeaveDateChange()" />
              </div>
              <div>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 4px;">Sampai</span>
                <input type="date" id="leaveDateTo" class="form-input" value="${todayIso}" onchange="StudentView.onLeaveDateChange()" />
              </div>
            </div>
          </div>

          <!-- Reason / Note -->
          <div class="form-group">
            <label class="form-label form-label-required">Alasan / Penjelasan</label>
            <textarea id="leaveNote" class="form-textarea" rows="3" placeholder="Tuliskan alasan jelas atau diagnosa dokter..."></textarea>
          </div>

          <!-- File Dropzone & Client-side 300KB Validation -->
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" style="margin-bottom: 0;">Unggah Surat Keterangan / Bukti</label>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Maks. 300 KB</span>
            </div>

            <input type="file" id="leaveAttachmentInput" accept="image/*,.pdf" style="display: none;" onchange="StudentView.handleLeaveFileSelect(this)" />

            <div id="leaveDropzone" class="file-dropzone" onclick="document.getElementById('leaveAttachmentInput').click()" ondragover="StudentView.handleDropzoneDragOver(event)" ondragleave="StudentView.handleDropzoneDragLeave(event)" ondrop="StudentView.handleDropzoneDrop(event)">
              <div class="file-dropzone-icon">
                ${Icons.upload(20)}
              </div>
              <div>
                <div class="file-dropzone-title">Pilih atau seret berkas surat ke sini</div>
                <div class="file-dropzone-sub">Format JPG, PNG, atau PDF (maksimal 300 KB)</div>
              </div>
            </div>

            <div id="leaveFileError" class="file-dropzone-error-msg" style="display: none;"></div>
            <div id="leaveFilePreview" style="display: none;"></div>

            <span class="form-help" style="margin-top: 6px; display: block;">PRD FR-35: Data kesehatan disimpan terenkripsi privat dan hanya dapat dibuka oleh guru pembina / admin sekolah.</span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary scale-press" onclick="this.closest('.modal-backdrop').remove()">Batal</button>
          <button type="button" id="btnSubmitLeave" class="btn btn-primary scale-press" onclick="StudentView.submitLeaveRequest(this)">Kirim Pengajuan</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static selectLeaveType(type) {
    const hiddenInput = document.getElementById('leaveType');
    const btnSakit = document.getElementById('leaveTypeSakit');
    const btnIzin = document.getElementById('leaveTypeIzin');
    const helpText = document.getElementById('leaveTypeHelp');

    if (hiddenInput) hiddenInput.value = type;

    if (type === 'sakit') {
      btnSakit?.classList.add('active');
      btnIzin?.classList.remove('active');
      if (helpText) {
        helpText.textContent = 'Lampirkan surat keterangan dokter dari puskesmas, klinik, atau rumah sakit resmi.';
      }
    } else {
      btnIzin?.classList.add('active');
      btnSakit?.classList.remove('active');
      if (helpText) {
        helpText.textContent = 'Lampirkan surat permohonan izin bertanda tangan orang tua/wali atau surat tugas resmi.';
      }
    }
  }

  static onLeaveDateChange() {
    const fromInput = document.getElementById('leaveDateFrom');
    const toInput = document.getElementById('leaveDateTo');
    const pill = document.getElementById('leaveDurationPill');
    if (!fromInput || !toInput || !pill) return;

    if (toInput.value < fromInput.value) {
      toInput.value = fromInput.value;
    }

    const d1 = new Date(fromInput.value);
    const d2 = new Date(toInput.value);
    const diffTime = d2.getTime() - d1.getTime();
    const days = Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)) + 1);

    pill.textContent = `Durasi: ${days} Hari`;
  }

  static handleLeaveFileSelect(input) {
    const file = input.files && input.files[0];
    if (file) {
      this.processLeaveFile(file);
    }
  }

  static handleDropzoneDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('leaveDropzone')?.classList.add('drag-active');
  }

  static handleDropzoneDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('leaveDropzone')?.classList.remove('drag-active');
  }

  static handleDropzoneDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('leaveDropzone')?.classList.remove('drag-active');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      this.processLeaveFile(file);
    }
  }

  static processLeaveFile(file) {
    const dropzone = document.getElementById('leaveDropzone');
    const errEl = document.getElementById('leaveFileError');
    const prevEl = document.getElementById('leaveFilePreview');
    const submitBtn = document.getElementById('btnSubmitLeave');

    const maxBytes = 300 * 1024;
    if (file.size > maxBytes) {
      const sizeKb = (file.size / 1024).toFixed(1);
      dropzone?.classList.add('has-error');
      if (errEl) {
        errEl.style.display = 'flex';
        errEl.textContent = `Ukuran berkas (${sizeKb} KB) melebihi batas maksimal 300 KB (PRD FR-35). Harap perkecil ukuran foto/dokumen Anda.`;
      }
      if (prevEl) prevEl.style.display = 'none';
      this._currentLeaveFile = null;
      if (submitBtn) submitBtn.disabled = true;
      App.showToast(`Ukuran berkas melebihi 300 KB (${sizeKb} KB)`, 'error');
      return;
    }

    dropzone?.classList.remove('has-error');
    if (errEl) errEl.style.display = 'none';
    if (submitBtn) submitBtn.disabled = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      this._currentLeaveFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: e.target.result
      };
      this.renderLeaveFilePreview();
    };
    reader.readAsDataURL(file);
  }

  static renderLeaveFilePreview() {
    const item = this._currentLeaveFile;
    const prevEl = document.getElementById('leaveFilePreview');
    const dropzone = document.getElementById('leaveDropzone');
    if (!item || !prevEl) return;

    const isImg = item.type.startsWith('image/') || item.dataUrl.startsWith('data:image');
    const sizeKb = (item.size / 1024).toFixed(1);

    prevEl.innerHTML = `
      <div class="file-preview-card">
        <div class="file-preview-main">
          ${isImg
        ? `<img src="${item.dataUrl}" class="file-preview-thumb" alt="Thumbnail" onclick="StudentView.openAttachmentLightbox('${item.dataUrl.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')" title="Klik untuk lihat pratinjau penuh" />`
        : `<div class="file-preview-doc-icon">${Icons.fileText(20)}<span>PDF</span></div>`
      }
          <div class="file-preview-info">
            <div class="file-preview-name" title="${item.name}">${item.name}</div>
            <div class="file-preview-meta">
              <span>${sizeKb} KB</span>
              <span>•</span>
              <span style="color: var(--success); font-weight: 600;">Siap diunggah</span>
            </div>
          </div>
        </div>
        <button type="button" class="file-preview-remove-btn scale-press" onclick="StudentView.removeLeaveFile()">
          ${Icons.trash(14)}
          <span>Hapus</span>
        </button>
      </div>
    `;

    prevEl.style.display = 'block';
    if (dropzone) dropzone.style.display = 'none';
  }

  static removeLeaveFile() {
    this._currentLeaveFile = null;
    const input = document.getElementById('leaveAttachmentInput');
    if (input) input.value = '';

    const prevEl = document.getElementById('leaveFilePreview');
    if (prevEl) {
      prevEl.innerHTML = '';
      prevEl.style.display = 'none';
    }

    const dropzone = document.getElementById('leaveDropzone');
    if (dropzone) {
      dropzone.style.display = 'flex';
      dropzone.classList.remove('has-error');
    }

    const errEl = document.getElementById('leaveFileError');
    if (errEl) errEl.style.display = 'none';

    const submitBtn = document.getElementById('btnSubmitLeave');
    if (submitBtn) submitBtn.disabled = false;
  }

  static openAttachmentLightbox(url, title = 'Surat Keterangan') {
    if (!url) {
      App.showToast('Lampiran berkas tidak tersedia atau telah dihapus!', 'error');
      return;
    }

    this.closeAttachmentLightbox();

    const isPdf = typeof url === 'string' && (url.includes('application/pdf') || url.toLowerCase().endsWith('.pdf'));

    const modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.id = 'attachmentLightbox';
    modal.innerHTML = `
      <div class="lightbox-card">
        <div class="lightbox-header">
          <div class="lightbox-title">
            ${Icons.fileText(18)}
            <span>${title}</span>
          </div>
          <button class="modal-close-btn" onclick="StudentView.closeAttachmentLightbox()">&times;</button>
        </div>
        <div class="lightbox-body">
          ${isPdf
        ? `<iframe src="${url}" class="lightbox-iframe" style="width: 100%; height: 65vh; border: none; border-radius: 6px; background: #FFF;"></iframe>`
        : `<img src="${url}" class="lightbox-img" alt="${title}" />`
      }
        </div>
        <div class="lightbox-footer">
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 500;">
            PRD FR-35 • Dokumen Resmi Siswa
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="${url}" download="${(title || 'lampiran-surat').toLowerCase().replace(/[^a-z0-9]/g, '_')}" class="btn btn-sm btn-outline scale-press" style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.download(15)} Unduh Berkas
            </a>
            <button class="btn btn-sm btn-secondary scale-press" onclick="StudentView.closeAttachmentLightbox()">Tutup</button>
          </div>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        StudentView.closeAttachmentLightbox();
      }
    });

    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        StudentView.closeAttachmentLightbox();
        window.removeEventListener('keydown', keyHandler);
      }
    };
    window.addEventListener('keydown', keyHandler);

    document.body.appendChild(modal);
  }

  static closeAttachmentLightbox() {
    const el = document.getElementById('attachmentLightbox');
    if (el) el.remove();
  }

  static submitLeaveRequest(btn) {
    const type = document.getElementById('leaveType')?.value || 'sakit';
    const dateFrom = document.getElementById('leaveDateFrom')?.value;
    const dateTo = document.getElementById('leaveDateTo')?.value;
    const note = document.getElementById('leaveNote')?.value?.trim();

    if (!note) {
      App.showToast('Harap tuliskan keterangan atau alasan pengajuan!', 'error');
      document.getElementById('leaveNote')?.focus();
      return;
    }

    let attachmentPath = null;
    if (this._currentLeaveFile) {
      if (this._currentLeaveFile.size > 300 * 1024) {
        App.showToast('Ukuran berkas melebihi batas maksimal 300 KB!', 'error');
        return;
      }
      attachmentPath = this._currentLeaveFile.dataUrl;
    }

    DB.addLeaveRequest({
      id: 'lev-' + Date.now(),
      user_id: App.currentUserId,
      type: type,
      date_from: dateFrom,
      date_to: dateTo,
      note: note,
      attachment_path: attachmentPath,
      status: 'pending',
      reviewed_by: null,
      review_note: null,
      created_at: new Date().toISOString()
    });

    this._currentLeaveFile = null;
    btn.closest('.modal-backdrop')?.remove();
    App.showToast('Pengajuan berhasil dikirim dan menunggu verifikasi guru!', 'success');
    App.renderCurrentView();
  }
}

window.StudentView = StudentView;

