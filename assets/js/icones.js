/**
 * icones.js
 * Biblioteca de ícones/marcas em SVG inline.
 *
 * Motivo de existir: o projeto não depende de nenhum CDN, fonte de ícones
 * ou imagem binária. Tudo é vetorial, leve e escala sem perda em qualquer tela.
 */
(function (global) {
  'use strict';

  const VS = global.VS || (global.VS = {});
  const { Format } = VS;

  const Icones = {
    /**
     * Brasão/marca institucional (sol, serras e rio — identidade de Taguatinga/TO).
     * @param {number} tamanho  lado do quadrado em px
     * @returns {string} markup SVG
     */
    brasao(tamanho = 56) {
      return `
<svg class="brasao" width="${tamanho}" height="${tamanho}" viewBox="0 0 100 100" role="img"
     aria-label="Brasão da Prefeitura Municipal de Taguatinga - Tocantins">
  <defs>
    <linearGradient id="brasaoCeu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7FC5F5"/>
      <stop offset="100%" stop-color="#D9EEFC"/>
    </linearGradient>
    <linearGradient id="brasaoSol" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFC42E"/>
      <stop offset="100%" stop-color="#F3701B"/>
    </linearGradient>
    <clipPath id="brasaoCorte"><rect x="6" y="6" width="88" height="88" rx="20"/></clipPath>
  </defs>

  <rect x="3" y="3" width="94" height="94" rx="23" fill="#0B3C8C"/>
  <g clip-path="url(#brasaoCorte)">
    <rect x="6" y="6" width="88" height="88" fill="url(#brasaoCeu)"/>
    <circle cx="50" cy="46" r="17" fill="url(#brasaoSol)"/>
    <path d="M6 62 Q28 40 50 62 Q72 40 94 62 L94 94 L6 94 Z" fill="#12864B"/>
    <path d="M6 74 Q30 62 50 74 Q70 86 94 74 L94 94 L6 94 Z" fill="#0B5FA5"/>
    <g fill="none" stroke="#0B3C8C" stroke-width="2.4" stroke-linecap="round">
      <path d="M22 28 q5 -5 10 0"/><path d="M32 28 q5 -5 10 0"/>
      <path d="M60 22 q4 -4 8 0"/><path d="M68 22 q4 -4 8 0"/>
    </g>
    <g stroke="#FFFFFF" stroke-width="1.6" opacity=".7">
      <path d="M14 82 h20"/><path d="M62 86 h22"/>
    </g>
  </g>
  <rect x="3" y="3" width="94" height="94" rx="23" fill="none" stroke="#08306F" stroke-width="2"/>
</svg>`.trim();
    },

    /**
     * Selo de situação (check, alerta ou erro).
     * @param {'check'|'alerta'|'erro'} tipo
     * @param {number} tamanho
     * @returns {string}
     */
    selo(tipo = 'check', tamanho = 26) {
      const traco = {
        check: '<path d="M7 12.5l3.2 3.2L17 9" />',
        alerta: '<path d="M12 7v6" /><path d="M12 16.5v.2" />',
        erro: '<path d="M8.5 8.5l7 7" /><path d="M15.5 8.5l-7 7" />'
      }[tipo] || '';
      return `
<svg class="selo selo--${tipo}" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" aria-hidden="true">
  <circle cx="12" cy="12" r="11" fill="currentColor"/>
  <g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    ${traco}
  </g>
</svg>`.trim();
    },

    /**
     * Ícones de rótulo de campo (linha fina, estilo institucional).
     * @param {string} nome
     * @returns {string}
     */
    campo(nome) {
      const caminhos = {
        pessoa: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 19.5c1.3-3.6 4-5.4 7.2-5.4s5.9 1.8 7.2 5.4"/>',
        documento: '<rect x="3.2" y="5.2" width="17.6" height="13.6" rx="2.4"/><circle cx="9" cy="11" r="2"/><path d="M5.8 16.4c.8-1.7 1.9-2.5 3.2-2.5s2.4.8 3.2 2.5"/><path d="M14.6 10h4.2M14.6 13.4h4.2"/>',
        local: '<path d="M12 21s6.6-6.1 6.6-11A6.6 6.6 0 0 0 5.4 10c0 4.9 6.6 11 6.6 11z"/><circle cx="12" cy="10" r="2.4"/>',
        maleta: '<rect x="3" y="7.4" width="18" height="12.2" rx="2.2"/><path d="M9 7.4V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.4"/><path d="M3 12.6h18"/>',
        vinculo: '<circle cx="8.4" cy="9" r="2.8"/><circle cx="16" cy="10.4" r="2.4"/><path d="M3.4 19c.9-2.8 2.7-4.2 5-4.2s4.1 1.4 5 4.2"/><path d="M14.6 19c.5-2 1.6-3.1 3.2-3.1 1.4 0 2.4.8 3 2.3"/>',
        cracha: '<rect x="4" y="4.6" width="16" height="14.8" rx="2.4"/><path d="M8.2 9.4h7.6M8.2 12.6h7.6M8.2 15.8h4.6"/>',
        selo: '<path d="M12 3.6l2.5 1.9 3.1-.2.6 3 2.3 2.1-1.7 2.6.4 3.1-3 .8-1.8 2.5-2.9-1.1-2.9 1.1-1.8-2.5-3-.8.4-3.1L2.5 10.4l2.3-2.1.6-3 3.1.2z"/><path d="M9.4 12.2l1.8 1.8 3.4-3.6"/>',
        calendario: '<rect x="3.4" y="5.4" width="17.2" height="15" rx="2.2"/><path d="M3.4 10h17.2M8.4 3.4v4M15.6 3.4v4"/>'
      };
      const d = caminhos[nome] || caminhos.cracha;
      return `
<svg class="icone-campo" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
     stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  ${d}
</svg>`.trim();
    },

    /**
     * Avatar vetorial com as iniciais — usado quando não há foto do servidor.
     * @param {string} nome
     * @returns {string}
     */
    avatar(nome) {
      const iniciais = Format.iniciais(nome);
      return `
<svg class="avatar-fallback" viewBox="0 0 120 150" role="img" aria-label="Foto não cadastrada">
  <defs>
    <linearGradient id="avatarBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8F0FB"/>
      <stop offset="100%" stop-color="#CBDDF3"/>
    </linearGradient>
  </defs>
  <rect width="120" height="150" fill="url(#avatarBg)"/>
  <circle cx="60" cy="58" r="26" fill="#9FBEE2"/>
  <path d="M14 150c6-27 23-40 46-40s40 13 46 40z" fill="#9FBEE2"/>
  <text x="60" y="68" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif"
        font-size="34" font-weight="700" fill="#0B3C8C" opacity=".85">${Format.escaparHTML(iniciais)}</text>
</svg>`.trim();
    }
  };

  VS.Icones = Icones;
})(window);
