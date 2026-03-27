import subprocess
import sys

def check_status():
    try:
        result = subprocess.run(["notebooklm", "status"], capture_output=True, text=True, check=True)
        print("NotebookLM Status:")
        print(result.stdout)
    except FileNotFoundError:
        print("錯誤: 找不到 'notebooklm' 指令。請確認是否已安裝 notebooklm-py。")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print("錯誤: 指令執行失敗。")
        print(e.stderr)
        sys.exit(1)

if __name__ == "__main__":
    check_status()
