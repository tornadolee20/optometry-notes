#!/bin/sh
# Health check script for nginx

# 檢查 nginx 進程是否運行
if ! pgrep nginx > /dev/null; then
    echo "Nginx process not found"
    exit 1
fi

# 檢查健康端點
if ! curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "Health endpoint not responding"
    exit 1
fi

# 檢查主頁是否可訪問
if ! curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo "Main page not accessible"
    exit 1
fi

echo "Health check passed"
exit 0