/**
 * ADMIN DASHBOARD VIEWS
 * Berdasarkan design(3).md Section 4, 5.5, 5.6, Wireframe E & PRD FR-13 s/d FR-17
 */

class AdminView {
  static currentTab = 'ringkasan';
  static currentFilterClass = 'all';
  static currentFilterStatus = 'all';
  static searchQuery = '';

  static render(container) {
    const pendingReviewCount = this.getPendingReviewCount();

    container.innerHTML = `
      <div class="admin-layout panel-enter">
        <!-- Sidebar Navigation (design(3).md Section 4 & Wireframe E) -->
        <aside class="admin-sidebar">
          <div style="padding: 10px 14px; font-weight: 800; font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Menu Manajemen
          </div>

          <button class="admin-nav-item ${this.currentTab === 'ringkasan' ? 'active' : ''}" onclick="AdminView.setTab('ringkasan')">
            <span>${Icons.barChart(18)}</span>
            <span>Ringkasan</span>
          </button>

          <button class="admin-nav-item ${this.currentTab === 'rekap' ? 'active' : ''}" onclick="AdminView.setTab('rekap')">
            <span>${Icons.fileText(18)}</span>
            <span>Rekap Absensi</span>
          </button>

          <button class="admin-nav-item ${this.currentTab === 'tinjauan' ? 'active' : ''}" onclick="AdminView.setTab('tinjauan')">
            <span>${Icons.checkSquare(18)}</span>
            <span>Tinjauan</span>
            ${pendingReviewCount > 0 ? `<span class="admin-nav-badge">${pendingReviewCount}</span>` : ''}
          </button>

          <button class="admin-nav-item ${this.currentTab === 'siswa' ? 'active' : ''}" onclick="AdminView.setTab('siswa')">
            <span>${Icons.users(18)}</span>
            <span>Siswa & Kelas</span>
          </button>

          <button class="admin-nav-item ${this.currentTab === 'wali' ? 'active' : ''}" onclick="AdminView.setTab('wali')">
            <span>${Icons.user(18)}</span>
            <span>Orang Tua/Wali</span>
          </button>

          <button class="admin-nav-item ${this.currentTab === 'telegram' ? 'active' : ''}" onclick="AdminView.setTab('telegram')">
            <span>${Icons.send(18)}</span>
            <span>Notifikasi Telegram</span>
          </button>

          <button class="admin-nav-item ${this.currentTab === 'lokasi' ? 'active' : ''}" onclick="AdminView.setTab('lokasi')">
            <span>${Icons.building(18)}</span>
            <span>Lokasi & Jadwal</span>
          </button>

          <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border);">
            <button class="admin-nav-item" style="color: var(--danger); width: 100%; display: flex; align-items: center; gap: 8px;" onclick="App.logout()">
              <span>${Icons.logOut(18)}</span>
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="admin-main">
          ${this.renderActiveTabContent()}
        </main>
      </div>
    `;

    // Initialize map if on 'lokasi' tab
    if (this.currentTab === 'lokasi') {
      setTimeout(() => this.initSiteMap(), 100);
    }
  }

  static setTab(tab) {
    this.currentTab = tab;
    App.renderCurrentView();
  }

  static getPendingReviewCount() {
    const outsideArea = DB.getAttendance().filter(a => a.status === 'outside_area').length;
    const pendingLeave = DB.getLeaveRequests().filter(l => l.status === 'pending').length;
    return outsideArea + pendingLeave;
  }

  static renderActiveTabContent() {
    switch (this.currentTab) {
      case 'ringkasan': return this.renderRingkasan();
      case 'rekap': return this.renderRekap();
      case 'tinjauan': return this.renderTinjauan();
      case 'siswa': return this.renderSiswa();
      case 'wali': return this.renderWali();
      case 'telegram': return this.renderTelegram();
      case 'lokasi': return this.renderLokasi();
      default: return this.renderRingkasan();
    }
  }

