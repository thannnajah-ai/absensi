/**
 * SUPABASE REST API SERVICE & SYNC ADAPTER
 * Menghubungkan aplikasi web langsung ke Supabase Cloud REST API
 * Menggunakan pendekatan Offline-First (Local-First + Cloud Synchronization)
 */

class SupabaseService {
  static status = 'checking'; // 'connected' | 'error' | 'offline' | 'unconfigured'
  static lastSyncTime = null;
  static lastError = null;

  static get url() {
    return window.AppConfig?.supabaseUrl || '';
  }

  static get key() {
    return window.AppConfig?.supabaseAnonKey || '';
  }

  static isConfigured() {
    return Boolean(this.url && this.key && !this.url.includes('example'));
  }

  static getHeaders() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  /**
   * Tes konektivitas langsung ke REST API Supabase
   */
  static async checkConnection() {
    if (!this.isConfigured()) {
      this.status = 'unconfigured';
      return { ok: false, error: 'URL atau Key Supabase belum diatur di AppConfig.' };
    }

    if (!navigator.onLine) {
      this.status = 'offline';
      return { ok: false, error: 'Koneksi perangkat offline.' };
    }

    try {
      const res = await fetch(`${this.url}/rest/v1/settings?select=*&limit=1`, {
        headers: this.getHeaders()
      });

      if (res.ok) {
        this.status = 'connected';
        this.lastError = null;
        return { ok: true };
      } else {
        const errJson = await res.json().catch(() => ({}));
        this.status = 'error';
        this.lastError = errJson.message || `HTTP ${res.status}`;
        return { ok: false, status: res.status, error: this.lastError };
      }
    } catch (err) {
      this.status = 'error';
      this.lastError = err.message;
      return { ok: false, error: err.message };
    }
  }

  /**
   * Query data dari tabel Supabase
   */
  static async select(table, query = '') {
    if (!this.isConfigured()) return null;
    try {
      const qs = query ? `?${query}` : '?select=*';
      const res = await fetch(`${this.url}/rest/v1/${table}${qs}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[Supabase] SELECT ${table} gagal:`, err.message);
      return null;
    }
  }

