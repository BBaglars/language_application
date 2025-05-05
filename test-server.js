const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Çalışıyor!'));
app.listen(3000, () => console.log('Basit sunucu 3000 portunda çalışıyor')); 