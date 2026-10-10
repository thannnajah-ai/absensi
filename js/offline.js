/**
 * OFFLINE QUEUE & SYNC SERVICE
 * Sesuai PRD FR-11: Penyimpanan offline lokal & sinkronisasi otomatis saat online
 */

const OFFLINE_QUEUE_KEY = 'offline_attendance_queue';

class OfflineService {
  static isOfflineSimulated = false;

  static isOnline() {
    if (this.isOfflineSimulated) return false;
    return navigator.onLine;
  }

  static getQueue() {
    try {
      const q = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch (e) {
      return [];
    }
  }

  static addToQueue(record) {
    const queue = this.getQueue();
    record.offline_queued_at = new Date().toISOString();
    record.status = 'outside_area'; // default or pending
    record.is_offline_pending = true;
    queue.push(record);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return record;
  }

  static clearQueue() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }

  static async syncQueue(onSyncedCallback) {
    if (!this.isOnline()) return { syncedCount: 0, pending: this.getQueue().length };
    
    const queue = this.getQueue();
    if (queue.length === 0) return { syncedCount: 0, pending: 0 };

    let syncedCount = 0;
    const remaining = [];

    for (const record of queue) {
      try {
        // Hapus flag offline lokal sebelum disimpan ke server
        delete record.is_offline_pending;
        record.flags = {
          ...record.flags,
          synced_from_offline: true,
          offline_queued_at: record.offline_queued_at,
          synced_at: new Date().toISOString()
        };
        // Catat waktu server resmi saat sinkronisasi tiba di server (PRD FR-11)
        record.server_time = new Date().toISOString();

        DB.addAttendance(record);
        syncedCount++;
      } catch (err) {
        console.warn('Gagal menyinkronkan data offline:', err);
        // Bila duplikat atau error, jangan buang jika error jaringan
        if (!err.message.includes('sudah melakukan absen')) {
          remaining.push(record);
        }
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));

    if (syncedCount > 0 && typeof onSyncedCallback === 'function') {
      onSyncedCallback(syncedCount);
    }

    return { syncedCount, pending: remaining.length };
  }
}

// Pasang event listener jaringan
window.addEventListener('online', () => {
  OfflineService.syncQueue((count) => {
    if (window.App && window.App.showToast) {
      window.App.showToast(`Berhasil menyinkronkan ${count} data absen yang tertunda!`, 'success');
      window.App.renderCurrentView();
    }
  });
});

window.OfflineService = OfflineService;
