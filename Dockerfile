# ʹ�ø��µĻ�������Debian 11��
FROM node:16-bullseye-slim

# ��װϵͳ���������� ca-certificates��
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# ���ù���Ŀ¼
WORKDIR /usr/src/app

# ���������ļ�����װ
COPY package*.json ./
RUN npm config set registry https://mirrors.tencent.com/npm/ && \
    npm install

# ����Ӧ�ô���
COPY . .

# ��������
CMD ["node", "index.js"]