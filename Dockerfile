
# 使用更新的基础镜像，基于 Debian 11
FROM node:16-bullseye-slim

# 安装系统依赖（包含构建工具和 CA 证书）
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    make \
    g++ \
    # 安装其他可能的依赖（如 OpenSSL 开发包）
    openssl \
    libssl-dev && \
    # 清理缓存
    rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /usr/src/app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm config set registry https://mirrors.tencent.com/npm/ && \
    npm install

# 复制所有文件到工作目录
COPY . .

# 暴露端口
EXPOSE 80

# 启动应用
CMD ["node", "index.js"]
