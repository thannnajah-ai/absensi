/**
 * PARENT DIGITAL CONSENT VIEW (Persetujuan Digital Orang Tua / Wali)
 * Sesuai PRD Bagian 5.6 FR-25 s/d FR-30a & Kepatuhan UU PDP No. 27/2022
 */

class ConsentView {
  static openModal(studentId) {
    const student = DB.getProfileById(studentId) || DB.getProfiles().find(p => p.role === 'student');
    const guardians = DB.getGuardians(student.id);
    const primaryGuardian = guardians[0] || { guardian_name: 'Orang Tua / Wali' };
    const existingConsents = DB.getConsents(student.id);

    const hasCamera = existingConsents.length > 0 ? existingConsents.some(c => c.scope === 'camera_location') : true;
    const hasTelegram = existingConsents.length > 0 ? existingConsents.some(c => c.scope === 'telegram_notification') : true;
    const hasFace = existingConsents.some(c => c.scope === 'face');

    const latestConsent = existingConsents[0];
    const signedGuardianName = latestConsent?.guardian_name || primaryGuardian.guardian_name.replace(/\(.*\)/, '').trim();

    const modal = document.createElement('div');
    modal.id = 'consentModal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 580px;">
        <div class="modal-header">
          <div>
            <div class="modal-title">Formulir Persetujuan Digital Orang Tua/Wali</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
              Kepatuhan UU Perlindungan Data Pribadi (UU PDP No. 27/2022 Pasal 25)
            </div>
          </div>
          <button class="modal-close-btn" onclick="document.getElementById('consentModal').remove()">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Subject Info Banner -->
          <div style="background: var(--primary-50); border: 1px solid var(--primary-100); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 0.84rem; color: var(--primary-900);">
            <b>Subjek Data Siswa:</b> ${student.full_name} (${student.class_name}) • <b>NIS:</b> ${student.nis}
          </div>

          ${existingConsents.length > 0 ? `
            <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.82rem; color: #065F46;">
              <b>Status Terdaftar:</b> Persetujuan aktif telah ditandatangani oleh <b>${latestConsent.guardian_name}</b> pada ${new Date(latestConsent.consented_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (${existingConsents.length} izin aktif).
            </div>
          ` : `
            <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.82rem; color: #78350F;">
              <b>Pemberitahuan:</b> Siswa ini belum memiliki formulir persetujuan digital yang terkonfirmasi.
            </div>
          `}

          <div style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
            Sesuai regulasi privasi perlindungan data anak, pemrosesan data kamera, lokasi, dan notifikasi memerlukan persetujuan eksplisit orang tua/wali. Data foto disimpan maksimal 30 hari dan tidak disebarluaskan ke pihak ketiga.
          </div>

          <!-- Separate Scope Checkboxes (PRD FR-27) -->
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
            <label class="consent-scope-card">
              <input type="checkbox" id="scopeCamera" ${hasCamera ? 'checked' : ''} />
              <div style="font-size: 0.84rem;">
                <b style="color: var(--text-primary);">1. Izin Kamera & Geolokasi Saat Absensi (Wajib untuk Sistem)</b>
                <div style="color: var(--text-secondary); font-size: 0.78rem; margin-top: 2px;">
                  Mengizinkan pengambilan swafoto kamera depan dan titik geolokasi perangkat hanya saat menekan tombol absen di radius gerbang sekolah.
                </div>
              </div>
            </label>

            <label class="consent-scope-card">
              <input type="checkbox" id="scopeTelegram" ${hasTelegram ? 'checked' : ''} />
              <div style="font-size: 0.84rem;">
                <b style="color: var(--text-primary);">2. Izin Notifikasi Log Kehadiran via Bot Telegram</b>
                <div style="color: var(--text-secondary); font-size: 0.78rem; margin-top: 2px;">
                  Mengizinkan pengiriman notifikasi waktu kehadiran siswa ke akun Telegram orang tua/wali (pesan hanya memuat nama, jam server, dan status tanpa menyertakan foto selfie/GPS).
                </div>
              </div>
            </label>

            <label class="consent-scope-card">
              <input type="checkbox" id="scopeFace" ${hasFace ? 'checked' : ''} />
              <div style="font-size: 0.84rem;">
                <b style="color: var(--text-primary);">3. Izin Pengenalan Vektor Wajah Biometrik (Rilis 2)</b>
                <div style="color: var(--text-secondary); font-size: 0.78rem; margin-top: 2px;">
                  Persetujuan awal untuk ekstraksi dan pencocokan embedding wajah otomatis yang akan diaktifkan pada pembaruan Rilis 2 mendatang.
                </div>
              </div>
            </label>
          </div>

          <div class="form-group" style="margin-top: 6px;">
            <label class="form-label form-label-required">Nama Lengkap Orang Tua / Wali yang Menyetujui</label>
            <input type="text" id="consentGuardianName" class="form-input" value="${signedGuardianName}" placeholder="Masukkan nama lengkap orang tua/wali..." />
          </div>

          <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
            PRD FR-30a: Orang tua/wali berhak memperbarui pilihan atau mencabut persetujuan pemrosesan data sewaktu-waktu.
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div>
            ${existingConsents.length > 0 ? `
              <button type="button" class="btn btn-sm btn-outline scale-press" style="color: var(--danger); border-color: var(--danger); padding: 4px 8px; font-size: 0.75rem;" onclick="ConsentView.revokeAllConsent('${student.id}')">
                Cabut Izin
              </button>
            ` : ''}
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-left: auto;">
            <button class="btn btn-secondary scale-press" style="padding: 6px 12px; font-size: 0.82rem;" onclick="document.getElementById('consentModal').remove()">Batal</button>
            <button class="btn btn-primary scale-press" style="padding: 6px 14px; font-size: 0.82rem;" onclick="ConsentView.submitConsent('${student.id}')">
              ${existingConsents.length > 0 ? 'Perbarui Persetujuan' : 'Simpan Persetujuan'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  static submitConsent(studentId) {
    const guardianName = document.getElementById('consentGuardianName')?.value?.trim();
    if (!guardianName) {
      App.showToast('Harap masukkan nama lengkap orang tua/wali!', 'error');
      document.getElementById('consentGuardianName')?.focus();
      return;
    }

    const scopeCamera = document.getElementById('scopeCamera')?.checked;
    const scopeTelegram = document.getElementById('scopeTelegram')?.checked;
    const scopeFace = document.getElementById('scopeFace')?.checked;

    if (!scopeCamera && !scopeTelegram && !scopeFace) {
      App.showToast('Minimal pilih satu tujuan pemrosesan data (atau klik Cabut Izin)!', 'error');
      return;
    }

    // Bersihkan consent lama agar status tersinkronisasi murni dengan pilihan saat ini
    DB.clearConsents(studentId);

    const baseData = {
      user_id: studentId,
      guardian_name: guardianName,
      text_version: 'v1.1-2026',
      consented_at: new Date().toISOString(),
      device_info: navigator.userAgent
    };

    if (scopeCamera) {
      DB.addConsent({ ...baseData, id: 'cst-' + Date.now() + '-cam', scope: 'camera_location' });
    }
    if (scopeTelegram) {
      DB.addConsent({ ...baseData, id: 'cst-' + Date.now() + '-tg', scope: 'telegram_notification' });
    }
    if (scopeFace) {
      DB.addConsent({ ...baseData, id: 'cst-' + Date.now() + '-fc', scope: 'face' });
    }

    document.getElementById('consentModal')?.remove();
    App.showToast('Persetujuan digital orang tua (UU PDP) berhasil disimpan!', 'success');
    App.renderCurrentView();
  }

  static revokeAllConsent(studentId) {
    if (confirm('Apakah Anda yakin ingin mencabut seluruh persetujuan pemrosesan data pribadi siswa ini (PRD FR-30a)?\n\nPencabutan ini akan menonaktifkan izin pemrosesan foto, geolokasi, dan notifikasi Telegram.')) {
      DB.clearConsents(studentId);
      document.getElementById('consentModal')?.remove();
      App.showToast('Seluruh persetujuan digital siswa berhasil dicabut.', 'info');
      App.renderCurrentView();
    }
  }
}

window.ConsentView = ConsentView;
