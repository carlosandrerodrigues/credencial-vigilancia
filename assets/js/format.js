/**
 * format.js
 * Funções puras de formatação e sanitização.
 * Sem efeitos colaterais, 100% reutilizáveis (navegador e Node).
 */
(function (global) {
  'use strict';

  const VS = global.VS || (global.VS = {});

  const Format = {
    /**
     * Escapa caracteres perigosos antes de injetar texto em HTML.
     * @param {*} valor
     * @returns {string}
     */
    escaparHTML(valor) {
      if (valor === null || valor === undefined) return '';
      return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /**
     * Remove tudo que não for dígito.
     * @param {string} valor
     * @returns {string}
     */
    somenteDigitos(valor) {
      return String(valor || '').replace(/\D+/g, '');
    },

    /**
     * Aplica a máscara padrão de CPF (000.000.000-00).
     * @param {string} valor
     * @returns {string}
     */
    formatarCPF(valor) {
      const d = Format.somenteDigitos(valor).padStart(11, '0').slice(0, 11);
      return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
    },

    /**
     * Oculta parcialmente o CPF, preservando o prefixo e os dois
     * dígitos verificadores: 817.***.***-34
     * @param {string} valor
     * @param {boolean} mascarar  quando false, devolve o CPF completo formatado
     * @returns {string}
     */
    mascararCPF(valor, mascarar = true) {
      const completo = Format.formatarCPF(valor);
      if (!mascarar) return completo;
      const partes = completo.split(/[.-]/);
      return `${partes[0]}.***.***-${partes[3]}`;
    },

    /**
     * Converte 'AAAA-MM-DD' (ou Date) para 'DD/MM/AAAA'.
     * @param {string|Date} valor
     * @returns {string}
     */
    formatarData(valor) {
      const d = Format.paraData(valor);
      if (!d) return '—';
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      return `${dia}/${mes}/${d.getFullYear()}`;
    },

    /**
     * Interpreta datas em 'AAAA-MM-DD' como data local (evita o
     * deslocamento de fuso que o construtor Date aplica ao formato ISO).
     * @param {string|Date} valor
     * @returns {Date|null}
     */
    paraData(valor) {
      if (!valor) return null;
      if (valor instanceof Date) return isNaN(valor) ? null : valor;
      const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      const d = new Date(valor);
      return isNaN(d) ? null : d;
    },

    /**
     * Normaliza um identificador para 6 dígitos: 7 -> '000007'.
     * @param {string|number} valor
     * @returns {string}
     */
    normalizarId(valor) {
      const d = Format.somenteDigitos(valor);
      if (!d) return '';
      return d.slice(-6).padStart(6, '0');
    },

    /**
     * Valida CPF pelo cálculo dos dígitos verificadores.
     * @param {string} valor
     * @returns {boolean}
     */
    cpfValido(valor) {
      const cpf = Format.somenteDigitos(valor);
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
      const digito = (base, pesoInicial) => {
        let soma = 0;
        for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
      };
      return (
        digito(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
        digito(cpf.slice(0, 10), 11) === Number(cpf[10])
      );
    }
  };

  VS.Format = Format;

  // Também exportável em Node (usado pelo gerador via import dinâmico opcional).
  if (typeof module !== 'undefined' && module.exports) module.exports = Format;
})(typeof window !== 'undefined' ? window : globalThis);
