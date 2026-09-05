const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 3000;
const rootDir = __dirname;
const links = {};

function generateCode(url) {
  const text = url.trim();
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  return hash.toString(36).slice(0, 8);
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function serveStaticFile(res, filePath) {
  const safePath = path.normalize(filePath).replace(/^\.(?:\.[\/\\])+/, '');
  const fullPath = path.join(rootDir, safePath);

  fs.readFile(fullPath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Fichier introuvable');
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && url.pathname === '/shorten') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        let targetUrl = (data.url || '').trim();

        if (!targetUrl) {
          sendJson(res, 400, { error: 'Veuillez entrer un lien valide.' });
          return;
        }

        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `https://${targetUrl}`;
        }

        const parsed = new URL(targetUrl);
        if (!parsed.hostname || !parsed.protocol.startsWith('http')) {
          sendJson(res, 400, { error: 'Le lien n\'est pas valide.' });
          return;
        }

        const code = generateCode(targetUrl);
        links[code] = parsed.href;
        const shortUrl = `http://localhost:${PORT}/go/${code}`;

        sendJson(res, 200, { shortUrl });
      } catch (error) {
        sendJson(res, 400, { error: 'Le lien n\'est pas valide.' });
      }
    });

    return;
  }

  if (url.pathname.startsWith('/go/')) {
    const code = url.pathname.replace('/go/', '');
    const targetUrl = links[code];

    if (targetUrl) {
      res.writeHead(302, { Location: targetUrl });
      res.end();
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Erreur : lien introuvable</h1>');
    return;
  }

  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  serveStaticFile(res, pathname);
});

server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
