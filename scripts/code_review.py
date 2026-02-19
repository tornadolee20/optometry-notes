import os
import re

def review_script(file_path):
    issues = []
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 檢查是否含有敏感關鍵字 (Security Check)
    sensitive_keywords = ['apiKey', 'password', 'secret', 'token']
    for kw in sensitive_keywords:
        if kw in content and "__REDACTED__" not in content:
            # 簡單過濾掉註解或字串內的合理用法
            if re.search(rf'{kw}\s*[:=]\s*["\'][^"\']+', content):
                issues.append(f"⚠️ [安全性] 發現疑似硬編碼的敏感資訊: {kw}")

    # 檢查錯誤處理 (Best Practice)
    if 'try' not in content and file_path.endswith(('.js', '.py')):
        issues.append("💡 [最佳實踐] 腳本缺少錯誤處理 (try-except/try-catch)")

    # 檢查同步邏輯 (Logic Check)
    if 'git push' in content and 'redact' not in content.lower():
        issues.append("🚨 [風險] 發現 Git 推送邏輯，但未見明顯的脫敏 (Redaction) 處理")

    return issues

if __name__ == "__main__":
    scripts_dir = "/home/node/.openclaw/workspace/scripts"
    print(f"### 賈維斯程式碼自動檢視報告 ({scripts_dir})\n")
    for f in os.listdir(scripts_dir):
        if f.endswith(('.js', '.py')):
            path = os.path.join(scripts_dir, f)
            print(f"#### 📄 {f}")
            results = review_script(path)
            if results:
                for r in results:
                    print(f"- {r}")
            else:
                print("- ✅ 檢視完成，未發現明顯風險。")
            print()
