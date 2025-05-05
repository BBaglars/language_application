const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const router = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// .env dosyasını yükle
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const apiRouter = router;
app.use('/api', apiRouter);

// Error handling
app.use(errorHandler);

app.post('/test', (req, res) => {
  res.json({ message: 'POST çalışıyor!' });
});

const PORT = process.env.PORT || 3000;

// Sunucuyu başlat
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`http://localhost:${PORT}/api adresinden erişilebilir`);
});

// Hata yakalama
server.on('error', (error) => {
  console.error('Sunucu hatası:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('İşlenmeyen hata:', error);
});

module.exports = app; 