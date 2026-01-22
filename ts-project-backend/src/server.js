
require('dotenv').config();
const app = require('./app');
console.log('Environment:', process.env.NODE_ENV);
const connectDB = require('./services/db');
const { connectRedis } = require('./services/redis');
//d
const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
