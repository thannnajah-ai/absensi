/**
 * PARENT DIGITAL CONSENT VIEW (Persetujuan Digital Orang Tua / Wali)
 * Sesuai PRD Bagian 5.6 FR-25 s/d FR-30a & Kepatuhan UU PDP
 */

class ConsentView {
  static openModal(studentId) {
    const student = DB.getProfileById(studentId) || DB.getProfiles().find(p => p.role === 'student');
    const guardians = DB.getGuardians(student.id);
    const primaryGuardian = guardians[0] || { guardian_name: 'Orang Tua / Wali' };

    const modal = document.createElement('div');
    modal.id = 'consentModal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 580px;">
        <div class="modal-header">
          <div>
            <div class="modal-title">Formulir Persetujuan Digital Orang Tua/Wali</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">Kepatuhan UU Perlindungan Data Pribadi (UU PDP No. 27/2022)</div>
          </div>
          <button class="modal-close-btn" onclick="document.getElementById('consentModal').remove()">&times;</button>
        </div>

        <div class="modal-body">
          <div style="background: var(--primary-50); border: 1px solid var(--primary-100); border-radius: var(--radius-input); padding: 12px 14px; font-size: 0.82rem; color: var(--primary-900);">
            <b>Subjek Data Siswa:</b> ${student.full_name} (${student.class_name}) • <b>NIS:</b> ${student.nis}
          </div>

          <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
            Sesuai regulasi privasi anak dan data pribadi, sekolah memerlukan persetujuan eksplisit dari Orang Tua/Wali untuk pemrosesan data tertentu. Data disimpan secara aman dan selfie disimpan selama maksimal 30 hari.
          </div>

          <!-- Separate Scope Checkboxes (PRD FR-27) -->
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
            <label style="display: flex; gap: 10px; align-items: flex-start; cursor: pointer; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-input);">
              <input type="checkbox" id="scopeCamera" checked style="margin-top: 4px;" />
              <div style="font-size: 0.84rem;">
                <b style="color: var(--text-primary);">1. Izin Kamera & Lokasi Saat Absensi (Wajib untuk MVP)</b>
                <div style="color: var(--text-secondary); font-size: 0.78rem; margin-top: 2px;">
                  Mengizinkan pengambilan selfie via kamera depan dan koordinat geolokasi hanya pada saat siswa menekan tombol absensi di gerbang sekolah.
                </div>
              </div>
            </label>

            <label style="display: flex; gap: 10px; align-items: flex-start; cursor: pointer; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-input);">
              <input type="checkbox" id="scopeTelegram" checked style="margin-top: 4px;" />
              <div style="font-size: 0.84rem;">
                <b style="color: var(--text-primary);">2. Izin Notifikasi Log Kehadiran via Telegram Bot</b>
                <div style="color: var(--text-secondary); font-size: 0.78rem; margin-top: 2px;">
                  Mengizinkan pengiriman notifikasi waktu kehadiran siswa ke akun Telegram yang ditautkan (hanya memuat nama, waktu server, dan status tanpa GPS/foto).
                </div>
              </div>
            </label>

            <label style="display: flex; gap: 10px; align-items: flex-start; cursor: pointer; padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-input);">
              <input type="checkbox" id="scopeFace" style="margin-top: 4px;" />
              <div style="font-size: 0.84rem;">
                <b style="color: var(--text-primary);">3. Izin Pengenalan Wajah & Vektor Biometrik (Rilis 2)</b>
                <div style="color: var(--text-secondary); font-size: 0.78rem; margin-top: 2px;">
                  Persetujuan awal untuk pendaftaran dan pencocokan vektor wajah (embedding) yang akan aktif pada Rilis 2 mendatang.
                </div>
              </div>
            </label>
          </div>

          <div class="form-group" style="margin-top: 8px;">
            <label class="form-label form-label-required">Nama Lengkap Orang Tua / Wali yang Menyetujui</label>
            <input type="text" id="consentGuardianName" class="form-input" value="${primaryGuardian.guardian_name.replace(/\(.*\)/, '').trim()}" placeholder="Nama Orang Tua / Wali" />
          </div>

          <div style="font-size: 0.75rem; color: var(--text-muted);">
            Catatan: Penautan bot Telegram adalah sarana teknis notifikasi dan bukan pengganti formulir persetujuan digital ini (PRD Bagian 5.6).
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('consentModal').remove()">Tutup</button>
          <button class="btn btn-primary" onclick="ConsentView.submitConsent('${student.id}')">Simpan Persetujuan</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  static submitConsent(studentId) {
    const guardianName = document.getElementById('consentGuardianName').value.trim();
    if (!guardianName) {
      App.showToast('Harap masukkan nama orang tua/wali!', 'error');
      return;
    }

    const scopeCamera = document.getElementById('scopeCamera').checked;
    const scopeTelegram = document.getElementById('scopeTelegram').checked;
    const scopeFace = document.getElementById('scopeFace').checked;

    if (!scopeCamera && !scopeTelegram && !scopeFace) {
      App.showToast('Minimal pilih satu tujuan pemrosesan data!', 'error');
      return;
    }

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

    document.getElementById('consentModal').remove();
    App.showToast('Persetujuan digital orang tua berhasil disimpan!', 'success');
    App.renderCurrentView();
  }
}

window.ConsentView = ConsentView;
