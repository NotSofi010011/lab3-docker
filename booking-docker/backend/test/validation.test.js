'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { validateBooking, HttpError } = require('../src/validation');

const listing = { price_per_night: 1000, max_guests: 2, min_nights: 2 };
const ok = { guestName: ' Олена ', guests: 2, checkIn: '2026-07-10', checkOut: '2026-07-13' };

test('рахує ночі та вартість', () => {
  const b = validateBooking(ok, listing);
  assert.strictEqual(b.nights, 3);
  assert.strictEqual(b.totalPrice, 3000);
  assert.strictEqual(b.guestName, 'Олена');
});

test('відхиляє зайве число гостей', () => {
  assert.throws(() => validateBooking({ ...ok, guests: 3 }, listing), /Максимальна кількість гостей/);
});

test('відхиляє короткий термін і зворотні дати', () => {
  assert.throws(() => validateBooking({ ...ok, checkOut: '2026-07-11' }, listing), /Мінімальний термін/);
  assert.throws(() => validateBooking({ ...ok, checkOut: '2026-07-09' }, listing), /пізніше/);
});

test('відхиляє некоректний формат і неіснуючі дати', () => {
  assert.throws(() => validateBooking({ ...ok, checkIn: '10.07.2026' }, listing), HttpError);
  assert.throws(() => validateBooking({ ...ok, checkIn: '2026-02-30' }, listing), /некоректну дату/);
});

test('вимагає ім’я гостя', () => {
  assert.throws(() => validateBooking({ ...ok, guestName: '  ' }, listing), /ім’я гостя/);
});
