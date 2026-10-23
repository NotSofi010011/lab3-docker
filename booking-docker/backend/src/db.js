'use strict';

const { Pool, types } = require('pg');

// DATE (OID 1082) повертаємо рядком YYYY-MM-DD, щоб уникнути зсуву часових поясів
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'app',
});

module.exports = pool;
