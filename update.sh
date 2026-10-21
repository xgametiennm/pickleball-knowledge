#!/usr/bin/env bash
# Sổ tay Pickleball: build lại Docker image và chạy lại container.
# Cách dùng:  ./update.sh            (cổng mặc định 8000)
#             ./update.sh 9000       (đổi cổng)
set -e
cd "$(dirname "$0")"
PORT="${1:-8000}"
IMAGE="so-tay-pickleball"
NAME="so-tay-pickleball"

if ! command -v docker >/dev/null 2>&1; then
  echo "Không tìm thấy Docker. Cài Docker rồi chạy lại."
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "Docker chưa chạy. Mở Docker Desktop (hoặc khởi động dịch vụ docker) rồi chạy lại."
  exit 1
fi

# 1. Build image
echo "==> Build image $IMAGE"
docker build -t "$IMAGE:latest" .

# 2. Thay container cũ bằng container mới
if [ -n "$(docker ps -aq -f name="^${NAME}$")" ]; then
  echo "==> Dừng và xóa container cũ"
  docker rm -f "$NAME" >/dev/null
fi
echo "==> Chạy container $NAME"
docker run -d --name "$NAME" --restart unless-stopped -p "$PORT:80" "$IMAGE:latest" >/dev/null

# 3. Dọn image cũ không còn dùng
docker image prune -f --filter "dangling=true" --filter "label=app=$IMAGE" >/dev/null

echo
echo "==> Đang chạy tại: http://localhost:$PORT/"
echo "    Xem log:  docker logs -f $NAME"
echo "    Dừng:     docker rm -f $NAME"
