/**
 * dados.js
 * Camada de acesso a dados do navegador.
 *
 * Estratégia de carregamento em dois estágios:
 *  1. fetch() em dados/funcionarios.json  — caminho normal (GitHub Pages/HTTP).
 *  2. dados/funcionarios.js (window.__FUNCIONARIOS__) — fallback automático
 *     para quando a página é aberta via file://, onde o fetch é bloqueado.
 *
 * O arquivo de fallback é gerado por `npm run gerar`.
 */
(function (global) {
  'use strict';

  const VS = global.VS || (global.VS = {});
  const { Format, CAMINHOS, SITUACAO } = VS;

  /** Cache em memória para não recarregar o JSON a cada consulta. */
  let cache = null;

  const Dados = {
    /**
     * Carrega a base de funcionários (com cache).
     * @param {string} [prefixo] caminho relativo até a raiz do projeto
     * @returns {Promise<{meta: object, funcionarios: object[]}>}
     */
    async carregar(prefixo = '') {
      if (cache) return cache;

      const base = await Dados._viaFetch(prefixo + CAMINHOS.json).catch((erro) => {
        VS.log('aviso', 'fetch do JSON indisponível, usando fallback:', erro.message);
        return null;
      });

      const bruto = base || (await Dados._viaScript(prefixo + CAMINHOS.fallbackJs));

      if (!bruto || !Array.isArray(bruto.funcionarios)) {
        throw new Error('Base de funcionários indisponível ou malformada.');
      }

      cache = {
        meta: bruto.meta || {},
        funcionarios: bruto.funcionarios.map(Dados.normalizar)
      };
      return cache;
    },

    /**
     * Busca um funcionário pelo identificador (aceita 1, "1" ou "000001").
     * @param {string|number} id
     * @param {string} [prefixo]
     * @returns {Promise<object|null>}
     */
    async buscarPorId(id, prefixo = '') {
      const alvo = Format.normalizarId(id);
      if (!alvo) return null;
      const { funcionarios } = await Dados.carregar(prefixo);
      return funcionarios.find((f) => f.id === alvo) || null;
    },

    /**
     * Preenche campos derivados e garante tipos consistentes.
     * @param {object} f
     * @returns {object}
     */
    normalizar(f) {
      const id = Format.normalizarId(f.id);
      return {
        ...f,
        id,
        nome: String(f.nome || '').trim(),
        cpf: Format.formatarCPF(f.cpf),
        endereco: String(f.endereco || '').trim(),
        cargo: String(f.cargo || '').trim(),
        vinculo: String(f.vinculo || '').trim(),
        matricula: String(f.matricula || '').trim(),
        status: f.status || SITUACAO.VALIDA,
        foto: f.foto || `${CAMINHOS.fotos}${id}.jpg`
      };
    },

    /**
     * Determina a situação atual a partir do status gravado na base.
     * Sem prazo de validade, só a revogação manual invalida a credencial.
     * @param {object} f
     * @returns {string} valor de VS.SITUACAO
     */
    situacao(f) {
      if (!f) return SITUACAO.NAO_ENCONTRADA;
      return f.status === SITUACAO.REVOGADA ? SITUACAO.REVOGADA : SITUACAO.VALIDA;
    },

    /** @private Carrega o JSON por fetch. */
    async _viaFetch(url) {
      const resposta = await fetch(url, { cache: 'no-store' });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status} em ${url}`);
      return resposta.json();
    },

    /** @private Injeta o arquivo de fallback e lê window.__FUNCIONARIOS__. */
    _viaScript(url) {
      return new Promise((resolve, reject) => {
        if (global.__FUNCIONARIOS__) return resolve(global.__FUNCIONARIOS__);
        const script = document.createElement('script');
        script.src = url;
        script.onload = () =>
          global.__FUNCIONARIOS__
            ? resolve(global.__FUNCIONARIOS__)
            : reject(new Error('Fallback carregado sem dados.'));
        script.onerror = () => reject(new Error(`Falha ao carregar ${url}`));
        document.head.appendChild(script);
      });
    }
  };

  VS.Dados = Dados;
})(window);
