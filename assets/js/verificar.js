/**
 * verificar.js
 * Controlador da página verificar.html.
 *
 * Fluxo: lê ?id=<identificador> da URL -> busca dados/<id>.json -> renderiza.
 * Uma única página atende todos os servidores cadastrados.
 */
(function (global) {
  'use strict';

  const VS = global.VS;
  const { Format, Dados, Credencial } = VS;

  /**
   * Extrai o identificador da querystring (aceita ?id= e ?ID=).
   * @returns {string}
   */
  function idDaURL() {
    const params = new URLSearchParams(global.location.search);
    const bruto = params.get('id') || params.get('ID') || params.get('registro') || '';
    return Format.normalizarId(bruto);
  }

  /**
   * Exibe uma mensagem de falha técnica (base indisponível, por exemplo).
   * @param {HTMLElement} alvo
   * @param {Error} erro
   */
  function mostrarFalha(alvo, erro) {
    VS.log('erro', erro);
    alvo.innerHTML = `
      <article class="credencial credencial--erro">
        <div class="credencial__situacao">${VS.Icones.selo('erro', 26)}<span>FALHA NA CONSULTA</span></div>
        <section class="credencial__aviso">
          <p>Não foi possível carregar a base de credenciais neste momento.</p>
          <p>Verifique sua conexão e tente novamente.</p>
          <p class="credencial__detalhe">${Format.escaparHTML(erro.message)}</p>
        </section>
      </article>`;
  }

  /** Inicializa a página. */
  async function iniciar() {
    const alvo = document.getElementById('credencial');
    const id = idDaURL();

    if (!id) {
      alvo.innerHTML = Credencial.naoEncontrada('');
      document.title = 'Credencial não localizada | Vigilância Sanitária';
      return;
    }

    try {
      // Uma requisição só: dados/<id>.json traz o servidor e os textos
      // institucionais juntos. Importa em celular no 4G, no meio da rua.
      const credencial = await Dados.carregarCredencial(id);

      if (!credencial) {
        alvo.innerHTML = Credencial.naoEncontrada(id);
        document.title = 'Credencial não localizada | Vigilância Sanitária';
        return;
      }

      const { funcionario, meta } = credencial;
      alvo.innerHTML = Credencial.render(funcionario, {
        mascararCPF: meta.mascararCPF !== false,
        orgao: meta.orgao
      });
      document.title = `${funcionario.nome} | Credencial - Vigilância Sanitária`;
    } catch (erro) {
      mostrarFalha(alvo, erro);
    }
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})(window);
