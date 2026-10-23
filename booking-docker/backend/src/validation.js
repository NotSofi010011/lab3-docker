'use strict';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function parseDate(value, field) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(`Поле ${field} має бути датою у форматі YYYY-MM-DD`);
  }
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
    throw new HttpError(`Поле ${field} містить некоректну дату`);
  }
  return d;
}

// Перевіряє вхідні дані бронювання та рахує кількість ночей і вартість.
// listing: { price_per_night, max_guests, min_nights }
function validateBooking(input, listing) {
  const { guestName, checkIn, checkOut } = input;
  const guests = input.guests === undefined ? 1 : input.guests;

  if (typeof guestName !== 'string' || guestName.trim() === '') {
    throw new HttpError('Вкажіть ім’я гостя');
  }
  if (!Number.isInteger(guests) || guests < 1) {
    throw new HttpError('Кількість гостей має бути додатним цілим числом');
  }
  if (guests > listing.max_guests) {
    throw new HttpError(`Максимальна кількість гостей: ${listing.max_guests}`);
  }
  const inDate = parseDate(checkIn, 'checkIn');
  const outDate = parseDate(checkOut, 'checkOut');
  const nights = Math.round((outDate - inDate) / MS_PER_DAY);
  if (nights < 1) throw new HttpError('Дата виїзду має бути пізніше за дату заїзду');
  if (nights < listing.min_nights) {
    throw new HttpError(`Мінімальний термін оренди: ${listing.min_nights} дн.`);
  }
  return {
    guestName: guestName.trim(),
    guests,
    checkIn,
    checkOut,
    nights,
    totalPrice: nights * listing.price_per_night,
  };
}

module.exports = { HttpError, validateBooking, parseDate };
