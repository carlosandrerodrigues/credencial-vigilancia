#!/usr/bin/env node
/**
 * servidor.js — Servidor estático local (`npm start`).
 *
 * Reproduz o comportamento do GitHub Pages na sua máquina, para testar
 * o QR Code e a página de validação antes de publicar. Usa apenas o
 * módulo http nativo — nenhuma dependência adicional.
 */
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const Log = require('./lib/log');
const { RAIZ } = require('./lib/config');

const PORTA = Number(process.env.PORT) || 4173;

/** Tipos MIME servidos pelo projeto. */
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

/**
 * Resolve a URL para um arquivo dentro da raiz, bloqueando path traversal.
 * @param {string} url
 * @returns {string|null}
 */
function resolverArquivo(url) {
  const semQuery = decodeURIComponent(url.split('?')[0].split('#')[0]);
  const relativo = semQuery === '/' ? 'index.html' : semQuery.replace(/^\/+/, '');
  const alvo = path.resolve(RAIZ, relativo);
  if (!alvo.startsWith(RAIZ)) return null; // tentativa de sair da raiz
  if (fs.existsSync(alvo) && fs.statSync(alvo).isDirectory()) {
    const indice = path.join(alvo, 'index.html');
    return fs.existsSync(indice) ? indice : null;
  }
  return fs.existsSync(alvo) ? alvo : null;
}

/**
 * Endereços IPv4 da máquina — úteis para escanear o QR Code pelo celular.
 * @returns {string[]}
 */
function enderecosLocais() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}

const servidor = http.createServer((req, res) => {
  const arquivo = resolverArquivo(req.url);

  if (!arquivo) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1><p>Arquivo não encontrado.</p><p><a href="/">Voltar ao painel</a></p>');
    return;
  }

  const tipo = TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': tipo, 'Cache-Control': 'no-store' });
  fs.createReadStream(arquivo).pipe(res);
});

servidor.listen(PORTA, () => {
  Log.banner('Servidor local', 'Simula o GitHub Pages para testes');
  Log.titulo('Endereços');
  Log.ok(`Painel      : http://localhost:${PORTA}/painel.html  (só aqui — não vai para o GitHub)`);
  Log.ok(`Validação   : http://localhost:${PORTA}/verificar.html?id=000001`);
  enderecosLocais().forEach((ip) => Log.info(`Na rede local: http://${ip}:${PORTA}/ (teste o QR pelo celular)`));
  Log.info('Encerre com Ctrl+C.');
});

servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    Log.erro(`A porta ${PORTA} já está em uso. Rode com outra porta: PORT=4174 npm start`);
  } else {
    Log.erro(erro.message);
  }
  process.exitCode = 1;
});
