/**
 * dados.js
 * Camada de acesso a dados do navegador.
 *
 * Cada servidor mora em seu próprio dados/<id>.json. A página de validação
 * busca exatamente um arquivo — o do identificador que veio no QR Code — e
 * nunca a lista completa. É o que impede que alguém com um QR Code na mão
 * baixe o quadro inteiro de servidores.
 *
 * O painel administrativo precisa da lista, e por isso lê dados/_painel.json.
 * Esse índice fica fora do GitHub Pages (.gitignore) e só existe na máquina
 * do coordenador, servido por `npm start`.
 */
(function (global) {
  'use strict';

  const VS = global.VS || (global.VS = {});
  const { Format, CAMINHOS, SITUACAO } = VS;

  /** Credenciais já buscadas nesta sessão, por id. */
  const cache = new Map();

  const Dados = {
    /**
     * Carrega a credencial de um servidor.
     *
     * Devolve null quando o identificador não existe ou é malformado — os dois
     * casos levam à mesma tela de "não encontrada", e distinguir só ajudaria
     * quem estivesse sondando identificadores.
     *
     * @param {string} id
     * @param {string} [prefixo] caminho relativo até a raiz do projeto
     * @returns {Promise<{funcionario: object, meta: object}|null>}
     */
    async carregarCredencial(id, prefixo = '') {
      const alvo = Format.normalizarId(id);
      if (!alvo) return null;
      if (cache.has(alvo)) return cache.get(alvo);

      const resposta = await fetch(`${prefixo}${CAMINHOS.dados}${alvo}.json`, { cache: 'no-store' });
      if (resposta.status === 404) {
        cache.set(alvo, null);
        return null;
      }
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status} ao consultar a credencial.`);

      const bruto = await resposta.json();
      const resultado = { funcionario: Dados.normalizar(bruto), meta: bruto.meta || {} };
      cache.set(alvo, resultado);
      return resultado;
    },

    /**
     * Carrega o índice completo. Só funciona localmente, via `npm start`.
     * @param {string} [prefixo]
     * @returns {Promise<{meta: object, funcionarios: object[]}>}
     */
    async carregarIndice(prefixo = '') {
      const resposta = await fetch(`${prefixo}${CAMINHOS.indicePainel}`, { cache: 'no-store' });
      if (!resposta.ok) {
        throw new Error(
          `Índice indisponível (HTTP ${resposta.status}). Rode "npm run gerar" e abra o painel por "npm start".`
        );
      }
      const bruto = await resposta.json();
      if (!Array.isArray(bruto.funcionarios)) throw new Error('Índice malformado.');
      return {
        meta: bruto.meta || {},
        funcionarios: bruto.funcionarios.map(Dados.normalizar)
      };
    },

    /**
     * Preenche campos derivados e garante tipos consistentes.
     * @param {object} f
     * @returns {object}
     */
    normalizar(f) {
      return {
        id: Format.normalizarId(f.id),
        nome: String(f.nome || '').trim(),
        cpf: Format.formatarCPF(f.cpf),
        endereco: String(f.endereco || '').trim(),
        cargo: String(f.cargo || '').trim(),
        vinculo: String(f.vinculo || '').trim(),
        matricula: String(f.matricula || '').trim(),
        status: f.status || SITUACAO.VALIDA
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
    }
  };

  VS.Dados = Dados;
})(window);
