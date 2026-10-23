-- Виконується автоматично лише при першому створенні тому даних
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS listings (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    price_per_night INTEGER NOT NULL CHECK (price_per_night > 0),
    max_guests      INTEGER NOT NULL CHECK (max_guests > 0),
    min_nights      INTEGER NOT NULL DEFAULT 1 CHECK (min_nights > 0)
);

CREATE TABLE IF NOT EXISTS bookings (
    id          SERIAL PRIMARY KEY,
    listing_id  INTEGER NOT NULL REFERENCES listings(id),
    guest_name  VARCHAR(255) NOT NULL,
    guests      INTEGER NOT NULL CHECK (guests > 0),
    check_in    DATE NOT NULL,
    check_out   DATE NOT NULL,
    nights      INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                CHECK (status IN ('confirmed', 'cancelled')),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (check_out > check_in),
    -- Захист від подвійного бронювання на рівні бази даних:
    -- для одного житла підтверджені бронювання не можуть мати дат, що перетинаються
    CONSTRAINT no_double_booking EXCLUDE USING gist (
        listing_id WITH =,
        daterange(check_in, check_out, '[)') WITH &&
    ) WHERE (status = 'confirmed')
);

INSERT INTO listings (title, city, price_per_night, max_guests, min_nights) VALUES
    ('Апартаменти в центрі Києва', 'Київ', 1500, 4, 1),
    ('Студія біля Дніпра', 'Київ', 1100, 2, 2),
    ('Будинок у Карпатах', 'Яремче', 2800, 8, 3);
