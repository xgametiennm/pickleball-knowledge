#!/usr/bin/env bash
# Sổ tay Pickleball: build trang web rồi chạy máy chủ (mở link in ra trong trình duyệt để xem).
# Cách dùng:  ./run.sh            (cổng mặc định 8000)
#             ./run.sh 9000       (đổi cổng)
set -e
cd "$(dirname "$0")"
PORT="${1:-8000}"

# 1. Tìm Python
PY=""
for c in python3 python py; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c "import sys; sys.exit(0 if sys.version_info[0]==3 else 1)" >/dev/null 2>&1; then
    PY="$c"; break
  fi
done
if [ -z "$PY" ]; then
  echo "Không tìm thấy Python 3. Cài tại https://www.python.org (tích 'Add Python to PATH') rồi chạy lại."
  exit 1
fi
export PYTHONIOENCODING=utf-8

# 2. Build
echo "==> Build trang web bằng $PY"
"$PY" build.py
URL="http://localhost:$PORT/so-tay-pickleball.html"

# 3. Địa chỉ để xem trên điện thoại cùng Wi-Fi
IP=$("$PY" -c "import socket;s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
try:
  s.connect(('8.8.8.8',80));print(s.getsockname()[0])
except Exception:
  print('')" 2>/dev/null)
echo
echo "==> Đang chạy tại: $URL"
[ -n "$IP" ] && echo "    Điện thoại cùng Wi-Fi: http://$IP:$PORT/so-tay-pickleball.html"
echo "    Bấm Ctrl+C để dừng."
echo

# 4. Máy chủ tĩnh
cd dist
"$PY" -m http.server "$PORT"
