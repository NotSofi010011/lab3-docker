const http = require('http');
const net = require('net');

const PORT = process.env.PORT || 3000;

// Перевіряє, чи доступна база даних за іменем сервісу "db" (потрібно для завдання 1.3)
function checkDb(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port, timeout: 2000 });
    socket.on('connect', () => { socket.destroy(); resolve(`OK: ${host}:${port} доступний`); });
    socket.on('timeout', () => { socket.destroy(); resolve(`ПОМИЛКА: таймаут підключення до ${host}:${port}`); });
    socket.on('error', (err) => resolve(`ПОМИЛКА: ${err.code} (${host}:${port})`));
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/db') {
    const result = await checkDb(process.env.DB_HOST || 'db', 5432);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(result + '\n');
  }
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`Hello from Docker! NODE_ENV=${process.env.NODE_ENV || 'not set'}\n`);
});

server.listen(PORT, () => console.log(`myapp listening on port ${PORT}, NODE_ENV=${process.env.NODE_ENV}`));
