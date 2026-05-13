const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const queue = [];
const results = [];
let idCounter = 1;

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(); } });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  res.setHeader('Content-Type', 'application/json');

  if (url.pathname === '/api/queue' && req.method === 'GET') {
    res.end(JSON.stringify({ queue, count: queue.length }));
    return;
  }

  if (url.pathname === '/api/queue' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const entry = {
        id: idCounter++,
        name: String(data.name || '').slice(0, 100),
        course: String(data.course || '').slice(0, 100),
        phone: String(data.phone || '').slice(0, 30),
        email: String(data.email || '').slice(0, 100),
        timestamp: Date.now(),
      };
      queue.push(entry);
      console.log(`  + Queued: ${entry.name} (${entry.course}) - position #${queue.length}`);
      res.end(JSON.stringify({ id: entry.id, position: queue.length }));
    } catch {
      res.writeHead(400);
      res.end('{"error":"Invalid request"}');
    }
    return;
  }

  if (url.pathname === '/api/queue/next' && req.method === 'POST') {
    const next = queue.shift() || null;
    if (next) console.log(`  > Spinning for: ${next.name}`);
    res.end(JSON.stringify(next));
    return;
  }

  if (url.pathname.startsWith('/api/status/')) {
    const id = parseInt(url.pathname.split('/').pop(), 10);
    const result = results.find(r => r.id === id);
    if (result) {
      res.end(JSON.stringify({ status: 'completed', prize: result.prize }));
    } else if (queue.find(e => e.id === id)) {
      const position = queue.findIndex(e => e.id === id) + 1;
      res.end(JSON.stringify({ status: 'pending', position }));
    } else {
      res.end(JSON.stringify({ status: 'spinning' }));
    }
    return;
  }

  if (url.pathname === '/api/result' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      results.push({ id: data.id, prize: data.prize, timestamp: Date.now() });
      if (results.length > 200) results.shift();
      if (data.prize) console.log(`  * Result: ID#${data.id} won ${data.prize.icon} ${data.prize.name}`);
      res.end('{"ok":true}');
    } catch {
      res.writeHead(400);
      res.end('{"error":"Invalid request"}');
    }
    return;
  }

  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(__dirname, filePath);
  try {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.writeHead(200);
    res.end(content);
  } catch {
    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ========================================');
  console.log('   CODEX GATE - Prize Wheel Server');
  console.log('  ========================================');
  console.log(`   Port: ${PORT}`);
  console.log('');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   Display:  http://${net.address}:${PORT}`);
        console.log(`   QR Form:  http://${net.address}:${PORT}/?register`);
      }
    }
  }
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log('');
  console.log('   Open the Display URL on your computer/TV.');
  console.log('   People scan the QR code shown on screen.');
  console.log('  ========================================');
  console.log('');
});