  /**
   * Insert record ke tabel Supabase
   */
  static async insert(table, data) {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      this.lastSyncTime = new Date();
      return await res.json();
    } catch (err) {
      console.warn(`[Supabase] INSERT ${table} gagal:`, err.message);
      return null;
    }
  }

  /**
   * Upsert record ke tabel Supabase (Insert or Update on Conflict)
   */
  static async upsert(table, data) {
    if (!this.isConfigured()) return null;
    try {
      const headers = {
        ...this.getHeaders(),
        'Prefer': 'resolution=merge-duplicates,return=representation'
      };
      const res = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      this.lastSyncTime = new Date();
      return await res.json();
    } catch (err) {
      console.warn(`[Supabase] UPSERT ${table} gagal:`, err.message);
      return null;
    }
  }

  /**
   * Update record di Supabase berdasarkan kriteria
   */
  static async update(table, matchField, matchValue, data) {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}?${matchField}=eq.${matchValue}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      this.lastSyncTime = new Date();
      return await res.json();
    } catch (err) {
      console.warn(`[Supabase] UPDATE ${table} gagal:`, err.message);
      return null;
    }
  }

  /**
   * Delete record dari Supabase berdasarkan kriteria
   */
  static async delete(table, matchField, matchValue) {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}?${matchField}=eq.${matchValue}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      this.lastSyncTime = new Date();
      return true;
    } catch (err) {
      console.warn(`[Supabase] DELETE ${table} gagal:`, err.message);
      return false;
    }
  }

  /**
   * Sinkronisasi Dua Arah: Tarik data terbaru dari Cloud Supabase ke LocalStorage
   */
  static async pullFromCloud() {
    const conn = await this.checkConnection();
    if (!conn.ok) return { success: false, error: conn.error };

    try {
      const [profiles, sites, attendance, leaveRequests, guardians, consents] = await Promise.all([
        this.select('profiles'),
        this.select('sites'),
        this.select('attendance'),
        this.select('leave_requests'),
        this.select('student_guardians'),
        this.select('consents')
      ]);

      const localDb = DB.get();
      let updated = false;

      // 1. Merge Profiles (Preserve local profiles)
      if (Array.isArray(profiles) && profiles.length > 0) {
        const pMap = new Map((localDb.profiles || []).map(p => [p.id, p]));
        for (const p of profiles) {
          pMap.set(p.id, { ...pMap.get(p.id), ...p });
        }
        localDb.profiles = Array.from(pMap.values());
        updated = true;
      }

      // 2. Merge Sites
      if (Array.isArray(sites) && sites.length > 0) {
        localDb.sites = sites;
        updated = true;
      }

      // 3. Merge Attendance (Preserve offline / local records not yet in cloud)
      if (Array.isArray(attendance) && attendance.length > 0) {
        const aMap = new Map((localDb.attendance || []).map(a => [a.id, a]));
        for (const a of attendance) {
          aMap.set(a.id, { ...aMap.get(a.id), ...a });
        }
        localDb.attendance = Array.from(aMap.values()).sort((a, b) => new Date(b.server_time) - new Date(a.server_time));
        updated = true;
      }

      // 4. Merge Leave Requests
      if (Array.isArray(leaveRequests) && leaveRequests.length > 0) {
        const lMap = new Map((localDb.leave_requests || []).map(l => [l.id, l]));
        for (const l of leaveRequests) {
          lMap.set(l.id, { ...lMap.get(l.id), ...l });
        }
        localDb.leave_requests = Array.from(lMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        updated = true;
      }

      // 5. Merge Guardians
      if (Array.isArray(guardians) && guardians.length > 0) {
        const gMap = new Map((localDb.guardians || []).map(g => [g.id, g]));
        for (const g of guardians) {
          gMap.set(g.id, { ...gMap.get(g.id), ...g });
        }
        localDb.guardians = Array.from(gMap.values());
        updated = true;
      }

      // 6. Merge Consents
      if (Array.isArray(consents) && consents.length > 0) {
        const cMap = new Map((localDb.consents || []).map(c => [c.id || `${c.student_id}_${c.purpose}`, c]));
        for (const c of consents) {
          const key = c.id || `${c.student_id}_${c.purpose}`;
          cMap.set(key, { ...cMap.get(key), ...c });
        }
        localDb.consents = Array.from(cMap.values());
        updated = true;
      }

      if (updated) {
        DB.save(localDb);
        this.lastSyncTime = new Date();
        if (typeof App !== 'undefined' && typeof App.renderCurrentView === 'function') {
          App.renderCurrentView();
        }
      }

      return {
        success: true,
        counts: {
          profiles: profiles?.length || 0,
          attendance: attendance?.length || 0,
          leaveRequests: leaveRequests?.length || 0
        }
      };
    } catch (err) {
      console.error('[Supabase] Gagal sinkronisasi dari cloud:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Dorong seluruh data lokal ke Cloud Supabase (Initial Seeding / Force Sync)
   */
  static async pushToCloud() {
    const conn = await this.checkConnection();
    if (!conn.ok) return { success: false, error: conn.error };

    const localDb = DB.get();
    try {
      let pushedAttendance = 0;
      let pushedLeave = 0;

      // 1. Sites
      if (localDb.sites && localDb.sites.length > 0) {
        await this.upsert('sites', localDb.sites[0]);
      }

      // 2. Profiles
      if (localDb.profiles && localDb.profiles.length > 0) {
        for (const p of localDb.profiles) {
          await this.upsert('profiles', {
            id: p.id,
            full_name: p.full_name,
            nis: p.nis || null,
            email: p.email || null,
            password_hash: p.password || '123',
            class_name: p.class_name,
            role: p.role,
            active: p.active !== false
          });
        }
      }

      // 3. Attendance
      if (localDb.attendance && localDb.attendance.length > 0) {
        for (const a of localDb.attendance) {
          const res = await this.upsert('attendance', a);
          if (res) pushedAttendance++;
        }
      }

      // 4. Leave requests
      if (localDb.leave_requests && localDb.leave_requests.length > 0) {
        for (const l of localDb.leave_requests) {
          const res = await this.upsert('leave_requests', l);
          if (res) pushedLeave++;
        }
      }

      this.lastSyncTime = new Date();
      return {
        success: true,
        message: `Berhasil sinkronisasi ke cloud (${pushedAttendance} absensi, ${pushedLeave} izin/sakit)`
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

window.SupabaseService = SupabaseService;
