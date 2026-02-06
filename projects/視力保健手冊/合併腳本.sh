#!/bin/bash

# 輸出檔案
OUTPUT="完整手冊.md"

cd /home/node/clawd/projects/視力保健手冊

# 開始合併
cat > "$OUTPUT" << 'EOF'
---
title: 高級中等以下學校學生視力保健手冊
author: 臺灣視光視力保健學會
date: 2026年1月
lang: zh-TW
---

EOF

# 加入各章
echo -e "\n\n" >> "$OUTPUT"
cat chapters/第一章-前言.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat chapters/第二章-近視基礎知識.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat chapters/第三章-近視預防策略.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat chapters/第四章-近視控制方法.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat chapters/第五章-學校執行方案.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat chapters/第六章-驗光師的角色.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat chapters/第七章-常見問題.md >> "$OUTPUT"

# 加入附錄
echo -e "\n\n---\n\n# 附錄\n\n" >> "$OUTPUT"
cat appendix/附錄一-視力篩檢表單.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat appendix/附錄三-家長衛教單張.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat appendix/附錄四-教室環境檢核表.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat appendix/附錄五-相關法規彙整.md >> "$OUTPUT"
echo -e "\n\n---\n\n" >> "$OUTPUT"
cat appendix/附錄六-參考文獻.md >> "$OUTPUT"

echo "完成！輸出: $OUTPUT"
wc -l "$OUTPUT"
