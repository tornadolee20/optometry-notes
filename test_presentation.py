import subprocess
import os

with open(r'skills\prompts-library\presentation_strategist.yaml', 'r', encoding='utf-8') as f:
    prompt_yaml = f.read()

notebook_id = "11acc121-4b92-4d48-8cbe-bf3971146884"

# Use generate report instead
question = f"請扮演簡報策略專家，以 Pitch Mode 產出 5 頁簡報架構。嚴格遵循以下 YAML 規則：\n{prompt_yaml}"

python_exe = r"C:\Users\torna_3j3fz9h\AppData\Local\Programs\Python\Python311\python.exe"

cmd = [python_exe, "-m", "notebooklm", "generate", "report", "--format", "custom", question, "-n", notebook_id, "--wait"]

result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')

with open('presentation_output.md', 'w', encoding='utf-8') as f:
    f.write(result.stdout)
    f.write("\n\nSTDERR:\n")
    f.write(result.stderr)
