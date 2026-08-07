/**
 * qrcode.js (gerador)
 * Geração dos QR Codes em PNG de alta resolução.
 *
 * Especificação adotada:
 *  - 300 x 300 px
 *  - correção de erro nível H (30% de recuperação — sobrevive a desgaste do crachá)
 *  - margem (quiet zone) de 2 módulos, exigida pela norma ISO/IEC 18004
 */
'use strict';

const path = require('node:path');
const QRCode = require('qrcode');
const { CAMINHOS, garantirPasta, urlValidacao } = require('./config');

/** Opções fixas de renderização. */
const OPCOES = {
  errorCorrectionLevel: 'H',
  type: 'png',
  width: 300,
  margin: 2,
  color: { dark: '#000000FF', light: '#FFFFFFFF' }
};

const Qr = {
  /**
   * Gera o PNG de um servidor.
   * @param {object} funcionario
   * @param {string} baseUrl
   * @returns {Promise<{arquivo: string, url: string}>}
   */
  async gerar(funcionario, baseUrl) {
    garantirPasta(CAMINHOS.qrcodes);
    const url = urlValidacao(baseUrl, funcionario.id);
    const arquivo = path.join(CAMINHOS.qrcodes, `${funcionario.id}.png`);
    await QRCode.toFile(arquivo, url, OPCOES);
    return { arquivo, url };
  },

  /**
   * Gera os QR Codes de toda a base.
   * @param {object[]} funcionarios
   * @param {string} baseUrl
   * @param {(f: object, r: {arquivo: string, url: string}) => void} [aoGerar]
   * @returns {Promise<Map<string, string>>} id -> caminho do PNG
   */
  async gerarTodos(funcionarios, baseUrl, aoGerar) {
    const mapa = new Map();
    for (const f of funcionarios) {
      const resultado = await Qr.gerar(f, baseUrl);
      mapa.set(f.id, resultado.arquivo);
      if (aoGerar) aoGerar(f, resultado);
    }
    return mapa;
  },

  OPCOES
};

module.exports = Qr;
