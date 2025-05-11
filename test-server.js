const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Çalışıyor!'));

module.exports = app;