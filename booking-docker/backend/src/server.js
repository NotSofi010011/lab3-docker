'use strict';

const pool = require('./db');
const { createApp } = require('./app');

async function main() {
  // Якщо база ще не готова, сервіс завершується з помилкою (видно в docker compose logs),
  // а політика restart: unless-stopped перезапускає його. Зазвичай до цього не доходить,
  // бо compose чекає на healthcheck бази (condition: service_healthy).
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('Cannot connect to PostgreSQL:', err.message);
    process.exit(1);
  }
  const port = process.env.PORT || 3000;
  createApp(pool).listen(port, () => console.log(`Booking API running on port ${port}`));
}

main();
