/**
 * GEOLOCATION SERVICE & HAVERSINE DISTANCE CALCULATOR
 * Sesuai PRD FR-6, FR-8, & Kontrak API
 */

class GeoService {
  // Mode simulasi untuk kemudahan pengujian demo / tanpa GPS fisik
  static mockMode = 'school'; // 'school', 'outside', 'low_accuracy', 'real'

  /**
   * Menghitung jarak antara dua koordinat menggunakan rumus Haversine (meter)
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius bumi dalam meter
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Mengambil lokasi pengguna (mendukung GPS asli dan mode simulasi)
   */
  static async getCurrentLocation(site) {
    if (window.AppConfig && window.AppConfig.isProduction) {
      this.mockMode = 'real';
    }

    const schoolLat = site ? site.lat : (window.AppConfig?.defaultLat || -7.8037);
    const schoolLng = site ? site.lng : (window.AppConfig?.defaultLng || 110.3533);

    if (this.mockMode === 'school') {
      // Tepat di sekolah (misal 15 meter dari titik sekolah)
      const lat = schoolLat + 0.0001;
      const lng = schoolLng + 0.0001;
      const distance = this.calculateDistance(lat, lng, schoolLat, schoolLng);
      return {
        lat,
        lng,
        accuracy_m: 12,
        distance_m: distance,
        isInsideRadius: distance <= (site?.radius_m || 100),
        isMock: true,
        mockLabel: 'Simulasi: Di Sekolah (Radius Aman)'
      };
    }

    if (this.mockMode === 'outside') {
      // 1.5 km di luar sekolah
      const lat = schoolLat + 0.0135;
      const lng = schoolLng + 0.0135;
      const distance = this.calculateDistance(lat, lng, schoolLat, schoolLng);
      return {
        lat,
        lng,
        accuracy_m: 18,
        distance_m: distance,
        isInsideRadius: false,
        isMock: true,
        mockLabel: 'Simulasi: Di Rumah / Luar Radius (1.5 km)'
      };
    }

    if (this.mockMode === 'low_accuracy') {
      const lat = schoolLat + 0.0002;
      const lng = schoolLng + 0.0002;
      const distance = this.calculateDistance(lat, lng, schoolLat, schoolLng);
      return {
        lat,
        lng,
        accuracy_m: 75, // Akurasi buruk > 50m
        distance_m: distance,
        isInsideRadius: distance <= (site?.radius_m || 100),
        isMock: true,
        mockLabel: 'Simulasi: GPS Lemah (>50m)'
      };
    }

    // Menggunakan navigator.geolocation fisik asli
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Perangkat tidak mendukung geolokasi.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);
          const distance = this.calculateDistance(lat, lng, schoolLat, schoolLng);
          resolve({
            lat,
            lng,
            accuracy_m: accuracy,
            distance_m: distance,
            isInsideRadius: distance <= (site?.radius_m || 100),
            isMock: false
          });
        },
        (err) => {
          let msg = 'Gagal mengakses geolokasi.';
          if (err.code === 1) msg = 'Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser.';
          else if (err.code === 2) msg = 'Posisi tidak tersedia. Coba lagi.';
          else if (err.code === 3) msg = 'Waktu permintaan lokasi habis.';
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  static formatDistance(meters) {
    if (meters < 1000) return `${meters} meter`;
    return `${(meters / 1000).toFixed(2)} km`;
  }
}

window.GeoService = GeoService;
