/**
 * icones.js
 * Biblioteca de ícones/marcas em SVG inline.
 *
 * Motivo de existir: o projeto não depende de nenhum CDN nem de fonte de
 * ícones. O único binário é o brasão da prefeitura (assets/img/logo.png).
 */
(function (global) {
  'use strict';

  const VS = global.VS || (global.VS = {});

  const Icones = {
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
    }
  };

  VS.Icones = Icones;
})(window);
