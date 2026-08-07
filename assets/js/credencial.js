/**
 * credencial.js
 * Componente de apresentação da credencial.
 *
 * Recebe um funcionário já normalizado e devolve o HTML do documento.
 * É o único lugar do projeto que conhece a marcação visual da credencial —
 * tanto a página de verificação quanto o painel reaproveitam este componente.
 */
(function (global) {
  'use strict';

  const VS = global.VS || (global.VS = {});
  const { Format, Icones, Dados, ORGAO, SITUACAO_INFO } = VS;

  /**
   * Monta uma linha de campo (ícone + rótulo + valor).
   * @param {{icone: string, rotulo: string, valor: string, riscado?: boolean}} campo
   * @returns {string}
   */
  function linhaCampo(campo) {
    if (!campo.valor) return '';
    return `
    <div class="campo${campo.riscado ? ' campo--riscado' : ''}">
      <span class="campo__icone">${Icones.campo(campo.icone)}</span>
      <span class="campo__rotulo">${Format.escaparHTML(campo.rotulo)}</span>
      <span class="campo__valor">${Format.escaparHTML(campo.valor)}</span>
    </div>`;
  }

  const Credencial = {
    /**
     * Renderiza a credencial completa.
     * @param {object} funcionario
     * @param {object} [opcoes]
     * @param {boolean} [opcoes.mascararCPF=true]
     * @param {string}  [opcoes.prefixo='']   caminho relativo até a raiz
     * @param {object}  [opcoes.orgao]        textos institucionais
     * @returns {string} HTML
     */
    render(funcionario, opcoes = {}) {
      const cfg = {
        mascararCPF: true,
        prefixo: '',
        orgao: ORGAO,
        ...opcoes
      };
      const orgao = { ...ORGAO, ...(cfg.orgao || {}) };
      const situacao = Dados.situacao(funcionario);
      const info = SITUACAO_INFO[situacao] || SITUACAO_INFO.nao_encontrada;

      const campos = [
        { icone: 'pessoa', rotulo: 'NOME COMPLETO', valor: funcionario.nome },
        { icone: 'documento', rotulo: 'CPF', valor: Format.mascararCPF(funcionario.cpf, cfg.mascararCPF) },
        { icone: 'local', rotulo: 'ENDEREÇO', valor: funcionario.endereco },
        { icone: 'maleta', rotulo: 'CARGO/FUNÇÃO', valor: funcionario.cargo },
        { icone: 'vinculo', rotulo: 'VÍNCULO', valor: funcionario.vinculo },
        { icone: 'cracha', rotulo: 'MATRÍCULA', valor: funcionario.matricula }
      ];

      return `
<article class="credencial credencial--${info.tema}" aria-live="polite">
  <header class="credencial__topo">
    <div class="credencial__marca">${Icones.brasao(58)}</div>
    <div class="credencial__titulos">
      <h1 class="credencial__orgao">${Format.escaparHTML(`${orgao.prefeitura} ${orgao.municipio} - ${orgao.uf}`)}</h1>
      <p class="credencial__setor">${Format.escaparHTML(orgao.setor)}</p>
    </div>
  </header>

  <div class="credencial__situacao">
    ${Icones.selo(info.icone, 26)}
    <span>${Format.escaparHTML(info.rotulo)}</span>
  </div>

  <section class="credencial__identificacao">
    <div class="credencial__foto">
      ${Credencial.foto(funcionario, cfg.prefixo)}
    </div>
    <div class="credencial__resumo">
      <p class="credencial__nome">${Format.escaparHTML(funcionario.nome)}</p>
      <p class="credencial__cargo">${Format.escaparHTML(funcionario.cargo)}</p>
      <p class="credencial__matricula">${funcionario.matricula ? `Matrícula ${Format.escaparHTML(funcionario.matricula)} &middot; ` : ''}Registro nº ${Format.escaparHTML(funcionario.id)}</p>
    </div>
  </section>

  <section class="credencial__dados">
    ${campos.map(linhaCampo).join('')}
  </section>

  <footer class="credencial__rodape">
    <p>${Format.escaparHTML(orgao.rodape1)}</p>
    <p>${Format.escaparHTML(orgao.rodape2)}</p>
    <p class="credencial__verificacao">Consulta realizada em ${Format.escaparHTML(Credencial.carimbo())}</p>
  </footer>
</article>`;
    },

    /**
     * Imagem do servidor com degradação elegante para avatar vetorial.
     * @param {object} funcionario
     * @param {string} prefixo
     * @returns {string}
     */
    foto(funcionario, prefixo = '') {
      const caminho = Format.escaparHTML(prefixo + funcionario.foto);
      const alternativo = Icones.avatar(funcionario.nome);
      return `
      <div class="foto-caixa">
        <img src="${caminho}" alt="Fotografia de ${Format.escaparHTML(funcionario.nome)}" decoding="async"
             onerror="this.classList.add('foto--oculta');this.nextElementSibling.hidden=false;">
        <div class="foto-alternativa" hidden>${alternativo}</div>
      </div>`;
    },

    /**
     * Bloco exibido quando o identificador não existe na base.
     * @param {string} id
     * @returns {string}
     */
    naoEncontrada(id) {
      const info = SITUACAO_INFO.nao_encontrada;
      return `
<article class="credencial credencial--erro">
  <header class="credencial__topo">
    <div class="credencial__marca">${Icones.brasao(58)}</div>
    <div class="credencial__titulos">
      <h1 class="credencial__orgao">${Format.escaparHTML(`${ORGAO.prefeitura} ${ORGAO.municipio} - ${ORGAO.uf}`)}</h1>
      <p class="credencial__setor">${Format.escaparHTML(ORGAO.setor)}</p>
    </div>
  </header>
  <div class="credencial__situacao">
    ${Icones.selo(info.icone, 26)}
    <span>${Format.escaparHTML(info.rotulo)}</span>
  </div>
  <section class="credencial__aviso">
    <p>Não localizamos nenhuma credencial ativa para o registro
       <strong>${Format.escaparHTML(id || '—')}</strong>.</p>
    <p>Confira o QR Code apresentado ou entre em contato com a Vigilância Sanitária
       da Prefeitura Municipal de Taguatinga/TO.</p>
  </section>
  <footer class="credencial__rodape">
    <p>${Format.escaparHTML(ORGAO.rodape2)}</p>
  </footer>
</article>`;
    },

    /**
     * Data e hora da consulta, no formato brasileiro.
     * @returns {string}
     */
    carimbo() {
      const agora = new Date();
      const hora = String(agora.getHours()).padStart(2, '0');
      const minuto = String(agora.getMinutes()).padStart(2, '0');
      return `${Format.formatarData(agora)} às ${hora}:${minuto}`;
    }
  };

  VS.Credencial = Credencial;
})(window);
