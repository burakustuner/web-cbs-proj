# 1. Node tabanlı imaj
FROM node:18

# 2. Çalışma dizini oluştur
WORKDIR /app

# 3. package.json ve package-lock.json kopyalanır
COPY package*.json ./

# 4. Bağımlılıklar yüklenir
RUN npm install

# 5. Uygulama dosyaları kopyalanır
COPY . .

# 6. Sunucu portu açılır
EXPOSE 8000

# 7. Giriş komutu
CMD ["npm", "run", "dev"]
