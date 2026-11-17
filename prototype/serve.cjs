const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const prototypeRoot = path.join(root, 'prototype');
const logoPath = path.join(root, 'src', 'assets', 'brand', 'sgt-logo-transparent-web.png');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
};

function sendFile(response, filename) {
  fs.stat(filename, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': mimeTypes[path.extname(filename).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(filename).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  if (pathname === '/') {
    response.writeHead(302, { Location: '/prototype/index.html' }).end();
    return;
  }

  if (pathname === '/src/assets/brand/sgt-logo-transparent-web.png') {
    sendFile(response, logoPath);
    return;
  }

  if (pathname.startsWith('/prototype/')) {
    const filename = path.resolve(prototypeRoot, pathname.slice('/prototype/'.length));
    if (!filename.startsWith(prototypeRoot + path.sep)) {
      response.writeHead(404).end('Not found');
      return;
    }
    sendFile(response, filename);
    return;
  }

  response.writeHead(404).end('Not found');
});

const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => {
  console.log(`Prototype ready at http://127.0.0.1:${port}/prototype/index.html`);
  console.log('This preview uses local files and sample data; no internet connection is needed.');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Set PORT to choose another local port.`);
    process.exitCode = 1;
    return;
  }
  throw error;
});
