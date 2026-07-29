import os
import shutil
import subprocess
from pathlib import Path

def get_chrome_user_data_dir():
    """取得 Windows 本地 Chrome 的 User Data 路徑"""
    local_app_data = os.environ.get('LOCALAPPDATA', '')
    if not local_app_data:
        local_app_data = os.path.expanduser('~\\AppData\\Local')
    
    chrome_dir = Path(local_app_data) / 'Google' / 'Chrome' / 'User Data'
    return chrome_dir

def copy_file_safe(src: Path, dest: Path):
    """強效安全複製檔案，若遭遇 Windows File Lock，改用 cmd.exe copy 強制讀取"""
    try:
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
    except (PermissionError, OSError):
        # 使用 Windows 內建 xcopy / cmd copy 處理已鎖定檔案
        try:
            cmd = f'cmd.exe /c copy /y "{src}" "{dest}"'
            subprocess.run(cmd, shell=True, capture_output=True)
        except Exception as e:
            print(f"[Warning] 強制複製 {src.name} 失敗: {e}")

def sync_chrome_session(target_dir=None, profile_name='Default'):
    """
    將本地 Chrome Profile 中的核心 Cookie 與 Session 複製到專屬的 Agent 沙盒目錄，
    包含防鎖定修復機制。
    """
    if target_dir is None:
        target_dir = Path.cwd() / '.agent-chrome-profile'
    else:
        target_dir = Path(target_dir)

    src_chrome_dir = get_chrome_user_data_dir()
    src_profile = src_chrome_dir / profile_name
    dest_profile = target_dir / profile_name

    if not src_profile.exists():
        print(f"[Warning] 找不到來源 Chrome Profile: {src_profile}")
        return str(target_dir)

    dest_profile.mkdir(parents=True, exist_ok=True)

    # 需要複製的核心 Session 與 Cookie 檔案/目錄
    key_files = [
        src_profile / 'Network' / 'Cookies',
        src_profile / 'Network' / 'Cookies-journal',
        src_profile / 'Preferences',
        src_profile / 'Secure Preferences'
    ]

    for sf in key_files:
        if sf.exists():
            rel_path = sf.relative_to(src_profile)
            df = dest_profile / rel_path
            copy_file_safe(sf, df)

    print(f"[Success] Chrome Session (含 Cookie) 同步完成 -> {target_dir}")
    return str(target_dir)

if __name__ == '__main__':
    sync_chrome_session()
