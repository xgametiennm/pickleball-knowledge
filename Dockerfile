# Sổ tay Pickleball: build trang bằng Python rồi phục vụ bằng nginx.

# 1. Build
FROM python:3.12-alpine AS build
WORKDIR /app
COPY build.py ./
COPY content ./content
COPY src ./src
RUN python build.py

# 2. Máy chủ tĩnh
FROM nginx:1.27-alpine
LABEL app=so-tay-pickleball
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
