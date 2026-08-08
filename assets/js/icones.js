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
     * Ícones de rótulo de campo — silhueta cheia, como no crachá impresso.
     *
     * São formas preenchidas, não contornos: os detalhes internos (rosto,
     * linhas do cartão) são vazados pelo fill-rule "evenodd", que trata os
     * subcaminhos internos como buracos.
     *
     * @param {string} nome
     * @returns {string}
     */
    campo(nome) {
      const caminhos = {
        pessoa: '<circle cx="12" cy="7.6" r="4"/><path d="M12 13.6c-4.1 0-7.4 2.5-8.2 6.2a.9.9 0 0 0 .9 1.1h14.6a.9.9 0 0 0 .9-1.1c-.8-3.7-4.1-6.2-8.2-6.2z"/>',
        documento: '<path fill-rule="evenodd" d="M4.6 4.4h14.8a2.4 2.4 0 0 1 2.4 2.4v10.4a2.4 2.4 0 0 1-2.4 2.4H4.6a2.4 2.4 0 0 1-2.4-2.4V6.8a2.4 2.4 0 0 1 2.4-2.4zM8.9 8.2a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2zm-3.3 8.1c.8-1.9 1.9-2.8 3.3-2.8s2.5.9 3.3 2.8H5.6zm8.9-7.5h5v1.5h-5V8.8zm0 3.5h5v1.5h-5v-1.5z"/>',
        local: '<path fill-rule="evenodd" d="M12 2.2a7.4 7.4 0 0 0-7.4 7.4c0 5.2 6.4 11.7 6.7 12a1 1 0 0 0 1.4 0c.3-.3 6.7-6.8 6.7-12A7.4 7.4 0 0 0 12 2.2zm0 10a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z"/>',
        maleta: '<path fill-rule="evenodd" d="M9.8 2.8a2.4 2.4 0 0 0-2.4 2.4v2H4a2.4 2.4 0 0 0-2.4 2.4v9a2.4 2.4 0 0 0 2.4 2.4h16a2.4 2.4 0 0 0 2.4-2.4v-9A2.4 2.4 0 0 0 20 7.2h-3.4v-2a2.4 2.4 0 0 0-2.4-2.4H9.8zm4.8 4.4v-2H9.4v2h5.2z"/>',
        vinculo: '<path d="M9.2 11.4a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6zm7.6.6a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6zM9.2 13c-3.2 0-5.7 2-6.5 5.6a.9.9 0 0 0 .9 1.1h11.2a.9.9 0 0 0 .9-1.1c-.8-3.6-3.3-5.6-6.5-5.6zm7.6.2c-.7 0-1.3.1-1.9.4 1.2 1.3 2 3 2.4 5.1a2.5 2.5 0 0 1 0 1h4.3a.9.9 0 0 0 .9-1.1c-.7-3.3-2.8-5.4-5.7-5.4z"/>',
        cracha: '<path fill-rule="evenodd" d="M4.4 3.8h15.2a2.4 2.4 0 0 1 2.4 2.4v11.6a2.4 2.4 0 0 1-2.4 2.4H4.4A2.4 2.4 0 0 1 2 17.8V6.2a2.4 2.4 0 0 1 2.4-2.4zm3.4 4.6h8.4v1.6H7.8V8.4zm0 3.8h8.4v1.6H7.8v-1.6zm0 3.8h5v1.6h-5v-1.6z"/>',
        selo: '<path fill-rule="evenodd" d="M12 2.2l3 2.3 3.7-.2.7 3.6 2.8 2.5-1.8 3.3.5 3.7-3.6.9-2.2 3-3.1-1.4-3.1 1.4-2.2-3-3.6-.9.5-3.7L1.8 10.4l2.8-2.5.7-3.6 3.7.2 3-2.3zm-2.7 9.4l-1.2 1.2 3.1 3.1 5.4-5.6-1.2-1.2-4.2 4.3-1.9-1.8z"/>',
        calendario: '<path fill-rule="evenodd" d="M8.2 2.4a.9.9 0 0 1 .9.9v1.3h5.8V3.3a.9.9 0 0 1 1.8 0v1.3h1.7a2.4 2.4 0 0 1 2.4 2.4v2H3.2v-2a2.4 2.4 0 0 1 2.4-2.4h1.7V3.3a.9.9 0 0 1 .9-.9zM3.2 10.8h17.6v7.4a2.4 2.4 0 0 1-2.4 2.4H5.6a2.4 2.4 0 0 1-2.4-2.4v-7.4z"/>'
      };
      const d = caminhos[nome] || caminhos.cracha;
      return `
<svg class="icone-campo" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
     fill="currentColor">
  ${d}
</svg>`.trim();
    }
  };

  VS.Icones = Icones;
})(window);
