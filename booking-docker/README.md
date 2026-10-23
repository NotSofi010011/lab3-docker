# booking-docker

Контейнеризований сервіс бронювання короткострокової оренди житла: PostgreSQL + Node.js/Express + Nginx.

    docker compose up -d --build
    curl http://localhost:8081/api/health
    curl http://localhost:8081/api/listings

Інтерфейс: http://localhost:8081 · Зупинка з видаленням томів: `docker compose down -v`
