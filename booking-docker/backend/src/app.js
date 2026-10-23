'use strict';

const express = require('express');
const { HttpError, validateBooking } = require('./validation');

function createApp(pool) {
  const app = express();
  app.use(express.json());

  // Маршрути мають префікс /api, бо Nginx проксіює лише його; /health залишено для healthcheck контейнера
  const health = (req, res) => res.json({ status: 'healthy', timestamp: new Date() });
  app.get('/health', health);
  app.get('/api/health', health);

  app.get('/api/listings', async (req, res, next) => {
    try {
      const { city } = req.query;
      const result = city
        ? await pool.query('SELECT * FROM listings WHERE city = $1 ORDER BY id', [city])
        : await pool.query('SELECT * FROM listings ORDER BY id');
      res.json(result.rows);
    } catch (err) { next(err); }
  });

  app.get('/api/bookings', async (req, res, next) => {
    try {
      const result = await pool.query('SELECT * FROM bookings ORDER BY id');
      res.json(result.rows);
    } catch (err) { next(err); }
  });

  app.post('/api/bookings', async (req, res, next) => {
    try {
      const listingId = Number(req.body.listingId);
      const found = await pool.query('SELECT * FROM listings WHERE id = $1', [listingId]);
      if (found.rowCount === 0) throw new HttpError('Житло не знайдено', 404);

      const b = validateBooking(req.body, found.rows[0]);
      try {
        const result = await pool.query(
          `INSERT INTO bookings (listing_id, guest_name, guests, check_in, check_out, nights, total_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [listingId, b.guestName, b.guests, b.checkIn, b.checkOut, b.nights, b.totalPrice]
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        // 23P01 – порушення exclusion constraint: дати перетинаються з підтвердженим бронюванням
        if (err.code === '23P01') throw new HttpError('Житло недоступне на обрані дати', 409);
        throw err;
      }
    } catch (err) { next(err); }
  });

  app.post('/api/bookings/:id/cancel', async (req, res, next) => {
    try {
      const result = await pool.query(
        "UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *",
        [Number(req.params.id)]
      );
      if (result.rowCount === 0) throw new HttpError('Бронювання не знайдено', 404);
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: err.message });
  });

  return app;
}

module.exports = { createApp };
