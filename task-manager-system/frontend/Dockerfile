FROM node:22-alpine

WORKDIR /app
EXPOSE 4200

RUN npm install -g @angular/cli@18

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
CMD ["ng", "serve", "--host", "0.0.0.0", "-c", "production", "--proxy-config", "proxy.conf-docker.json"]