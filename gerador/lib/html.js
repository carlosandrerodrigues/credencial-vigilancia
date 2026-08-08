/**
 * html.js
 * Atualização do bloco de resumo do painel.html, entre os marcadores
 * GERADOR:INICIO e GERADOR:FIM.
 */
'use strict';

const fs = require('node:fs');
const Format = require('../../assets/js/format.js');
const { CAMINHOS } = require('./config');

const MARCA_INICIO = '<!-- GERADOR:INICIO -->';
const MARCA_FIM = '<!-- GERADOR:FIM -->';

/**
 * Escapa texto para inserção segura em HTML.
 * @param {*} v
 * @returns {string}
 */
const esc = (v) => Format.escaparHTML(v);

const Html = {
  /**
   * Atualiza o bloco de resumo do painel.html.
   * @param {object[]} funcionarios
   * @param {object} info {baseUrl, geradoEm}
   * @returns {string} caminho do arquivo
   */
  atualizarIndex(funcionarios, info) {
    const html = fs.readFileSync(CAMINHOS.painelHtml, 'utf8');
    const inicio = html.indexOf(MARCA_INICIO);
    const fim = html.indexOf(MARCA_FIM);

    if (inicio === -1 || fim === -1) {
      throw new Error('Marcadores GERADOR:INICIO/GERADOR:FIM não encontrados em painel.html.');
    }

    const linhas = funcionarios
      .map(
        (f) => `            <li>
              <strong>${esc(f.id)}</strong> — ${esc(f.nome)} · ${esc(f.cargo)}
              · <a href="verificar.html?id=${esc(f.id)}">validação</a>
              · <a href="qrcodes/${esc(f.id)}.png">QR Code</a>
            </li>`
      )
      .join('\n');

    const bloco = `${MARCA_INICIO}
        <p class="bloco__descricao">
          <strong>${funcionarios.length}</strong> credencial(is) processada(s) em
          <strong>${esc(info.geradoEm)}</strong>.<br>
          Endereço público: <code>${esc(info.baseUrl)}</code>
        </p>
        <ul class="resumo-gerado">
${linhas}
        </ul>
        ${MARCA_FIM}`;

    const atualizado = html.slice(0, inicio) + bloco + html.slice(fim + MARCA_FIM.length);
    fs.writeFileSync(CAMINHOS.painelHtml, atualizado, 'utf8');
    return CAMINHOS.painelHtml;
  }
};

module.exports = Html;
