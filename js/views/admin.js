/**
 * ADMIN DASHBOARD VIEWS
 * Berdasarkan design(3).md Section 4, 5.5, 5.6, Wireframe E & PRD FR-13 s/d FR-17
 */

class AdminView {
  static currentTab = 'ringkasan';
  static currentFilterClass = 'all';
  static currentFilterStatus = 'all';
  static currentFilterDate = 'all';
  static searchQuery = '';

  static getAvailableClasses() {
    const students = DB.getProfiles().filter(p => p.role === 'student');
    const classes = Array.from(new Set(students.map(s => s.class_name).filter(Boolean))).sort();
    return classes.length > 0 ? classes : ['XII-IPA-1', 'XII-IPS-2'];
  }

  static getFilteredAttendanceList() {
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

    if (this.currentFilterDate === 'today') {
      const todayStr = new Date().toDateString();
      list = list.filter(a => new Date(a.server_time).toDateString() === todayStr);
    } else if (this.currentFilterDate === 'this_month') {
      const now = new Date();
      list = list.filter(a => {
        const d = new Date(a.server_time);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a => {
        const s = DB.getProfileById(a.user_id);
        return s?.full_name.toLowerCase().includes(q) || s?.nis?.includes(q);
      });
    }

    return list;
  }

  static getStatusBadgeHtml(status) {
    switch (status) {
      case 'on_time':
        return '<span class="badge badge-on_time">Tepat Waktu</span>';
      case 'late':
        return '<span class="badge badge-late">Terlambat</span>';
      case 'outside_area':
        return '<span class="badge badge-outside_area">Di Luar Area</span>';
      case 'approved':
        return '<span class="badge badge-success">Hadir Sah (Disetujui)</span>';
      case 'rejected':
        return '<span class="badge badge-danger">Ditolak</span>';
      default:
        return `<span class="badge badge-neutral">${status || '-'}</span>`;
    }
  }

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
            <div style="background: var(--surface-alt); border-radius: var(--radius-sm); padding: 8px 10px; margin-bottom: 10px; font-size: 0.76rem; border: 1px solid var(--border);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 700; color: var(--text-secondary);">Supabase Cloud</span>
                <span class="badge ${typeof SupabaseService !== 'undefined' && SupabaseService.status === 'connected' ? 'badge-success' : 'badge-neutral'}" style="font-size: 0.68rem; padding: 1px 6px;">
                  ${typeof SupabaseService !== 'undefined' && SupabaseService.status === 'connected' ? 'Terhubung' : 'Siap Sync'}
                </span>
              </div>
              <button class="btn btn-sm btn-outline btn-block scale-press" style="font-size: 0.74rem; min-height: 26px; padding: 2px 6px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="AdminView.syncCloud()">
                ${Icons.refresh(12)} <span>Sinkronkan Cloud</span>
              </button>
            </div>

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
    const tepatWaktu = todayAttendance.filter(a => a.status === 'on_time' || a.status === 'approved').length;
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
                      <td>${AdminView.getStatusBadgeHtml(att.status)}</td>
                      <td style="display: flex; gap: 6px;">
                        <button class="btn btn-sm btn-outline scale-press" onclick="AdminView.showDetailModal('${att.id}')">Detail</button>
                        <button class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--danger);" onclick="AdminView.confirmDeleteAttendance('${att.id}')" title="Hapus Catatan">${Icons.trash(14)}</button>
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
    const list = this.getFilteredAttendanceList();
    const availableClasses = this.getAvailableClasses();

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">Rekap & Log Absensi</h1>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">Daftar seluruh kehadiran siswa (semua wali kelas dapat memantau seluruh kelas, PRD Bagian 3)</p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-outline scale-press" onclick="AdminView.openPrintReportModal()">
              ${Icons.fileText(16)} Cetak Rekap / PDF
            </button>
            <button class="btn btn-success scale-press" onclick="AdminView.exportToCSV()">
              ${Icons.download(16)} Ekspor CSV (${list.length})
            </button>
            <button class="btn btn-danger scale-press" onclick="AdminView.promptResetTodayAttendance()">
              ${Icons.trash(16)} Reset Hari Ini
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="card" style="padding: 14px 18px;">
          <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
            <input type="text" class="form-input" style="max-width: 240px;" placeholder="Cari nama atau NIS..." value="${this.searchQuery}" oninput="AdminView.searchQuery = this.value; AdminView.setTab('rekap');" />
            
