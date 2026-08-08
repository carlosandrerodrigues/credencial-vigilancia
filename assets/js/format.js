/**
 * format.js
 * Funções puras de formatação e sanitização.
 * Sem efeitos colaterais, 100% reutilizáveis (navegador e Node).
 */
(function (global) {
  'use strict';

  const VS = global.VS || (global.VS = {});

  const Format = {
    /** Tamanho dos identificadores sorteados. 36^8 ≈ 2,8 trilhões. */
    ID_TAMANHO: 8,

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
     * Sanitiza um identificador de credencial.
     *
     * O id vem da querystring e é usado para montar o caminho do arquivo
     * dados/<id>.json. Reduzir a [a-z0-9] aqui é a barreira contra path
     * traversal (?id=../../algo): tudo que não casa é descartado, e o
     * resultado só é aceito se tiver o tamanho de um id legítimo.
     *
     * @param {string} valor
     * @returns {string} id válido, ou '' se não for um id
     */
    normalizarId(valor) {
      const limpo = String(valor || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return limpo.length >= Format.ID_TAMANHO && limpo.length <= 32 ? limpo : '';
    },

    /**
     * Sorteia um identificador aleatório e permanente.
     *
     * Descarta bytes ≥ 252 porque 256 não é múltiplo de 36: sem isso, as seis
     * primeiras letras do alfabeto sairiam com frequência maior que as demais.
     *
     * @param {number} [tamanho]
     * @returns {string}
     */
    gerarId(tamanho = Format.ID_TAMANHO) {
      const alfabeto = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const limite = 256 - (256 % alfabeto.length);
      let id = '';
      while (id.length < tamanho) {
        const bytes = new Uint8Array(tamanho * 2);
        globalThis.crypto.getRandomValues(bytes);
        for (const b of bytes) {
          if (b >= limite) continue;
          id += alfabeto[b % alfabeto.length];
          if (id.length === tamanho) break;
        }
      }
      return id;
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
