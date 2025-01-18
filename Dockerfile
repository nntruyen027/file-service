# Sử dụng Node.js 18 làm base image
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV SERVICE_PORT=5000
ENV EUREKA_SERVER=http://microservice-server:8761/eureka/
ENV SERVICE_NAME=file-service
ENV SERVICE_HOSTNAME=file-service

# Mở cổng của container
EXPOSE 5000

# Lệnh chạy ứng dụng khi container khởi động
CMD ["node", "bin/www"]