            <select class="form-select" style="max-width: 170px;" onchange="AdminView.currentFilterClass = this.value; AdminView.setTab('rekap');">
              <option value="all" ${this.currentFilterClass === 'all' ? 'selected' : ''}>Semua Kelas</option>
              ${availableClasses.map(c => `
                <option value="${c}" ${this.currentFilterClass === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>

            <select class="form-select" style="max-width: 170px;" onchange="AdminView.currentFilterDate = this.value; AdminView.setTab('rekap');">
              <option value="all" ${this.currentFilterDate === 'all' ? 'selected' : ''}>Semua Tanggal</option>
              <option value="today" ${this.currentFilterDate === 'today' ? 'selected' : ''}>Hari Ini</option>
              <option value="this_month" ${this.currentFilterDate === 'this_month' ? 'selected' : ''}>Bulan Ini</option>
            </select>

            <select class="form-select" style="max-width: 170px;" onchange="AdminView.currentFilterStatus = this.value; AdminView.setTab('rekap');">
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
                    <td>${AdminView.getStatusBadgeHtml(att.status)}</td>
                    <td style="display: flex; gap: 6px;">
                      <button class="btn btn-sm btn-outline scale-press" onclick="AdminView.showDetailModal('${att.id}')">Detail</button>
                      <button class="btn btn-sm btn-outline scale-press" style="color: var(--danger); border-color: var(--danger);" onclick="AdminView.confirmDeleteAttendance('${att.id}')" title="Hapus Catatan">${Icons.trash(14)} Hapus</button>
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
                ${outsideAreaList.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">Tidak ada absensi luar radius yang menunggu tinjauan.</td></tr>' : ''}
                ${outsideAreaList.map(a => {
                  const s = DB.getProfileById(a.user_id);
                  return `
                    <tr>
                      <td>
                        <img src="${a.selfie_path}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; cursor: pointer; border: 1px solid var(--border);" onclick="AdminView.showDetailModal('${a.id}')" title="Klik untuk lihat detail" />
                      </td>
                      <td>
                        <div style="cursor: pointer;" onclick="AdminView.showDetailModal('${a.id}')">
                          <b>${s?.full_name || 'Siswa'}</b>
                          <div style="font-size: 0.78rem; color: var(--text-muted);">${s?.class_name || '-'} • NIS: ${s?.nis || '-'}</div>
                        </div>
                      </td>
                      <td class="tabular-nums">${new Date(a.server_time).toLocaleTimeString('id-ID')} WIB</td>
                      <td>
                        <b>${GeoService.formatDistance(a.distance_m)}</b>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">Akurasi: ±${a.accuracy_m}m</div>
                      </td>
                      <td style="max-width: 250px;">
                        <div style="background: #FFFBEB; padding: 6px 10px; border-radius: 6px; border: 1px solid #FDE68A; font-size: 0.82rem; color: #78350F; font-style: italic;">
                          "${a.outside_reason || 'Tidak ada alasan'}"
                        </div>
                      </td>
                      <td>
                        <div style="display: flex; gap: 6px;">
                          <button class="btn btn-sm btn-primary scale-press" onclick="AdminView.showDetailModal('${a.id}')">Tinjau</button>
                          <button class="btn btn-sm btn-success scale-press" onclick="AdminView.reviewAttendance('${a.id}', 'approved')">Terima</button>
                          <button class="btn btn-sm btn-outline scale-press" style="color: var(--danger); border-color: var(--danger);" onclick="AdminView.reviewAttendance('${a.id}', 'rejected')">Tolak</button>
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
                        ${l.attachment_path ? `
                          <button type="button" class="btn btn-sm btn-outline scale-press" style="font-size: 0.78rem; display: inline-flex; align-items: center; gap: 5px;" onclick="StudentView.openAttachmentLightbox('${l.attachment_path.replace(/'/g, "\\'")}', 'Surat Keterangan - ${(s?.full_name || 'Siswa').replace(/'/g, "\\'")}')">
                            ${Icons.eye(14)} Lihat Surat
                          </button>
                        ` : '<span style="color: var(--text-muted); font-size: 0.8rem;">-</span>'}
                      </td>
                      <td>
                        <div style="display: flex; gap: 6px;">
                          <button class="btn btn-sm btn-success scale-press" onclick="AdminView.reviewLeave('${l.id}', 'approved')">Setujui</button>
                          <button class="btn btn-sm btn-danger scale-press" onclick="AdminView.reviewLeave('${l.id}', 'rejected')">Tolak</button>
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
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">Pengelolaan Orang Tua/Wali & Telegram</h1>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">Kode penautan unik 6-karakter berlaku 24 jam (PRD FR-45). Verifikasi sebelum pemutusan tautan (FR-44).</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary" onclick="AdminView.syncTelegramBot()">
              Sinkronkan Tautan Telegram Baru
            </button>
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
                <th>Persetujuan UU PDP</th>
                <th>Aksi Kode & Tautan</th>
              </tr>
            </thead>
            <tbody>
              ${guardians.map(g => {
                const student = DB.getProfileById(g.student_id);
                const isLinked = !!g.telegram_chat_id;
                const consents = DB.getConsents(g.student_id);
                const consentLabel = consents.length >= 2 ? `Lengkap (${consents.length}/3)` : consents.length > 0 ? `Sebagian (${consents.length}/3)` : 'Belum Ada';
                const consentBadge = consents.length >= 2 ? 'badge-success' : consents.length > 0 ? 'badge-warning' : 'badge-neutral';
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
                      <button type="button" class="badge ${consentBadge} scale-press" style="cursor: pointer; border: none;" onclick="ConsentView.openModal('${g.student_id}')" title="Klik untuk lihat / kelola persetujuan digital">
                        ${consentLabel}
                      </button>
                    </td>
                    <td>
                      <div style="display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-primary scale-press" onclick="AdminView.issueTelegramCode('${g.id}')">
                          Terbitkan Kode
                        </button>
                        ${isLinked ? `
                          <button class="btn btn-sm btn-danger scale-press" onclick="AdminView.promptUnlinkTelegram('${g.id}')">
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
    const botUser = window.AppConfig?.telegramBotUsername || 'AbsenM3INBot';

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">Antrean & Log Notifikasi Telegram</h1>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">Worker memproses antrean terpisah (Maks 3 kali percobaan ulang untuk gangguan sementara, PRD FR-39)</p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="AdminView.syncTelegramBot()">
              Sinkronkan Pesan Masuk
            </button>
            <button class="btn btn-secondary" onclick="AdminView.openTestTelegramModal()">
              Uji Kirim Pesan
            </button>
            <button class="btn btn-primary" onclick="AdminView.triggerWorker()">
              Proses Antrean (${queuedCount})
            </button>
          </div>
        </div>

        <!-- Official Bot Status Card -->
        <div class="card" style="margin-bottom: 20px; border-left: 4px solid var(--primary-600); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Bot Telegram Sekolah Resmi</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary-900); margin: 2px 0;">@${botUser}</div>
            <div style="font-size: 0.8rem; color: var(--success); font-weight: 600;">Terhubung ke Telegram Bot API Resmi</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="https://t.me/${botUser}" target="_blank" class="btn btn-sm btn-outline">
              Buka @${botUser} di Telegram
            </a>
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

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Form Settings -->
          <div class="card">
            <div class="card-title">Parameter Kehadiran & Geofencing</div>

            <div class="form-group">
              <label class="form-label form-label-required">Nama Sekolah / Lokasi</label>
              <input type="text" id="siteName" class="form-input" value="${site.name}" />
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <label class="form-label form-label-required" style="margin-bottom: 0;">Titik Koordinat Gerbang</label>
                <button type="button" class="btn btn-sm btn-outline scale-press" style="padding: 3px 8px; font-size: 0.75rem; min-height: 28px; display: inline-flex; align-items: center; gap: 4px;" onclick="AdminView.detectCurrentGpsForSite()">
                  ${Icons.mapPin(14)} <span>Gunakan GPS Saya</span>
                </button>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Latitude</span>
                  <input type="number" step="0.000001" id="siteLat" class="form-input tabular-nums" value="${site.lat}" />
                </div>
                <div>
                  <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Longitude</span>
                  <input type="number" step="0.000001" id="siteLng" class="form-input tabular-nums" value="${site.lng}" />
                </div>
              </div>
              <span class="form-help">Klik pada peta atau geser pin marker untuk memindahkan koordinat gerbang secara visual.</span>
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <label class="form-label form-label-required">Radius Valid Geofencing</label>
                <span id="radiusValueDisplay" style="font-size: 0.82rem; font-weight: 700; color: var(--primary-700);">${site.radius_m} meter</span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <input type="range" id="siteRadiusSlider" min="20" max="500" step="5" value="${site.radius_m}" class="form-range" style="flex: 1;" />
                <input type="number" id="siteRadius" class="form-input tabular-nums" style="width: 90px; text-align: center;" value="${site.radius_m}" min="10" max="1000" />
              </div>
              <span class="form-help">Default 100m (PRD FR-8). Di luar radius ini, siswa wajib menyertakan alasan sah untuk ditinjau admin.</span>
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

            <button class="btn btn-primary scale-press" style="margin-top: 14px;" onclick="AdminView.saveSiteSettings()">
              Simpan Perubahan Lokasi & Jadwal
            </button>
          </div>

          <!-- Interactive Leaflet Map Card -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Peta Radius Sekolah</span>
              <span class="badge badge-info" id="siteRadiusBadge">${site.radius_m}m Radius</span>
            </div>
            <div id="siteMapContainer" style="height: 420px; width: 100%; border-radius: var(--radius-input); border: 1px solid var(--border);"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
              <span>Geser pin marker atau klik di peta untuk mengatur lokasi gerbang sekolah.</span>
              <span style="font-weight: 600; color: var(--primary-700);">Live Leaflet GPS</span>
            </div>
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
      this.leafletMap = null;
    }

    this.leafletMap = L.map('siteMapContainer').setView([site.lat, site.lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.leafletMap);

    const marker = L.marker([site.lat, site.lng], { draggable: true }).addTo(this.leafletMap)
      .bindPopup(`<b>${site.name}</b><br>Gerbang Utama (Geser untuk ubah lokasi)`)
      .openPopup();

    const circle = L.circle([site.lat, site.lng], {
      color: '#1D4ED8',
      fillColor: '#3B82F6',
      fillOpacity: 0.22,
      radius: site.radius_m
    }).addTo(this.leafletMap);

    const latInput = document.getElementById('siteLat');
    const lngInput = document.getElementById('siteLng');
    const radiusInput = document.getElementById('siteRadius');
    const radiusSlider = document.getElementById('siteRadiusSlider');
    const radiusBadge = document.getElementById('siteRadiusBadge');
    const radiusDisplay = document.getElementById('radiusValueDisplay');

    // Drag marker updates coordinates & circle live
    marker.on('drag', (e) => {
      const pos = e.target.getLatLng();
      const lat = parseFloat(pos.lat.toFixed(6));
      const lng = parseFloat(pos.lng.toFixed(6));
      circle.setLatLng([lat, lng]);
      if (latInput) latInput.value = lat;
      if (lngInput) lngInput.value = lng;
    });

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      const lat = parseFloat(pos.lat.toFixed(6));
      const lng = parseFloat(pos.lng.toFixed(6));
      marker.bindPopup(`<b>${document.getElementById('siteName')?.value || site.name}</b><br>Koordinat: ${lat}, ${lng}`).openPopup();
    });

    // Click map moves marker and circle
    this.leafletMap.on('click', (e) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      if (latInput) latInput.value = lat;
      if (lngInput) lngInput.value = lng;
      marker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
      marker.bindPopup(`<b>${document.getElementById('siteName')?.value || site.name}</b><br>Koordinat: ${lat}, ${lng}`).openPopup();
    });

    // Synchronized radius changes
    const onRadiusChange = (val) => {
      const r = parseInt(val, 10);
      if (!isNaN(r) && r > 0) {
        circle.setRadius(r);
        if (radiusBadge) radiusBadge.textContent = `${r}m Radius`;
        if (radiusDisplay) radiusDisplay.textContent = `${r} meter`;
        if (radiusInput && parseInt(radiusInput.value, 10) !== r) radiusInput.value = r;
        if (radiusSlider && parseInt(radiusSlider.value, 10) !== r) radiusSlider.value = r;
      }
    };

    if (radiusSlider) {
      radiusSlider.addEventListener('input', (e) => onRadiusChange(e.target.value));
    }
    if (radiusInput) {
      radiusInput.addEventListener('input', (e) => onRadiusChange(e.target.value));
    }

    // Manual typing in lat/lng inputs updates marker & circle
    const onCoordInput = () => {
      const lat = parseFloat(latInput?.value);
      const lng = parseFloat(lngInput?.value);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        this.leafletMap.panTo([lat, lng]);
      }
    };
    if (latInput) latInput.addEventListener('input', onCoordInput);
    if (lngInput) lngInput.addEventListener('input', onCoordInput);
  }

  static detectCurrentGpsForSite() {
    if (!navigator.geolocation) {
      App.showToast('Browser Anda tidak mendukung geolokasi GPS.', 'danger');
      return;
    }
    App.showToast('Mendeteksi sinyal GPS lokasi Anda...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);

        const latInput = document.getElementById('siteLat');
        const lngInput = document.getElementById('siteLng');
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;

        if (this.leafletMap) {
          this.leafletMap.setView([lat, lng], 17);
          this.initSiteMap();
        }

        App.showToast(`Titik koordinat berhasil disetel dari GPS (Akurasi: ±${acc}m)! Klik Simpan untuk memperbarui.`, 'success');
      },
      (err) => {
        App.showToast(`Gagal membaca GPS: ${err.message}`, 'danger');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  static saveSiteSettings() {
    const name = document.getElementById('siteName').value.trim();
    const lat = parseFloat(document.getElementById('siteLat').value);
    const lng = parseFloat(document.getElementById('siteLng').value);
    const radius = parseInt(document.getElementById('siteRadius').value, 10);
    const timeIn = document.getElementById('siteTimeIn').value;
    const timeOut = document.getElementById('siteTimeOut').value;
    const tolerance = parseInt(document.getElementById('siteTolerance').value, 10);

    if (!name) {
      App.showToast('Nama sekolah / lokasi tidak boleh kosong.', 'danger');
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      App.showToast('Titik koordinat Latitude & Longitude tidak valid.', 'danger');
      return;
    }
    if (isNaN(radius) || radius <= 0) {
      App.showToast('Radius presensi harus berupa angka positif.', 'danger');
      return;
    }

    DB.updateSite({
      name, lat, lng, radius_m: radius, time_in: timeIn, time_out: timeOut, late_tolerance_min: tolerance
    });

    App.showToast('Pengaturan lokasi & jadwal berhasil disimpan!', 'success');
    App.renderCurrentView();
  }

  // --- Actions ---
  static reviewAttendance(attId, newStatus, customNote = '') {
    const note = customNote || (newStatus === 'approved' ? `Disetujui admin pada ${new Date().toLocaleTimeString('id-ID')}` : `Ditolak admin pada ${new Date().toLocaleTimeString('id-ID')}`);
    DB.updateAttendanceStatus(attId, newStatus, note);
    App.showToast(`Absensi berhasil ${newStatus === 'approved' ? 'disetujui sebagai Hadir Sah' : 'ditolak'}!`, 'success');
    App.renderCurrentView();
  }

  static submitAttendanceReviewFromModal(attId, newStatus) {
    const noteInput = document.getElementById('reviewNoteInput');
    const note = noteInput ? noteInput.value.trim() : '';
    const noteFinal = note || (newStatus === 'approved' ? `Disetujui admin sekolah pada ${new Date().toLocaleTimeString('id-ID')}` : `Ditolak admin sekolah pada ${new Date().toLocaleTimeString('id-ID')}`);
    
    DB.updateAttendanceStatus(attId, newStatus, noteFinal);
    document.querySelector('.modal-backdrop')?.remove();
    App.showToast(`Absensi berhasil ${newStatus === 'approved' ? 'disetujui sebagai Hadir Sah' : 'ditolak'}!`, 'success');
    App.renderCurrentView();
  }

  static confirmDeleteAttendance(attId, closeDetail = false) {
    const att = DB.getAttendance().find(a => a.id === attId);
    if (!att) return;
    const student = DB.getProfileById(att.user_id);
    const typeLabel = att.type === 'in' ? 'Masuk' : 'Pulang';

    if (confirm(`Hapus catatan absensi ${typeLabel} untuk siswa "${student?.full_name || 'Siswa'}" (${new Date(att.server_time).toLocaleTimeString('id-ID')})?\n\nSetelah dihapus, siswa dapat melakukan absensi ulang.`)) {
      DB.deleteAttendance(attId);
      if (closeDetail) {
        document.querySelector('.modal-backdrop')?.remove();
      }
      App.showToast(`Catatan absensi ${typeLabel} berhasil dihapus. Siswa dapat absen kembali!`, 'success');
      App.renderCurrentView();
    }
  }

  static promptResetTodayAttendance() {
    const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (confirm(`Apakah Anda yakin ingin menghapus SEMUA catatan absensi untuk hari ini (${todayStr})?\n\nTindakan ini akan mengosongkan riwayat hari ini sehingga seluruh siswa dapat melakukan presensi ulang.`)) {
      const deletedCount = DB.resetTodayAttendance();
      App.showToast(`Berhasil menghapus ${deletedCount} riwayat absensi hari ini!`, 'success');
      App.renderCurrentView();
    }
  }

  static reviewLeave(leaveId, newStatus) {
    const leave = DB.getLeaveRequests().find(l => l.id === leaveId);
    const student = DB.getProfileById(leave?.user_id);
    const studentName = student?.full_name || 'Siswa';

    let customNote = `Disetujui oleh admin sekolah pada ${new Date().toLocaleTimeString('id-ID')} WIB`;
    if (newStatus === 'rejected') {
      const input = prompt(`Masukkan alasan penolakan izin/sakit untuk "${studentName}":`, 'Surat keterangan dokter belum lengkap atau tidak valid.');
      if (input === null) return; // Tindakan dibatalkan admin
      customNote = input.trim() || 'Ditolak oleh admin sekolah.';
    }

    DB.updateLeaveRequest(leaveId, newStatus, customNote);
    App.showToast(`Permohonan ${leave?.type === 'sakit' ? 'sakit' : 'izin'} ${studentName} berhasil ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}!`, 'success');
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

          <div id="modalLinkingStatus" style="margin-top: 14px;">
            <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>Menunggu pesan dari wali di @${window.AppConfig?.telegramBotUsername || 'AbsenM3INBot'}...</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 14px;">
            <button class="btn btn-outline scale-press" style="flex: 1; font-size: 0.8rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="navigator.clipboard?.writeText('${codeObj.rawCode}'); App.showToast('Kode ${codeObj.rawCode} berhasil disalin!', 'success');">
              ${Icons.fileText(14)} Salin Kode
            </button>
            <button class="btn btn-primary scale-press" style="flex: 1.3; font-size: 0.8rem; background: #24A1DE; border-color: #24A1DE; display: inline-flex; align-items: center; justify-content: center; gap: 6px;" onclick="App.openTelegramSimulatorModal('/start ${codeObj.rawCode}')">
              ${Icons.send(14)} Uji di Simulator
            </button>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 12px;">
            <button class="btn btn-secondary btn-block scale-press" onclick="clearInterval(window._tgModalInterval); this.closest('.modal-backdrop').remove()">Tutup</button>
            <button class="btn btn-primary btn-block scale-press" onclick="AdminView.checkModalLinking('${guardianId}')">Cek Status Penautan</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    clearInterval(window._tgModalInterval);
    window._tgModalInterval = setInterval(async () => {
      if (!document.getElementById('modalLinkingStatus')) {
        clearInterval(window._tgModalInterval);
        return;
      }
      await TelegramService.syncBotUpdates();
      const updatedG = DB.getGuardians().find(g => g.id === guardianId);
      if (updatedG && updatedG.telegram_chat_id) {
        clearInterval(window._tgModalInterval);
        const el = document.getElementById('modalLinkingStatus');
        if (el) {
          el.innerHTML = `
            <div style="background: #ECFDF5; border: 1px solid #10B981; color: #065F46; padding: 10px 14px; border-radius: var(--radius-input); font-weight: 700; font-size: 0.85rem;">
              Berhasil Tertaut! Akun ${updatedG.telegram_username} (${updatedG.telegram_chat_id}) kini aktif menerima notifikasi presensi.
            </div>
          `;
        }
        App.showToast('Akun Telegram berhasil ditautkan!', 'success');
      }
    }, 2500);
  }

  static async checkModalLinking(guardianId) {
    App.showToast('Memeriksa pesan baru dari Telegram...', 'info');
    await TelegramService.syncBotUpdates();
    const updatedG = DB.getGuardians().find(g => g.id === guardianId);
    if (updatedG && updatedG.telegram_chat_id) {
      const el = document.getElementById('modalLinkingStatus');
      if (el) {
        el.innerHTML = `
          <div style="background: #ECFDF5; border: 1px solid #10B981; color: #065F46; padding: 10px 14px; border-radius: var(--radius-input); font-weight: 700; font-size: 0.85rem;">
            Berhasil Tertaut! Akun ${updatedG.telegram_username} (${updatedG.telegram_chat_id}) kini aktif menerima notifikasi presensi.
          </div>
        `;
      }
      App.showToast('Akun Telegram berhasil ditautkan!', 'success');
    } else {
      App.showToast('Belum ada pesan yang cocok dari Telegram. Pastikan kode sudah dikirimkan ke @AbsenM3INBot.', 'warning');
    }
  }

  static promptUnlinkTelegram(guardianId) {
    const reason = prompt('Masukkan alasan verifikasi pemutusan tautan Telegram (PRD FR-44):', 'Permintaan orang tua / pergantian nomor HP');
    if (reason) {
      DB.unlinkGuardianTelegram(guardianId, reason);
      App.showToast('Tautan Telegram berhasil diputuskan!', 'success');
      App.renderCurrentView();
    }
  }

  static async triggerWorker() {
    App.showToast('Memproses antrean notifikasi...', 'info');
    const sent = await TelegramService.runWorker();
    App.showToast(`Worker selesai memproses ${sent} pesan Telegram!`, 'success');
    App.renderCurrentView();
  }

  static async syncTelegramBot() {
    App.showToast('Memeriksa pesan masuk dari bot Telegram...', 'info');
    const res = await TelegramService.syncBotUpdates();
    if (res.success) {
      App.showToast(res.message, res.count > 0 ? 'success' : 'info');
      App.renderCurrentView();
    } else {
      App.showToast('Gagal sinkronisasi: ' + (res.error || res.message), 'error');
    }
  }

  static openTestTelegramModal() {
    const botUser = window.AppConfig?.telegramBotUsername || 'AbsenM3INBot';
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 440px;">
        <div class="modal-header">
          <div class="modal-title">Uji Kirim Pesan Telegram</div>
          <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
            Kirimkan pesan pengujian langsung dari bot <b>@${botUser}</b> ke akun Telegram Anda untuk memastikan integrasi API berjalan lancar.
          </p>
          <div class="form-group">
            <label class="form-label form-label-required">Telegram Chat ID Penerima</label>
            <input type="text" id="testChatId" class="form-input" placeholder="Contoh: 123456789" />
            <span class="form-help">Pastikan Anda sudah menekan START pada @${botUser} terlebih dahulu agar bot diizinkan mengirim pesan.</span>
          </div>
          <div class="form-group">
            <label class="form-label">Teks Pesan</label>
            <textarea id="testMsgText" class="form-textarea" rows="3">Halo! Ini adalah pesan uji coba resmi dari Sistem Presensi SMAN 1 Teladan via @${botUser}.</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Batal</button>
          <button class="btn btn-primary" onclick="AdminView.sendTestTelegram(this)">Kirim Pesan</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  static async sendTestTelegram(btn) {
    const chatId = document.getElementById('testChatId')?.value.trim();
    const text = document.getElementById('testMsgText')?.value.trim();
    if (!chatId) {
      App.showToast('Harap masukkan Telegram Chat ID penerima!', 'error');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Mengirim...';

    const res = await TelegramService.sendRealMessage(chatId, text);
    if (res.success) {
      btn.closest('.modal-backdrop').remove();
      App.showToast('Pesan berhasil terkirim ke Telegram Anda!', 'success');
    } else {
      btn.disabled = false;
      btn.textContent = 'Kirim Pesan';
      App.showToast('Gagal mengirim: ' + res.error, 'error');
    }
  }

  static exportToCSV() {
    const list = this.getFilteredAttendanceList();
    if (list.length === 0) {
      App.showToast('Tidak ada data absensi untuk diekspor!', 'warning');
      return;
    }

    let csv = '\uFEFFNo,ID,NIS,Nama Siswa,Kelas,Tipe,Tanggal,Jam Server,Jarak (m),Akurasi GPS (m),Status,Alasan Luar Area\n';

    list.forEach((a, idx) => {
      const s = DB.getProfileById(a.user_id);
      const d = new Date(a.server_time);
      const dateStr = d.toLocaleDateString('id-ID');
      const timeStr = d.toLocaleTimeString('id-ID') + ' WIB';
      const statusIndo = {
        'on_time': 'Tepat Waktu',
        'late': 'Terlambat',
        'outside_area': 'Di Luar Area',
        'approved': 'Hadir Sah (Disetujui)',
        'rejected': 'Ditolak'
      }[a.status] || a.status;

      const row = [
        idx + 1,
        a.id,
        `"${s?.nis || ''}"`,
        `"${s?.full_name || ''}"`,
        `"${s?.class_name || ''}"`,
        a.type === 'in' ? 'Masuk' : 'Pulang',
        `"${dateStr}"`,
        `"${timeStr}"`,
        a.distance_m,
        a.accuracy_m,
        `"${statusIndo}"`,
        `"${(a.outside_reason || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const classTag = this.currentFilterClass !== 'all' ? `_${this.currentFilterClass}` : '';
    a.download = `rekap_absensi${classTag}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    App.showToast(`Berhasil mengekspor ${list.length} data absensi ke CSV!`, 'success');
  }

  static openPrintReportModal() {
    const list = this.getFilteredAttendanceList();
    const site = DB.getSite();
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const total = list.length;
    const onTime = list.filter(a => a.status === 'on_time').length;
    const late = list.filter(a => a.status === 'late').length;
    const outside = list.filter(a => a.status === 'outside_area').length;
    const approved = list.filter(a => a.status === 'approved').length;
    const rate = total > 0 ? Math.round(((onTime + approved) / total) * 100) : 0;

    const modal = document.createElement('div');
    modal.id = 'printReportModal';
    modal.className = 'report-sheet-modal';
    modal.innerHTML = `
      <div class="report-modal-content">
        <!-- Action Toolbar (hidden on print) -->
        <div class="print-no-print" style="padding: 12px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--surface-alt);">
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            ${Icons.fileText(18)}
            <span>Pratinjau Dokumen Cetak / PDF</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary scale-press" style="display: inline-flex; align-items: center; gap: 6px;" onclick="window.print()">
              ${Icons.download(16)} Cetak Dokumen / Simpan PDF
            </button>
            <button class="btn btn-secondary scale-press" onclick="document.getElementById('printReportModal').remove()">
              Tutup
            </button>
          </div>
        </div>

        <!-- Official Report Sheet -->
        <div class="report-sheet">
          <!-- Kop Surat Resmi -->
          <div class="report-kop">
            <div class="report-kop-logo">
              SMA
            </div>
            <div class="report-kop-text">
              <div class="report-kop-instansi">PEMERINTAH DAERAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN</div>
              <div class="report-kop-sekolah">${site.name.toUpperCase()}</div>
              <div class="report-kop-alamat">Jalan Pendidikan No. 1 • Telp: (031) 555-0199 • Surel: tatausaha@sman1teladan.sch.id</div>
            </div>
          </div>

          <!-- Judul Dokumen -->
          <div class="report-title-block">
            <div class="report-main-title">LAPORAN REKAPITULASI PRESENSI SISWA</div>
            <div style="font-size: 0.78rem; color: #64748B; margin-top: 2px;">Tahun Ajaran 2026/2027 • Dokumen Resmi Sekolah</div>
          </div>

          <!-- Metadata -->
          <div class="report-meta-grid">
            <div><b>Filter Kelas:</b> ${this.currentFilterClass === 'all' ? 'Seluruh Kelas' : this.currentFilterClass}</div>
            <div><b>Periode Tanggal:</b> ${this.currentFilterDate === 'today' ? 'Hari Ini' : this.currentFilterDate === 'this_month' ? 'Bulan Ini' : 'Semua Riwayat'}</div>
            <div><b>Status Filter:</b> ${this.currentFilterStatus === 'all' ? 'Semua Status' : this.currentFilterStatus}</div>
            <div><b>Tanggal Cetak:</b> ${today}</div>
          </div>

          <!-- Summary Stat Boxes -->
          <div class="report-summary-boxes">
            <div class="report-stat-box">
              <div class="report-stat-num">${total}</div>
              <div class="report-stat-label">Total Log</div>
            </div>
            <div class="report-stat-box">
              <div class="report-stat-num" style="color: #059669;">${onTime + approved}</div>
              <div class="report-stat-label">Hadir Sah</div>
            </div>
            <div class="report-stat-box">
              <div class="report-stat-num" style="color: #D97706;">${late}</div>
              <div class="report-stat-label">Terlambat</div>
            </div>
            <div class="report-stat-box">
              <div class="report-stat-num" style="color: #2563EB;">${rate}%</div>
              <div class="report-stat-label">Persentase Sah</div>
            </div>
          </div>

          <!-- Data Table -->
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">No</th>
                <th>NIS</th>
                <th>Nama Lengkap</th>
                <th>Kelas</th>
                <th>Tipe</th>
                <th>Jam Server</th>
                <th>Jarak</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #94A3B8;">Tidak ada catatan absensi yang sesuai filter.</td></tr>' : ''}
              ${list.map((a, idx) => {
                const s = DB.getProfileById(a.user_id);
                const statusLabel = {
                  'on_time': 'Tepat Waktu',
                  'late': 'Terlambat',
                  'outside_area': 'Di Luar Area',
                  'approved': 'Hadir Sah (Disetujui)',
                  'rejected': 'Ditolak'
                }[a.status] || a.status;

                return `
                  <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td style="font-family: monospace;">${s?.nis || '-'}</td>
                    <td><b>${s?.full_name || 'Siswa'}</b></td>
                    <td>${s?.class_name || '-'}</td>
                    <td>${a.type === 'in' ? 'Masuk' : 'Pulang'}</td>
                    <td>${new Date(a.server_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</td>
                    <td>${GeoService.formatDistance(a.distance_m)}</td>
                    <td><b>${statusLabel}</b></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Signature Block -->
          <div class="report-signature-block">
            <div class="report-sign-col">
              <div>Mengetahui,</div>
              <div><b>Wali Kelas / Pembina</b></div>
              <div class="report-sign-space"></div>
              <div><u>( .................................................. )</u></div>
              <div style="font-size: 0.75rem; color: #64748B;">NIP. .........................................</div>
            </div>
            <div class="report-sign-col">
              <div>Surabaya, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div><b>Kepala Sekolah</b></div>
              <div class="report-sign-space"></div>
              <div><u>Dr. H. Bambang Sudarsono, M.Pd.</u></div>
              <div style="font-size: 0.75rem; color: #64748B;">NIP. 19740512 199903 1 004</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  static showDetailModal(attId) {
    const att = DB.getAttendance().find(a => a.id === attId);
    if (!att) return;
    const student = DB.getProfileById(att.user_id);
    const isPendingReview = att.status === 'outside_area';

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 540px;">
        <div class="modal-header">
          <div class="modal-title">Detail Catatan Absensi</div>
          <button class="modal-close-btn" onclick="this.closest('.modal-backdrop').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; gap: 16px; align-items: flex-start;">
            <img src="${att.selfie_path}" alt="Selfie" style="width: 130px; height: 130px; border-radius: var(--radius-card); object-fit: cover; border: 1px solid var(--border); box-shadow: 0 2px 4px rgba(0,0,0,0.06); flex-shrink: 0;" />
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.88rem; flex: 1;">
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary-900);">${student?.full_name || 'Siswa'}</div>
              <div><b>NIS:</b> ${student?.nis || '-'} • <b>Kelas:</b> ${student?.class_name || '-'}</div>
              <div><b>Tipe:</b> Absen ${att.type === 'in' ? 'Masuk' : 'Pulang'}</div>
              <div><b>Status:</b> ${AdminView.getStatusBadgeHtml(att.status)}</div>
              ${att.review_note ? `<div style="font-size: 0.8rem; color: var(--text-secondary); background: var(--surface-alt); padding: 5px 8px; border-radius: 6px; border: 1px solid var(--border);"><b>Catatan Verifikasi:</b> ${att.review_note}</div>` : ''}
            </div>
          </div>

          <div style="background: var(--surface-alt); padding: 14px; border-radius: var(--radius-card); font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px; margin-top: 14px; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Waktu Server Resmi:</span>
              <b>${new Date(att.server_time).toLocaleString('id-ID')} WIB</b>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Koordinat GPS:</span>
              <code>${att.lat}, ${att.lng}</code>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Jarak ke Titik Sekolah:</span>
              <b>${GeoService.formatDistance(att.distance_m)}</b>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Akurasi Sensor Perangkat:</span>
              <span>±${att.accuracy_m} meter</span>
            </div>
            ${att.outside_reason ? `
            <div style="border-top: 1px dashed var(--border); padding-top: 8px; margin-top: 2px;">
              <b style="color: var(--warning);">Alasan Berada di Luar Radius:</b>
              <div style="background: #FFF; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--warning-border); margin-top: 4px; font-style: italic; color: #78350F;">
                "${att.outside_reason}"
              </div>
            </div>
            ` : ''}
          </div>

          ${isPendingReview ? `
          <div style="background: var(--primary-50); border: 1px solid var(--primary-100); padding: 14px; border-radius: var(--radius-card); margin-top: 14px;">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--primary-900); margin-bottom: 6px;">Keputusan Tinjauan Guru / Admin:</div>
            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" style="font-size: 0.78rem;">Catatan Verifikasi (Opsional)</label>
              <input type="text" id="reviewNoteInput" class="form-input" placeholder="Contoh: Terkonfirmasi mengikuti kegiatan OSIS di luar kampus" />
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-success scale-press" style="flex: 1;" onclick="AdminView.submitAttendanceReviewFromModal('${att.id}', 'approved')">
                Setujui (Hadir Sah)
              </button>
              <button class="btn btn-outline scale-press" style="flex: 1; color: var(--danger); border-color: var(--danger);" onclick="AdminView.submitAttendanceReviewFromModal('${att.id}', 'rejected')">
                Tolak Presensi
              </button>
            </div>
          </div>
          ` : ''}
        </div>
        <div class="modal-footer" style="display: flex; justify-content: space-between;">
          <button class="btn btn-outline scale-press" style="color: var(--danger); border-color: var(--danger);" onclick="AdminView.confirmDeleteAttendance('${att.id}', true)">${Icons.trash(14)} Hapus Catatan</button>
          <button class="btn btn-secondary scale-press" onclick="this.closest('.modal-backdrop').remove()">Tutup</button>
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

  static async syncCloud() {
    App.showToast('Menghubungkan ke Supabase Cloud...', 'info');
    if (typeof SupabaseService === 'undefined' || !SupabaseService.isConfigured()) {
      App.showToast('Konfigurasi URL atau Key Supabase belum diisi di AppConfig.', 'danger');
      return;
    }

    const conn = await SupabaseService.checkConnection();
    if (!conn.ok) {
      App.showToast(`Supabase: ${conn.error || 'Gagal tersambung'}. Pastikan skrip supabase_fix_rls.sql telah dijalankan di Supabase.`, 'warning');
      this.render(document.getElementById('appContent'));
      return;
    }

    const res = await SupabaseService.pushToCloud();
    if (res && res.success) {
      App.showToast(res.message || 'Data berhasil disinkronkan ke Supabase Cloud!', 'success');
    } else {
      App.showToast(`Sinkronisasi parsial: ${res?.error || 'Periksa skema tabel Supabase'}`, 'warning');
    }
    this.render(document.getElementById('appContent'));
  }
}

window.AdminView = AdminView;
