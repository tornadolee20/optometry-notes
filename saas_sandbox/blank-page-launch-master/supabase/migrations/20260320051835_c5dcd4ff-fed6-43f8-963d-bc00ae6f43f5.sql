
UPDATE public.industry_templates
SET keywords = '[
  {"keyword":"環境很乾淨","category":"env"},{"keyword":"空間很舒服","category":"env"},{"keyword":"香火很旺","category":"env"},{"keyword":"氣氛很安定","category":"env"},{"keyword":"氣氛很莊嚴","category":"env"},{"keyword":"廟宇很漂亮","category":"env"},{"keyword":"氛圍很溫馨","category":"env"},{"keyword":"不會太吵","category":"env"},
  {"keyword":"動線很順","category":"service"},{"keyword":"指示很清楚","category":"service"},{"keyword":"地點很好找","category":"service"},{"keyword":"附近好停車","category":"service"},{"keyword":"交通很方便","category":"service"},{"keyword":"不怕走錯路","category":"service"},
  {"keyword":"志工很親切","category":"service"},{"keyword":"態度不給壓力","category":"service"},{"keyword":"解說很清楚","category":"service"},{"keyword":"很有耐心","category":"service"},{"keyword":"照顧第一次來","category":"service"},{"keyword":"廟方很用心","category":"service"},{"keyword":"等候很安心","category":"service"},{"keyword":"說話很溫和","category":"service"},{"keyword":"不會亂推銷","category":"service"},{"keyword":"需要時找得到人","category":"service"},{"keyword":"神尊被照顧好","category":"service"},{"keyword":"感覺被歡迎","category":"service"},
  {"keyword":"很有在地感","category":"service"},{"keyword":"有被守護感","category":"service"},{"keyword":"離家很近","category":"service"},{"keyword":"從小拜到大","category":"service"},{"keyword":"全家常一起來","category":"service"},{"keyword":"在地守護中心","category":"service"},{"keyword":"想拜就會來","category":"service"},{"keyword":"重要日子必來","category":"service"},{"keyword":"會帶朋友來","category":"service"},{"keyword":"生活的一部分","category":"service"},
  {"keyword":"心情變平靜","category":"service"},{"keyword":"壓力有釋放","category":"service"},{"keyword":"有事會想到來","category":"service"},{"keyword":"覺得被照顧","category":"service"},{"keyword":"多求家人平安","category":"service"},{"keyword":"對未來比較不怕","category":"service"},{"keyword":"在這裡能整理心情","category":"service"},{"keyword":"想來說聲謝謝","category":"service"},{"keyword":"像幫自己充電","category":"service"},{"keyword":"心裡比較踏實","category":"service"},{"keyword":"可以說心裡話","category":"service"},{"keyword":"會想推薦給別人","category":"service"}
]'::jsonb,
updated_at = now()
WHERE template_id = 'temple' AND is_brand_template = true;
