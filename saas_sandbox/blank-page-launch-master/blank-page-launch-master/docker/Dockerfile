# Multi-stage build for React application
# Stage 1: Build
FROM node:20-alpine AS builder

# 設置工作目錄
WORKDIR /app

# 複製 package files
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production && npm cache clean --force

# 複製源代碼
COPY . .

# 構建應用
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# 安裝安全更新
RUN apk update && apk upgrade && apk add --no-cache curl

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 複製 nginx 配置
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 複製構建產物
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製健康檢查腳本
COPY docker/healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# 設置權限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 切換到非 root 用戶
USER nginx

# 暴露端口
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /healthcheck.sh

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]