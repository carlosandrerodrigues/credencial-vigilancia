#!/usr/bin/env node
/**
 * limpar.js — Remove os artefatos gerados (`npm run limpar`).
 *
 * Apaga apenas o que o gerador cria: qrcodes/*.png, pdf/*.pdf e
 * dados/funcionarios.js. Nunca toca em dados/funcionarios.json,
 * nas fotos ou no código-fonte.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Log = require('./lib/log');
const { CAMINHOS, RAIZ } = require('./lib/config');

/**
 * Apaga arquivos de uma pasta que casem com a extensão.
 * @param {string} pasta
 * @param {RegExp} padrao
 * @returns {number} quantidade removida
 */
function limparPasta(pasta, padrao) {
  if (!fs.existsSync(pasta)) return 0;
  let total = 0;
  for (const arquivo of fs.readdirSync(pasta)) {
    if (!padrao.test(arquivo)) continue;
    fs.unlinkSync(path.join(pasta, arquivo));
    total += 1;
  }
  return total;
}

Log.banner('Limpeza de artefatos', 'Remove QR Codes, PDFs e o espelho de dados');

const qr = limparPasta(CAMINHOS.qrcodes, /\.png$/i);
const pdf = limparPasta(CAMINHOS.pdf, /\.pdf$/i);

let espelho = 0;
if (fs.existsSync(CAMINHOS.fallbackJs)) {
  fs.unlinkSync(CAMINHOS.fallbackJs);
  espelho = 1;
}

Log.titulo('Concluído');
Log.resumo([
  `${qr} QR Code(s) removido(s) de ${path.relative(RAIZ, CAMINHOS.qrcodes)}`,
  `${pdf} PDF(s) removido(s) de ${path.relative(RAIZ, CAMINHOS.pdf)}`,
  `${espelho} espelho de dados removido`,
  'Execute "npm run gerar" para reconstruir tudo.'
]);
