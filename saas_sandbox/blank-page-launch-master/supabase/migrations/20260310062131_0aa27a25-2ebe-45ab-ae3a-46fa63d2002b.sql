
-- =============================================
-- 1. Update existing parent labels
-- =============================================
UPDATE industry_templates SET label = '美容健康' WHERE template_id = 'cat_beauty';
UPDATE industry_templates SET label = '汽車機車' WHERE template_id = 'cat_automotive';
-- Rename existing child: 眼鏡業 → 眼鏡驗光中心（眼鏡行）
UPDATE industry_templates SET label = '眼鏡驗光中心（眼鏡行）' WHERE template_id = 'optical';

-- =============================================
-- 2. Add new parent categories
-- =============================================
INSERT INTO industry_templates (template_id, label, emoji, parent_id, sort_order, is_active, keywords)
VALUES
  ('cat_food', '餐飲服務', '🍽️', NULL, 6, true, '[]'::jsonb),
  ('cat_retail', '零售生活', '🛒', NULL, 7, true, '[]'::jsonb),
  ('cat_education', '教育學習', '📚', NULL, 8, true, '[]'::jsonb),
  ('cat_leisure', '休閒娛樂', '🎮', NULL, 9, true, '[]'::jsonb)
ON CONFLICT (template_id) DO NOTHING;

-- =============================================
-- 3. 醫療保健 → 子產業 (keep optical sort=0, dental sort=1, add rest)
-- =============================================
INSERT INTO industry_templates (template_id, label, emoji, parent_id, sort_order, is_active, keywords)
VALUES
  ('physiotherapy', '物理治療所', '🏋️', 'cat_healthcare', 2, true, '[]'::jsonb),
  ('rehab_clinic', '復健科門診', '🩹', 'cat_healthcare', 3, true, '[]'::jsonb),
  ('tcm_clinic', '中醫診所', '🌿', 'cat_healthcare', 4, true, '[]'::jsonb),
  ('family_med', '家庭醫學科診所', '👨‍👩‍👧', 'cat_healthcare', 5, true, '[]'::jsonb),
  ('pediatric', '小兒科診所', '👶', 'cat_healthcare', 6, true, '[]'::jsonb),
  ('eye_clinic', '眼科診所', '👁️', 'cat_healthcare', 7, true, '[]'::jsonb),
  ('obgyn', '婦產科診所', '🤰', 'cat_healthcare', 8, true, '[]'::jsonb),
  ('audiology', '聽力所', '👂', 'cat_healthcare', 9, true, '[]'::jsonb),
  ('speech_therapy', '語言治療所', '🗣️', 'cat_healthcare', 10, true, '[]'::jsonb),
  ('psychotherapy', '心理治療所', '🧠', 'cat_healthcare', 11, true, '[]'::jsonb),
  ('counseling', '諮商心理所', '💬', 'cat_healthcare', 12, true, '[]'::jsonb),
  ('occupational_therapy', '職能治療所', '🤲', 'cat_healthcare', 13, true, '[]'::jsonb),
  ('imaging_center', '影像檢查中心', '📡', 'cat_healthcare', 14, true, '[]'::jsonb),
  ('medical_lab', '醫事檢驗所', '🔬', 'cat_healthcare', 15, true, '[]'::jsonb),
  ('psychiatry', '精神科診所', '🧩', 'cat_healthcare', 16, true, '[]'::jsonb),
  ('dermatology', '皮膚科診所', '🧴', 'cat_healthcare', 17, true, '[]'::jsonb),
  ('orthopedics', '骨科診所', '🦴', 'cat_healthcare', 18, true, '[]'::jsonb),
  ('rehab_med', '復健醫學科門診', '♿', 'cat_healthcare', 19, true, '[]'::jsonb)
ON CONFLICT (template_id) DO NOTHING;