  // --- TAB 1: Ringkasan (Overview) ---
  static renderRingkasan() {
    const allAttendance = DB.getAttendance();
    const students = DB.getProfiles().filter(p => p.role === 'student');
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = allAttendance.filter(a => a.server_time.startsWith(todayStr) && a.type === 'in');

    const totalHadir = todayAttendance.length;
    const tepatWaktu = todayAttendance.filter(a => a.status === 'on_time').length;
    const terlambat = todayAttendance.filter(a => a.status === 'late').length;
    const luarArea = todayAttendance.filter(a => a.status === 'outside_area').length;
    const belumHadir = Math.max(0, students.length - totalHadir);

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary);">Dashboard Ringkasan Hari Ini</h1>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <button class="btn btn-primary" onclick="AdminView.setTab('rekap')">Lihat Rekap Lengkap</button>
        </div>

        <!-- Metric Grid (design(3).md Section 5.5) -->
        <div class="metric-grid">
          <div class="metric-card">
            <span class="metric-card-title">Total Hadir Hari Ini</span>
            <span class="metric-card-value" style="color: var(--primary-700);">${totalHadir} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;">/ ${students.length} Siswa</span></span>
            <span class="metric-card-desc">Absensi masuk tercatat di server</span>
          </div>

          <div class="metric-card">
            <span class="metric-card-title">Tepat Waktu</span>
            <span class="metric-card-value" style="color: var(--success);">${tepatWaktu}</span>
            <span class="metric-card-desc">Sesuai jam masuk sekolah</span>
          </div>

          <div class="metric-card">
            <span class="metric-card-title">Terlambat</span>
            <span class="metric-card-value" style="color: var(--warning);">${terlambat}</span>
            <span class="metric-card-desc">Lewat toleransi waktu</span>
          </div>

          <div class="metric-card">
            <span class="metric-card-title">Di Luar Area</span>
            <span class="metric-card-value" style="color: #D97706;">${luarArea}</span>
            <span class="metric-card-desc">Jarak melebihi radius sekolah</span>
          </div>

          <div class="metric-card">
            <span class="metric-card-title">Belum Absen</span>
            <span class="metric-card-value" style="color: var(--danger);">${belumHadir}</span>
            <span class="metric-card-desc">Belum melakukan check-in</span>
          </div>
        </div>

