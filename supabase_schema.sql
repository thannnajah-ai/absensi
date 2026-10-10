-- ==============================================================================
-- SKEMA BASIS DATA: APLIKASI ABSENSI OTOMATIS
-- Versi 1.1 (Supabase PostgreSQL + RLS + Triggers + Haversine Function)
-- ==============================================================================

-- Aktifkan ekstensi UUID dan Kriptografi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABEL PROFILES (Siswa dan Admin)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    nis TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    class_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABEL SITES (Titik Lokasi Sekolah)
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    radius_m INTEGER NOT NULL DEFAULT 100,
    time_in TIME NOT NULL DEFAULT '07:00:00',
    time_out TIME NOT NULL DEFAULT '15:00:00',
    late_tolerance_min INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABEL SETTINGS (Pengaturan Global)
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    selfie_retention_days INTEGER NOT NULL DEFAULT 30,
    face_threshold DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    telegram_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    telegram_reminder_time TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT single_row_settings CHECK (id = 1)
);

-- Inisialisasi default settings
INSERT INTO settings (id, selfie_retention_days, face_threshold, telegram_notifications_enabled)
VALUES (1, 30, 0.8, true)
ON CONFLICT (id) DO NOTHING;

-- 4. TABEL STUDENT_GUARDIANS (Orang Tua / Wali Siswa)
CREATE TABLE IF NOT EXISTS student_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    guardian_name TEXT NOT NULL,
    guardian_contact TEXT,
    telegram_chat_id TEXT,
    telegram_username TEXT,
    linked_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unlinked')),
    consent_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABEL TELEGRAM_LINK_CODES (Kode Sekali Pakai 24 Jam)
CREATE TABLE IF NOT EXISTS telegram_link_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_guardian_id UUID NOT NULL REFERENCES student_guardians(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),
    issued_by TEXT NOT NULL DEFAULT 'system' CHECK (issued_by IN ('system', 'admin'))
);

-- 6. TABEL CONSENTS (Persetujuan Digital Wali)
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    guardian_name TEXT NOT NULL,
    scope TEXT NOT NULL CHECK (scope IN ('camera_location', 'telegram_notification', 'face')),
    text_version TEXT NOT NULL,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    device_info TEXT,
    withdrawn_at TIMESTAMPTZ,
    token_hash TEXT,
    token_expires_at TIMESTAMPTZ
);

-- 7. TABEL ATTENDANCE (Data Absensi Masuk & Pulang)
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('in', 'out')),
    server_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    device_time TIMESTAMPTZ,
    manual_time TIMESTAMPTZ,
    manual_reason TEXT,
    outside_reason TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    accuracy_m DOUBLE PRECISION,
    distance_m DOUBLE PRECISION,
    selfie_path TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('on_time', 'late', 'outside_area', 'pending', 'approved', 'rejected')),
    flags JSONB NOT NULL DEFAULT '{}'::jsonb,
    face_score DOUBLE PRECISION,
    face_status TEXT CHECK (face_status IN ('match', 'mismatch', 'not_enrolled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks Unik: 1 Absen Masuk & 1 Absen Pulang per Siswa per Tanggal
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_attendance_per_day 
ON attendance (user_id, type, attendance_date);

-- 8. TABEL LEAVE_REQUESTS (Pengajuan Izin dan Sakit)
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('izin', 'sakit')),
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    note TEXT NOT NULL,
    attachment_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    review_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TABEL NOTIFICATION_QUEUE (Antrean Notifikasi Telegram)
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    attendance_id UUID REFERENCES attendance(id) ON DELETE CASCADE,
    leave_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE,
    student_guardian_id UUID REFERENCES student_guardians(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'telegram',
    template TEXT NOT NULL CHECK (template IN ('checkin', 'checkout', 'leave_result')),
    to_chat_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'unlinked')),
    attempts INTEGER NOT NULL DEFAULT 0,
    provider_message_id TEXT,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ
);

-- ==============================================================================
-- FUNGSI: Perhitungan Jarak Haversine (dalam satuan Meter)
-- ==============================================================================
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371000; -- Radius bumi dalam meter
    d_lat DOUBLE PRECISION;
    d_lon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    d_lat := radians(lat2 - lat1);
    d_lon := radians(lon2 - lon1);
    a := sin(d_lat / 2.0)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2.0)^2;
    c := 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Kebijakan Profiles
CREATE POLICY "Admin dapat melihat dan mengelola semua profil"
ON profiles FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Siswa dapat melihat profil sendiri"
ON profiles FOR SELECT USING (id = auth.uid());

-- Kebijakan Sites & Settings
CREATE POLICY "Semua pengguna terotentikasi dapat melihat lokasi sekolah"
ON sites FOR SELECT USING (true);

CREATE POLICY "Admin dapat mengelola lokasi sekolah"
ON sites FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Kebijakan Attendance
CREATE POLICY "Siswa hanya dapat melihat absensi miliknya"
ON attendance FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Siswa dapat menyisipkan absensi miliknya"
ON attendance FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin dapat melihat dan meninjau semua absensi"
ON attendance FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Kebijakan Leave Requests
CREATE POLICY "Siswa melihat izin miliknya"
ON leave_requests FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Siswa mengajukan izin miliknya"
ON leave_requests FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin meninjau semua pengajuan izin"
ON leave_requests FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Kebijakan Guardian & Telegram
CREATE POLICY "Admin mengelola relasi wali dan notifikasi"
ON student_guardians FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin mengelola antrean notifikasi"
ON notification_queue FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==============================================================================
-- 10. DATA SEED AWAL (Sekolah & Pengguna Uji)
-- ==============================================================================
INSERT INTO sites (id, name, lat, lng, radius_m, time_in, time_out, late_tolerance_min)
VALUES ('00000000-0000-0000-0000-000000000001', 'SMAN 1 Teladan', -6.2088, 106.8456, 100, '07:00:00', '15:00:00', 15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, full_name, nis, email, password_hash, class_name, role, active)
VALUES 
  ('00000000-0000-0000-0000-000000000011', 'Budi Santoso', '1024', 'budi@siswa.id', '123', 'XII-IPA-1', 'student', true),
  ('00000000-0000-0000-0000-000000000012', 'Siti Rahma', '1025', 'siti@siswa.id', '123', 'XII-IPA-1', 'student', true),
  ('00000000-0000-0000-0000-000000000013', 'Ahmad Fauzi', '1026', 'ahmad@siswa.id', '123', 'XII-IPS-2', 'student', true),
  ('00000000-0000-0000-0000-000000000099', 'Hendra Wijaya, S.Pd', NULL, 'admin@sekolah.id', 'admin', 'Guru / Tata Usaha', 'admin', true)
ON CONFLICT (id) DO NOTHING;

