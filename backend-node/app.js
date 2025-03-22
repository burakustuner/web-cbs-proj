const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Route dosyalarını dahil et
const citiesRoutes = require('./routes/cities');
const roadsRoutes = require('./routes/roads');
const regionsRoutes = require('./routes/regions');

// .env dosyasını yükle
dotenv.config();

// Express uygulaması oluştur
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
// JSON parse middleware
app.use(express.json());

// Basit test endpoint'i
app.get('/', (req, res) => {
  res.send({ message: '👋 Merhaba! Node.js Web GIS API çalışıyor.' });
});

// API route'larını tanımla
app.use('/api/cities', citiesRoutes);
app.use('/api/roads', roadsRoutes);
app.use('/api/regions', regionsRoutes);

// Uygulama ayağa kalkınca mesaj yaz
app.listen(port, () => {
  console.log(`🚀 Node.js backend running at http://localhost:${port}`);
});