        <!-- Recent Table -->
        <div class="card" style="margin-top: 24px;">
          <div class="card-header">
            <span class="card-title">Aktivitas Absensi Terbaru</span>
            <button class="btn btn-sm btn-outline" onclick="AdminView.setTab('rekap')">Semua Data</button>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Kelas</th>
                  <th>Tipe</th>
                  <th>Jam Server</th>
                  <th>Jarak / Radius</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${allAttendance.slice(0, 5).map(att => {
                  const student = DB.getProfileById(att.user_id);
                  return `
                    <tr>
                      <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <img src="${att.selfie_path}" style="width: 34px; height: 34px; border-radius: 6px; object-fit: cover;" />
                          <div>
                            <b>${student?.full_name || 'Siswa'}</b>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">NIS: ${student?.nis || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td>${student?.class_name || '-'}</td>
                      <td><b>${att.type === 'in' ? 'Masuk' : 'Pulang'}</b></td>
                      <td class="tabular-nums">${new Date(att.server_time).toLocaleTimeString('id-ID')} WIB</td>
                      <td>${GeoService.formatDistance(att.distance_m)}</td>
                      <td><span class="badge badge-${att.status}">${att.status}</span></td>
                      <td>
                        <button class="btn btn-sm btn-outline" onclick="AdminView.showDetailModal('${att.id}')">Detail</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 2: Rekap Absensi & Ekspor CSV (PRD FR-13 & FR-14) ---
  static renderRekap() {
    let list = DB.getAttendance();

    if (this.currentFilterClass !== 'all') {
      list = list.filter(a => {
        const s = DB.getProfileById(a.user_id);
        return s?.class_name === this.currentFilterClass;
      });
    }

    if (this.currentFilterStatus !== 'all') {
      list = list.filter(a => a.status === this.currentFilterStatus);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a => {
        const s = DB.getProfileById(a.user_id);
        return s?.full_name.toLowerCase().includes(q) || s?.nis?.includes(q);
      });
    }

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">Rekap & Log Absensi</h1>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">Daftar seluruh kehadiran siswa (semua wali kelas dapat memantau seluruh kelas, PRD Bagian 3)</p>
          </div>
          <button class="btn btn-success" onclick="AdminView.exportToCSV()">
            ${Icons.download(16)} Ekspor CSV
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="card" style="padding: 14px 18px;">
          <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
            <input type="text" class="form-input" style="max-width: 260px;" placeholder="Cari nama atau NIS..." value="${this.searchQuery}" oninput="AdminView.searchQuery = this.value; AdminView.setTab('rekap');" />
            
            <select class="form-select" style="max-width: 180px;" onchange="AdminView.currentFilterClass = this.value; AdminView.setTab('rekap');">
              <option value="all" ${this.currentFilterClass === 'all' ? 'selected' : ''}>Semua Kelas</option>
              <option value="XII-IPA-1" ${this.currentFilterClass === 'XII-IPA-1' ? 'selected' : ''}>XII-IPA-1</option>
              <option value="XII-IPS-2" ${this.currentFilterClass === 'XII-IPS-2' ? 'selected' : ''}>XII-IPS-2</option>
            </select>

            <select class="form-select" style="max-width: 180px;" onchange="AdminView.currentFilterStatus = this.value; AdminView.setTab('rekap');">
              <option value="all" ${this.currentFilterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
              <option value="on_time" ${this.currentFilterStatus === 'on_time' ? 'selected' : ''}>Tepat Waktu</option>
              <option value="late" ${this.currentFilterStatus === 'late' ? 'selected' : ''}>Terlambat</option>
              <option value="outside_area" ${this.currentFilterStatus === 'outside_area' ? 'selected' : ''}>Di Luar Area</option>
              <option value="approved" ${this.currentFilterStatus === 'approved' ? 'selected' : ''}>Disetujui</option>
            </select>

            <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: auto;">
              Ditemukan: <b>${list.length}</b> data
            </span>
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper" style="margin-top: 16px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Selfie</th>
                <th>Nama Siswa</th>
                <th>NIS</th>
                <th>Kelas</th>
                <th>Tipe</th>
                <th>Tanggal & Waktu Server</th>
                <th>Jarak</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? '<tr><td colspan="9" style="text-align: center; padding: 28px; color: var(--text-muted);">Tidak ada data yang sesuai dengan filter.</td></tr>' : ''}
              ${list.map(att => {
                const s = DB.getProfileById(att.user_id);
                return `
                  <tr>
                    <td><img src="${att.selfie_path}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" /></td>
                    <td><b>${s?.full_name || 'Siswa'}</b></td>
                    <td>${s?.nis || '-'}</td>
                    <td>${s?.class_name || '-'}</td>
                    <td><b>${att.type === 'in' ? 'Masuk' : 'Pulang'}</b></td>
                    <td class="tabular-nums">${new Date(att.server_time).toLocaleDateString('id-ID')} ${new Date(att.server_time).toLocaleTimeString('id-ID')}</td>
                    <td>${GeoService.formatDistance(att.distance_m)}</td>
                    <td><span class="badge badge-${att.status}">${att.status}</span></td>
                    <td><button class="btn btn-sm btn-outline" onclick="AdminView.showDetailModal('${att.id}')">Detail</button></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- TAB 3: Tinjauan (Review Queue PRD FR-8 & FR-32) ---
  static renderTinjauan() {
    const outsideAreaList = DB.getAttendance().filter(a => a.status === 'outside_area');
    const pendingLeaveList = DB.getLeaveRequests().filter(l => l.status === 'pending');

    return `
      <div>
        <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">Antrean Tinjauan Admin</h1>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 24px;">Keputusan atas absensi di luar radius sekolah dan persetujuan izin/sakit.</p>

        <!-- Section 1: Absensi Di Luar Radius Sekolah (PRD FR-8) -->
        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header">
            <span class="card-title">Absensi di Luar Radius Sekolah (${outsideAreaList.length})</span>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Selfie</th>
                  <th>Siswa & Kelas</th>
                  <th>Jam Server</th>
                  <th>Jarak GPS</th>
                  <th>Alasan yang Ditulis Siswa</th>
                  <th>Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody>
                ${outsideAreaList.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">Tidak ada absensi luar radius yang menunggu tinjauan.</td></tr>' : ''}
                ${outsideAreaList.map(a => {
                  const s = DB.getProfileById(a.user_id);
                  return `
                    <tr>
                      <td><img src="${a.selfie_path}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;" /></td>
                      <td><b>${s?.full_name}</b><br><span style="font-size: 0.78rem; color: var(--text-muted);">${s?.class_name} • NIS: ${s?.nis}</span></td>
                      <td class="tabular-nums">${new Date(a.server_time).toLocaleTimeString('id-ID')} WIB</td>
                      <td><b>${GeoService.formatDistance(a.distance_m)}</b> (±${a.accuracy_m}m)</td>
                      <td style="max-width: 240px; font-style: italic; color: #78350F;">"${a.outside_reason || 'Tidak ada alasan'}"</td>
                      <td>
                        <div style="display: flex; gap: 6px;">
                          <button class="btn btn-sm btn-success" onclick="AdminView.reviewAttendance('${a.id}', 'approved')">Terima (Sah)</button>
                          <button class="btn btn-sm btn-danger" onclick="AdminView.reviewAttendance('${a.id}', 'rejected')">Tolak</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 2: Pengajuan Izin & Sakit (PRD FR-32) -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Pengajuan Izin & Sakit (${pendingLeaveList.length})</span>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Jenis</th>
                  <th>Rentang Tanggal</th>
                  <th>Keterangan</th>
                  <th>Lampiran</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${pendingLeaveList.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">Tidak ada permohonan izin/sakit yang menunggu.</td></tr>' : ''}
                ${pendingLeaveList.map(l => {
                  const s = DB.getProfileById(l.user_id);
                  return `
                    <tr>
                      <td><b>${s?.full_name}</b><br><span style="font-size: 0.78rem; color: var(--text-muted);">${s?.class_name}</span></td>
                      <td><span class="badge ${l.type === 'sakit' ? 'badge-danger' : 'badge-info'}">${l.type.toUpperCase()}</span></td>
                      <td>${l.date_from} s/d ${l.date_to}</td>
                      <td style="max-width: 200px;">"${l.note}"</td>
                      <td>
                        ${l.attachment_path ? `<a href="${l.attachment_path}" target="_blank" class="btn btn-sm btn-outline">Lihat Surat</a>` : '<span style="color: var(--text-muted); font-size: 0.8rem;">-</span>'}
                      </td>
                      <td>
                        <div style="display: flex; gap: 6px;">
                          <button class="btn btn-sm btn-success" onclick="AdminView.reviewLeave('${l.id}', 'approved')">Setujui</button>
                          <button class="btn btn-sm btn-danger" onclick="AdminView.reviewLeave('${l.id}', 'rejected')">Tolak</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 4: Siswa & Kelas (PRD FR-1 s/d FR-3) ---
  static renderSiswa() {
    const students = DB.getProfiles().filter(p => p.role === 'student');

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">Kelola Siswa & Kelas</h1>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">Akun siswa dibuat oleh admin sekolah (Mendukung impor massal CSV, PRD FR-1 & FR-3)</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline" onclick="AdminView.openImportCsvModal()">${Icons.upload(16)} Impor CSV</button>
            <button class="btn btn-primary" onclick="AdminView.openAddStudentModal()">+ Tambah Siswa</button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>NIS</th>
                <th>Nama Lengkap</th>
                <th>Kelas</th>
                <th>Status Akun</th>
                <th>Tanggal Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr>
                  <td><b>${s.nis}</b></td>
                  <td>${s.full_name}</td>
                  <td><span class="badge badge-info">${s.class_name}</span></td>
                  <td><span class="badge badge-${s.active ? 'success' : 'neutral'}">${s.active ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td class="tabular-nums">${new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- TAB 5: Orang Tua/Wali & Penautan Telegram (PRD FR-25, FR-44, FR-45) ---
  static renderWali() {
    const guardians = DB.getGuardians();

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">Pengelolaan Orang Tua/Wali & Telegram</h1>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">Kode penautan unik 6-karakter berlaku 24 jam (PRD FR-45). Verifikasi sebelum pemutusan tautan (FR-44).</p>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nama Wali</th>
                <th>Siswa Terkait</th>
                <th>Kontak</th>
                <th>Status Telegram</th>
                <th>Chat ID Telegram</th>
                <th>Aksi Kode & Tautan</th>
              </tr>
            </thead>
            <tbody>
              ${guardians.map(g => {
                const student = DB.getProfileById(g.student_id);
                const isLinked = !!g.telegram_chat_id;
                return `
                  <tr>
                    <td><b>${g.guardian_name}</b></td>
                    <td>${student?.full_name} (${student?.class_name})</td>
                    <td>${g.guardian_contact || '-'}</td>
                    <td>
                      <span class="badge ${isLinked ? 'badge-success' : 'badge-neutral'}">
                        ${isLinked ? 'Tertaut (' + g.telegram_username + ')' : 'Belum Ditautkan'}
                      </span>
                    </td>
                    <td class="tabular-nums">${g.telegram_chat_id || '-'}</td>
                    <td>
                      <div style="display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-primary" onclick="AdminView.issueTelegramCode('${g.id}')">
                          Terbitkan Kode Baru
                        </button>
                        ${isLinked ? `
                          <button class="btn btn-sm btn-danger" onclick="AdminView.promptUnlinkTelegram('${g.id}')">
                            Putus Tautan
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- TAB 6: Notifikasi Telegram & Antrean (PRD FR-37 s/d FR-43) ---
  static renderTelegram() {
    const queue = DB.getNotificationQueue();
    const queuedCount = queue.filter(q => q.status === 'queued').length;

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">Antrean & Log Notifikasi Telegram</h1>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">Worker memproses antrean terpisah (Maks 3 kali percobaan ulang untuk gangguan sementara, PRD FR-39)</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="App.openTelegramSimulatorModal()">
              Simulator Bot Telegram
            </button>
            <button class="btn btn-primary" onclick="AdminView.triggerWorker()">
              Proses Antrean (${queuedCount})
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Waktu Dibuat</th>
                <th>Siswa</th>
                <th>Template</th>
                <th>Penerima (Chat ID)</th>
                <th>Status Antrean</th>
                <th>Percobaan</th>
                <th>ID Pesan Provider</th>
              </tr>
            </thead>
            <tbody>
              ${queue.length === 0 ? '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">Belum ada riwayat antrean notifikasi.</td></tr>' : ''}
              ${queue.map(item => `
                <tr>
                  <td class="tabular-nums">${new Date(item.created_at).toLocaleTimeString('id-ID')}</td>
                  <td><b>${item.payload?.student_name || '-'}</b></td>
                  <td><span class="badge badge-info">${item.template}</span></td>
                  <td class="tabular-nums">${item.to_chat_id}</td>
                  <td><span class="badge badge-${item.status}">${item.status}</span></td>
                  <td>${item.attempts}x</td>
                  <td style="font-size: 0.78rem; font-family: monospace;">${item.provider_message_id || (item.error ? `<span style="color: var(--danger);">${item.error}</span>` : '-')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- TAB 7: Lokasi Sekolah & Jadwal (PRD FR-15 & FR-16) ---
  static renderLokasi() {
    const site = DB.getSite();

    return `
      <div>
        <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">Pengaturan Lokasi & Jam Sekolah</h1>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 24px;">Kelola titik koordinat sekolah, radius toleransi GPS, dan jam masuk/pulang.</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Form Settings -->
          <div class="card">
            <div class="card-title">Parameter Kehadiran</div>

            <div class="form-group">
              <label class="form-label form-label-required">Nama Sekolah / Lokasi</label>
              <input type="text" id="siteName" class="form-input" value="${site.name}" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label form-label-required">Latitude</label>
                <input type="number" step="0.000001" id="siteLat" class="form-input" value="${site.lat}" />
              </div>
              <div class="form-group">
                <label class="form-label form-label-required">Longitude</label>
                <input type="number" step="0.000001" id="siteLng" class="form-input" value="${site.lng}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label form-label-required">Radius Valid (Meter)</label>
              <input type="number" id="siteRadius" class="form-input" value="${site.radius_m}" />
              <span class="form-help">Default 100 meter (PRD FR-8). Di luar radius wajib mengisi alasan.</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label form-label-required">Jam Masuk</label>
                <input type="time" id="siteTimeIn" class="form-input" value="${site.time_in}" />
              </div>
              <div class="form-group">
                <label class="form-label form-label-required">Jam Pulang</label>
                <input type="time" id="siteTimeOut" class="form-input" value="${site.time_out}" />
              </div>
              <div class="form-group">
                <label class="form-label form-label-required">Toleransi (Menit)</label>
                <input type="number" id="siteTolerance" class="form-input" value="${site.late_tolerance_min}" />
              </div>
            </div>

            <button class="btn btn-primary" style="margin-top: 14px;" onclick="AdminView.saveSiteSettings()">
              Simpan Perubahan Lokasi & Jadwal
            </button>
          </div>

          <!-- Interactive Leaflet Map Card -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Peta Radius Sekolah</span>
              <span class="badge badge-info">${site.radius_m}m Radius</span>
            </div>
            <div id="siteMapContainer" style="height: 380px; width: 100%; border-radius: var(--radius-input); border: 1px solid var(--border);"></div>
            <span class="form-help">Klik pada peta untuk memindahkan titik koordinat sekolah secara langsung.</span>
          </div>
        </div>
      </div>
    `;
  }

  static initSiteMap() {
    const site = DB.getSite();
    const mapEl = document.getElementById('siteMapContainer');
    if (!mapEl || !window.L) return;

    if (this.leafletMap) {
      this.leafletMap.remove();
    }

    this.leafletMap = L.map('siteMapContainer').setView([site.lat, site.lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.leafletMap);

    const marker = L.marker([site.lat, site.lng]).addTo(this.leafletMap)
      .bindPopup(`<b>${site.name}</b><br>Titik Gerbang Masuk`)
      .openPopup();

    const circle = L.circle([site.lat, site.lng], {
      color: '#1D4ED8',
      fillColor: '#3B82F6',
      fillOpacity: 0.25,
      radius: site.radius_m
    }).addTo(this.leafletMap);

    // On click map, update coordinate inputs
    this.leafletMap.on('click', (e) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      document.getElementById('siteLat').value = lat;
      document.getElementById('siteLng').value = lng;
      marker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
    });
  }

  static saveSiteSettings() {
    const name = document.getElementById('siteName').value.trim();
    const lat = parseFloat(document.getElementById('siteLat').value);
    const lng = parseFloat(document.getElementById('siteLng').value);
    const radius = parseInt(document.getElementById('siteRadius').value, 10);
    const timeIn = document.getElementById('siteTimeIn').value;
    const timeOut = document.getElementById('siteTimeOut').value;
    const tolerance = parseInt(document.getElementById('siteTolerance').value, 10);

    DB.updateSite({
      name, lat, lng, radius_m: radius, time_in: timeIn, time_out: timeOut, late_tolerance_min: tolerance
    });

    App.showToast('Pengaturan lokasi & jadwal berhasil disimpan!', 'success');
    this.render(document.getElementById('appContent'));
  }

  // --- Actions ---
  static reviewAttendance(attId, newStatus) {
    DB.updateAttendanceStatus(attId, newStatus, `Ditinjau oleh admin pada ${new Date().toLocaleTimeString('id-ID')}`);
    App.showToast(`Absensi berhasil ditandai: ${newStatus.toUpperCase()}`, 'success');
    App.renderCurrentView();
  }

  static reviewLeave(leaveId, newStatus) {
    DB.updateLeaveRequest(leaveId, newStatus, `Ditinjau oleh admin pada ${new Date().toLocaleTimeString('id-ID')}`);
    App.showToast(`Permohonan izin berhasil diubah: ${newStatus.toUpperCase()}`, 'success');
    App.renderCurrentView();
  }

  static issueTelegramCode(guardianId) {
    const codeObj = DB.generateLinkCode(guardianId);
    const guardian = DB.getGuardians().find(g => g.id === guardianId);
    const student = DB.getProfileById(guardian?.student_id);

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 480px; text-align: center;">
        <div class="modal-body" style="padding: 24px;">
          <div style="font-size: 1.2rem; font-weight: 800; color: var(--primary-900);">
            Kode Penautan Telegram Berhasil Diterbitkan!
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 6px;">
            Wali: <b>${guardian?.guardian_name}</b> (Siswa: ${student?.full_name})
          </p>

          <div style="background: var(--primary-50); border: 2px dashed var(--primary-600); border-radius: var(--radius-card); padding: 16px; margin: 20px 0;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; letter-spacing: 1px;">KODE PENAUTAN 6-KARAKTER (BERLAKU 24 JAM)</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary-800); letter-spacing: 4px; margin-top: 4px;">
              ${codeObj.rawCode}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 6px;">
              Kedaluwarsa pada: ${new Date(codeObj.expires_at).toLocaleString('id-ID')}
            </div>
          </div>

          <div style="text-align: left; font-size: 0.82rem; color: var(--text-secondary); background: var(--surface-alt); padding: 12px; border-radius: var(--radius-input);">
            <b>Petunjuk untuk Wali:</b><br/>
            1. Buka Bot Telegram Sekolah.<br/>
            2. Ketik <code>/start ${codeObj.rawCode}</code> atau kirimkan kode di atas.<br/>
            3. Akun langsung tertaut dan siap menerima notifikasi absensi.
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="btn btn-secondary btn-block" onclick="this.closest('.modal-backdrop').remove()">Tutup</button>
            <button class="btn btn-primary btn-block" onclick="navigator.clipboard.writeText('${codeObj.rawCode}'); App.showToast('Kode berhasil disalin!', 'success');">Salin Kode</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static promptUnlinkTelegram(guardianId) {
    const reason = prompt('Masukkan alasan verifikasi pemutusan tautan Telegram (PRD FR-44):', 'Permintaan orang tua / pergantian nomor HP');
    if (reason) {
      DB.unlinkGuardianTelegram(guardianId, reason);
      App.showToast('Tautan Telegram berhasil diputuskan!', 'success');
      App.renderCurrentView();
    }
  }

  static triggerWorker() {
    const sent = TelegramService.runWorker();
    App.showToast(`Worker selesai memproses ${sent} pesan Telegram!`, 'success');
    App.renderCurrentView();
  }

  static exportToCSV() {
    const list = DB.getAttendance();
    let csv = 'ID,NIS,Nama Siswa,Kelas,Tipe,Waktu Server,Jarak (m),Akurasi GPS (m),Status,Alasan Luar Area\n';

    list.forEach(a => {
      const s = DB.getProfileById(a.user_id);
      const row = [
        a.id,
        `"${s?.nis || ''}"`,
        `"${s?.full_name || ''}"`,
        `"${s?.class_name || ''}"`,
        a.type,
        `"${a.server_time}"`,
        a.distance_m,
        a.accuracy_m,
        a.status,
        `"${(a.outside_reason || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_absensi_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    App.showToast('Berkas CSV berhasil diekspor!', 'success');
  }

  static showDetailModal(attId) {
    const att = DB.getAttendance().find(a => a.id === attId);
    if (!att) return;
    const student = DB.getProfileById(att.user_id);

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 520px;">
        <div class="modal-header">
          <div class="modal-title">Detail Catatan Absensi</div>
          <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; gap: 16px;">
            <img src="${att.selfie_path}" style="width: 140px; height: 140px; border-radius: var(--radius-input); object-fit: cover; border: 1px solid var(--border);" />
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.88rem;">
              <div style="font-size: 1.1rem; font-weight: 800;">${student?.full_name}</div>
              <div><b>NIS:</b> ${student?.nis} • <b>Kelas:</b> ${student?.class_name}</div>
              <div><b>Tipe:</b> Absen ${att.type === 'in' ? 'Masuk' : 'Pulang'}</div>
              <div><b>Status:</b> <span class="badge badge-${att.status}">${att.status}</span></div>
            </div>
          </div>

          <div style="background: var(--surface-alt); padding: 14px; border-radius: var(--radius-input); font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
            <div><b>Waktu Server Resmi:</b> ${new Date(att.server_time).toLocaleString('id-ID')} WIB</div>
            <div><b>Koordinat:</b> ${att.lat}, ${att.lng}</div>
            <div><b>Jarak ke Titik Sekolah:</b> ${GeoService.formatDistance(att.distance_m)}</div>
            <div><b>Akurasi GPS Perangkat:</b> ±${att.accuracy_m} meter</div>
            ${att.outside_reason ? `<div style="color: var(--warning); margin-top: 4px;"><b>Alasan Di Luar Area:</b> "${att.outside_reason}"</div>` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Tutup</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static openAddStudentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">Tambah Data Siswa Baru</div>
          <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label form-label-required">Nomor Induk Siswa (NIS)</label>
            <input type="text" id="newNis" class="form-input" placeholder="Contoh: 1027" />
          </div>
          <div class="form-group">
            <label class="form-label form-label-required">Nama Lengkap Siswa</label>
            <input type="text" id="newName" class="form-input" placeholder="Contoh: Muhammad Rizky" />
          </div>
          <div class="form-group">
            <label class="form-label form-label-required">Kelas</label>
            <input type="text" id="newClass" class="form-input" placeholder="Contoh: XII-IPA-2" />
          </div>
          <div class="form-group">
            <label class="form-label">Nama Orang Tua / Wali</label>
            <input type="text" id="newGuardianName" class="form-input" placeholder="Contoh: Bapak Haryono" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Batal</button>
          <button class="btn btn-primary" onclick="AdminView.submitAddStudent(this)">Simpan Siswa</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static submitAddStudent(btn) {
    const nis = document.getElementById('newNis').value.trim();
    const name = document.getElementById('newName').value.trim();
    const className = document.getElementById('newClass').value.trim();
    const guardianName = document.getElementById('newGuardianName').value.trim();

    if (!nis || !name || !className) {
      App.showToast('Harap lengkapi semua kolom wajib!', 'error');
      return;
    }

    const studentId = 'usr-' + Date.now();
    DB.addProfile({
      id: studentId,
      full_name: name,
      nis: nis,
      class_name: className,
      role: 'student',
      active: true,
      created_at: new Date().toISOString()
    });

    if (guardianName) {
      DB.addGuardian({
        id: 'grd-' + Date.now(),
        student_id: studentId,
        guardian_name: guardianName,
        guardian_contact: '',
        telegram_chat_id: null,
        telegram_username: null,
        linked_at: null,
        status: 'active',
        created_at: new Date().toISOString()
      });
    }

    btn.closest('.modal-backdrop').remove();
    App.showToast('Siswa berhasil ditambahkan!', 'success');
    App.renderCurrentView();
  }

  static openImportCsvModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">Impor Siswa Massal (CSV)</div>
          <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Format CSV yang didukung: <code>NIS,Nama,Kelas,NamaWali</code> per baris.
          </p>
          <div class="form-group" style="margin-top: 10px;">
            <label class="form-label form-label-required">Tempel Data CSV atau Pilih File</label>
            <textarea id="csvTextInput" class="form-textarea" rows="6" placeholder="1031,Dewi Lestari,XII-IPA-1,Ibu Lestari\n1032,Fajar Nugroho,XII-IPA-1,Pak Nugroho"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Batal</button>
          <button class="btn btn-primary" onclick="AdminView.submitImportCsv(this)">Proses Impor</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static submitImportCsv(btn) {
    const text = document.getElementById('csvTextInput').value.trim();
    if (!text) {
      App.showToast('Data CSV masih kosong!', 'error');
      return;
    }

    const lines = text.split('\n');
    let imported = 0;
    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 3 && parts[0] && parts[1]) {
        const studentId = 'usr-' + Date.now() + '-' + imported;
        DB.addProfile({
          id: studentId,
          full_name: parts[1],
          nis: parts[0],
          class_name: parts[2] || 'XII',
          role: 'student',
          active: true,
          created_at: new Date().toISOString()
        });
        if (parts[3]) {
          DB.addGuardian({
            id: 'grd-' + Date.now() + '-' + imported,
            student_id: studentId,
            guardian_name: parts[3],
            telegram_chat_id: null,
            status: 'active',
            created_at: new Date().toISOString()
          });
        }
        imported++;
      }
    });

    btn.closest('.modal-backdrop').remove();
    App.showToast(`Berhasil mengimpor ${imported} data siswa!`, 'success');
    App.renderCurrentView();
  }
}

window.AdminView = AdminView;
