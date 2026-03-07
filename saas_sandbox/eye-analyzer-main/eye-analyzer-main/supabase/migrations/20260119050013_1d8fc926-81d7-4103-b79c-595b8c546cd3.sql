-- 視力紀錄模組：新增 28 個視力相關欄位到 exam_records 表

-- 遠方視力 (Distance Vision) - 12 欄位
ALTER TABLE public.exam_records
ADD COLUMN IF NOT EXISTS va_distance_ua_od_raw TEXT,
ADD COLUMN IF NOT EXISTS va_distance_ua_od_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_distance_hc_od_raw TEXT,
ADD COLUMN IF NOT EXISTS va_distance_hc_od_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_distance_bcva_od_raw TEXT,
ADD COLUMN IF NOT EXISTS va_distance_bcva_od_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_distance_ua_os_raw TEXT,
ADD COLUMN IF NOT EXISTS va_distance_ua_os_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_distance_hc_os_raw TEXT,
ADD COLUMN IF NOT EXISTS va_distance_hc_os_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_distance_bcva_os_raw TEXT,
ADD COLUMN IF NOT EXISTS va_distance_bcva_os_logmar NUMERIC(4,2),

-- 近方視力 (Near Vision) - 12 欄位
ADD COLUMN IF NOT EXISTS va_near_ua_od_raw TEXT,
ADD COLUMN IF NOT EXISTS va_near_ua_od_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_near_hc_od_raw TEXT,
ADD COLUMN IF NOT EXISTS va_near_hc_od_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_near_bcva_od_raw TEXT,
ADD COLUMN IF NOT EXISTS va_near_bcva_od_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_near_ua_os_raw TEXT,
ADD COLUMN IF NOT EXISTS va_near_ua_os_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_near_hc_os_raw TEXT,
ADD COLUMN IF NOT EXISTS va_near_hc_os_logmar NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS va_near_bcva_os_raw TEXT,
ADD COLUMN IF NOT EXISTS va_near_bcva_os_logmar NUMERIC(4,2),

-- 測量 Metadata - 4 欄位
ADD COLUMN IF NOT EXISTS va_distance_test_meters NUMERIC(3,1) DEFAULT 6.0,
ADD COLUMN IF NOT EXISTS va_near_test_cm NUMERIC(3,0) DEFAULT 40,
ADD COLUMN IF NOT EXISTS va_correction_type TEXT,
ADD COLUMN IF NOT EXISTS va_notes TEXT;