-- =============================================
-- 4. 美容健康 → 子產業 (keep hair_salon sort=0, add rest)
-- =============================================
INSERT INTO industry_templates (template_id, label, emoji, parent_id, sort_order, is_active, keywords)
VALUES
  ('barber_shop', '男士理髮店', '💈', 'cat_beauty', 1, true, '[]'::jsonb),
  ('budget_haircut', '連鎖平價剪髮店', '✂️', 'cat_beauty', 2, true, '[]'::jsonb),
  ('perm_color_salon', '專業燙染護髮沙龍', '🎨', 'cat_beauty', 3, true, '[]'::jsonb),
  ('nail_studio', '美甲工作室', '💅', 'cat_beauty', 4, true, '[]'::jsonb),
  ('eyelash_studio', '美睫工作室', '👁️‍🗨️', 'cat_beauty', 5, true, '[]'::jsonb),
  ('nail_lash_combo', '綜合美甲美睫館', '✨', 'cat_beauty', 6, true, '[]'::jsonb),
  ('beauty_spa', '美容SPA館', '🧖', 'cat_beauty', 7, true, '[]'::jsonb),
  ('facial_studio', '臉部保養工作室', '🪷', 'cat_beauty', 8, true, '[]'::jsonb),
  ('body_massage', '身體按摩舒壓館', '💆', 'cat_beauty', 9, true, '[]'::jsonb),
  ('aroma_massage', '芳療精油按摩館', '🌸', 'cat_beauty', 10, true, '[]'::jsonb),
  ('korean_skin', '韓式皮膚管理中心', '🇰🇷', 'cat_beauty', 11, true, '[]'::jsonb),
  ('problem_skin', '問題肌膚保養中心', '🧬', 'cat_beauty', 12, true, '[]'::jsonb),
  ('med_beauty', '醫學美容診所', '💉', 'cat_beauty', 13, true, '[]'::jsonb),
  ('laser_center', '醫美雷射中心', '⚡', 'cat_beauty', 14, true, '[]'::jsonb),
  ('injection_clinic', '醫美微整注射門診', '💎', 'cat_beauty', 15, true, '[]'::jsonb),
  ('tattoo_brow', '眉眼唇紋繡工作室', '🖌️', 'cat_beauty', 16, true, '[]'::jsonb),
  ('tattoo_skin_combo', '紋繡皮膚管理複合店', '🎀', 'cat_beauty', 17, true, '[]'::jsonb),
  ('body_sculpt', '美體雕塑中心', '🏃', 'cat_beauty', 18, true, '[]'::jsonb)
ON CONFLICT (template_id) DO NOTHING;

-- =============================================
-- 5. 餐飲服務 → 子產業
-- =============================================
INSERT INTO industry_templates (template_id, label, emoji, parent_id, sort_order, is_active, keywords)
VALUES
  ('bento_shop', '傳統便當店', '🍱', 'cat_food', 0, true, '[]'::jsonb),
  ('set_meal', '簡餐定食餐廳', '🍽️', 'cat_food', 1, true, '[]'::jsonb),
  ('cafe', '文青咖啡廳', '☕', 'cat_food', 2, true, '[]'::jsonb),
  ('brunch', '早午餐餐廳', '🥐', 'cat_food', 3, true, '[]'::jsonb),
  ('hotpot', '火鍋專門店', '🍲', 'cat_food', 4, true, '[]'::jsonb),
  ('bbq_restaurant', '燒烤餐廳', '🥩', 'cat_food', 5, true, '[]'::jsonb),
  ('bubble_tea', '手搖飲料店', '🧋', 'cat_food', 6, true, '[]'::jsonb),
  ('noodle_snack', '麵食館小吃店', '🍜', 'cat_food', 7, true, '[]'::jsonb),
  ('bakery', '甜點烘焙坊', '🧁', 'cat_food', 8, true, '[]'::jsonb)
ON CONFLICT (template_id) DO NOTHING;

-- =============================================
-- 6. 零售生活 → 子產業
-- =============================================
INSERT INTO industry_templates (template_id, label, emoji, parent_id, sort_order, is_active, keywords)
VALUES
  ('grocery', '超市生鮮雜貨店', '🥬', 'cat_retail', 0, true, '[]'::jsonb),
  ('hypermarket', '連鎖量販店', '🏪', 'cat_retail', 1, true, '[]'::jsonb),
  ('fashion_boutique', '服飾精品店', '👗', 'cat_retail', 2, true, '[]'::jsonb),
  ('shoe_store', '鞋店', '👟', 'cat_retail', 3, true, '[]'::jsonb),
  ('electronics', '3C賣場手機行', '📱', 'cat_retail', 4, true, '[]'::jsonb),
  ('bookstore', '書局文具店', '📖', 'cat_retail', 5, true, '[]'::jsonb),
  ('pharmacy', '藥局連鎖藥妝店', '💊', 'cat_retail', 6, true, '[]'::jsonb),
  ('home_goods', '家居生活用品店', '🏠', 'cat_retail', 7, true, '[]'::jsonb)
