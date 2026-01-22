const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ['https://qbh9xq6w-3001.euw.devtunnels.ms','http://localhost:3001'],
  credentials: true,
}));

// 🔗 API routes
app.use('/api', routes);

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

module.exports = app;
