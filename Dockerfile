# 使用更新的基础镜像（Debian 11）
FROM node:16-bullseye-slim

# 安装系统依赖（包含 ca-certificates）
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /usr/src/app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm config set registry https://mirrors.tencent.com/npm/ && \
    npm install

# 复制应用代码
COPY . .

# 启动命令
CMD ["node", "index.js"]