ON CONFLICT (template_id) DO NOTHING;

-- =============================================
-- 7. 汽車機車 → 子產業 (keep auto_service sort=0, add rest)
-- =============================================
INSERT INTO industry_templates (template_id, label, emoji, parent_id, sort_order, is_active, keywords)
VALUES
  ('motorcycle_shop', '機車行維修站', '🏍️', 'cat_automotive', 1, true, '[]'::jsonb),
  ('tire_shop', '輪胎定位店', '🛞', 'cat_automotive', 2, true, '[]'::jsonb),
  ('car_detailing', '汽車美容鍍膜店', '🪄', 'cat_automotive', 3, true, '[]'::jsonb),
  ('car_wash', '洗車中心', '🚿', 'cat_automotive', 4, true, '[]'::jsonb),
  ('used_car', '二手車商', '🚘', 'cat_automotive', 5, true, '[]'::jsonb)
ON CONFLICT (template_id) DO NOTHING;

-- =============================================
-- 8. 寵物服務 → 子產業 (keep pet_hospital sort=0, add rest)
-- =============================================
INSERT INTO industry_templates (template_id, label, emoji, parent_id, sort_order, is_active, keywords)
VALUES
  ('pet_grooming', '寵物美容店', '🐩', 'cat_pet', 1, true, '[]'::jsonb),
  ('pet_hotel', '寵物旅館寄宿', '🏨', 'cat_pet', 2, true, '[]'::jsonb),
  ('pet_store', '寵物用品店', '🦴', 'cat_pet', 3, true, '[]'::jsonb)
ON CONFLICT (template_id) DO NOTHING;

-- =============================================
-- 9. 教育學習 → 子產業
-- =============================================
INSERT INTO industry_templates (template_id, label, emoji, parent_id, sort_order, is_active, keywords)
VALUES
  ('cram_school', '國高中補習班', '📝', 'cat_education', 0, true, '[]'::jsonb),
  ('after_school', '國小安親班', '🎒', 'cat_education', 1, true, '[]'::jsonb),
  ('language_school', '語言補習班', '🌍', 'cat_education', 2, true, '[]'::jsonb),
  ('art_class', '才藝教室', '🎵', 'cat_education', 3, true, '[]'::jsonb),
  ('cert_school', '專業證照補習班', '📜', 'cat_education', 4, true, '[]'::jsonb),
  ('online_learning', '線上學習平台', '💻', 'cat_education', 5, true, '[]'::jsonb)
ON CONFLICT (template_id) DO NOTHING;

-- =============================================
-- 10. 休閒娛樂 → 子產業
-- =============================================
INSERT INTO industry_templates (template_id, label, emoji, parent_id, sort_order, is_active, keywords)
VALUES
  ('gym', '健身房運動中心', '🏋️‍♂️', 'cat_leisure', 0, true, '[]'::jsonb),
  ('yoga_pilates', '瑜伽皮拉提斯教室', '🧘', 'cat_leisure', 1, true, '[]'::jsonb),
  ('board_game', '桌遊店', '🎲', 'cat_leisure', 2, true, '[]'::jsonb),
  ('ktv', 'KTV視聽歌唱', '🎤', 'cat_leisure', 3, true, '[]'::jsonb),
  ('cinema', '電影院', '🎬', 'cat_leisure', 4, true, '[]'::jsonb),
  ('kids_playground', '親子樂園室內遊樂場', '🎡', 'cat_leisure', 5, true, '[]'::jsonb),
  ('escape_room', '密室逃脫', '🔐', 'cat_leisure', 6, true, '[]'::jsonb)
ON CONFLICT (template_id) DO NOTHING;
