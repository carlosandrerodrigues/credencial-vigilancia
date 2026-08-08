/**
 * painel.js
 * Controlador da página painel.html (painel administrativo).
 *
 * Esta página fica fora do que vai para o GitHub Pages: roda só na máquina
 * do coordenador, por 'npm start'. Ver .gitignore.
 *
 * Responsabilidades:
 *  - listar os servidores cadastrados com QR Code e link de validação;
 *  - oferecer um formulário de cadastro que devolve o JSON pronto
 *    (copiar ou baixar), mantendo o projeto 100% estático e sem banco de dados.
 */
(function (global) {
  'use strict';

  const VS = global.VS;
  const { Format, Dados, CAMINHOS, SITUACAO_INFO } = VS;

  /** Estado da página. */
  const estado = {
    meta: {},
    funcionarios: [],
    filtro: ''
  };

  /* ----------------------------------------------------------------- *
   * Listagem
   * ----------------------------------------------------------------- */

  /**
   * Monta o cartão de um servidor na listagem.
   * @param {object} f
   * @returns {string}
   */
  function cartao(f) {
    const situacao = Dados.situacao(f);
    const info = SITUACAO_INFO[situacao];
    const url = `verificar.html?id=${encodeURIComponent(f.id)}`;
    return `
    <article class="cartao">
      <div class="cartao__qr">
        <img src="${CAMINHOS.qrcodes}${Format.escaparHTML(f.id)}.png"
             alt="QR Code de ${Format.escaparHTML(f.nome)}"
             onerror="this.replaceWith(Object.assign(document.createElement('p'),{className:'cartao__qr-vazio',textContent:'QR não gerado'}))">
      </div>
      <div class="cartao__corpo">
        <p class="cartao__nome">${Format.escaparHTML(f.nome)}</p>
        <p class="cartao__cargo">${Format.escaparHTML(f.cargo)}</p>
        <p class="cartao__meta">Registro ${Format.escaparHTML(f.id)}${f.matricula ? ` &middot; Matrícula ${Format.escaparHTML(f.matricula)}` : ''}</p>
        <p class="cartao__meta">${Format.escaparHTML(f.vinculo)}</p>
        <span class="etiqueta etiqueta--${info.tema}">${Format.escaparHTML(info.rotulo)}</span>
      </div>
      <div class="cartao__acoes">
        <a class="botao botao--primario" href="${url}">Abrir validação</a>
        <a class="botao" href="${CAMINHOS.qrcodes}${Format.escaparHTML(f.id)}.png" target="_blank" rel="noopener">Baixar QR Code</a>
        <button class="botao botao--suave" type="button" data-copiar="${Format.escaparHTML(f.id)}">Copiar link</button>
      </div>
    </article>`;
  }

  /** Redesenha a listagem aplicando o filtro atual. */
  function renderLista() {
    const alvo = document.getElementById('lista');
    const termo = estado.filtro.trim().toLowerCase();
    const itens = estado.funcionarios.filter((f) =>
      !termo ||
      [f.nome, f.cargo, f.matricula, f.id, f.cpf].join(' ').toLowerCase().includes(termo)
    );

    document.getElementById('contador').textContent =
      `${itens.length} de ${estado.funcionarios.length} servidor(es)`;

    alvo.innerHTML = itens.length
      ? itens.map(cartao).join('')
      : '<p class="vazio">Nenhum servidor encontrado para o filtro informado.</p>';
  }

  /**
   * URL pública de validação de um servidor.
   * @param {string} id
   * @returns {string}
   */
  function urlPublica(id) {
    const base = (estado.meta.baseUrl || '').replace(/\/+$/, '');
    if (base) return `${base}/verificar.html?id=${id}`;
    return new URL(`verificar.html?id=${id}`, global.location.href).href;
  }

  /* ----------------------------------------------------------------- *
   * Cadastro
   * ----------------------------------------------------------------- */

  /**
   * Próximo identificador livre, sempre com 6 dígitos.
   * @returns {string}
   */
  function proximoId() {
    const maior = estado.funcionarios.reduce((max, f) => Math.max(max, Number(f.id) || 0), 0);
    return String(maior + 1).padStart(6, '0');
  }

  /**
   * Lê o formulário e devolve o registro do novo servidor.
   * @param {HTMLFormElement} form
   * @returns {object}
   */
  function coletarFormulario(form) {
    const d = Object.fromEntries(new FormData(form).entries());
    const id = Format.normalizarId(d.id) || proximoId();
    return {
      id,
      nome: d.nome.trim(),
      cpf: Format.formatarCPF(d.cpf),
      endereco: d.endereco.trim(),
      cargo: d.cargo.trim(),
      vinculo: d.vinculo.trim(),
      matricula: d.matricula.trim(),
      status: d.status || 'valida'
    };
  }

  /**
   * Valida os campos obrigatórios e o CPF.
   * @param {object} registro
   * @returns {string[]} lista de erros
   */
  function validar(registro) {
    const erros = [];
    if (!registro.nome) erros.push('Informe o nome completo.');
    if (!Format.cpfValido(registro.cpf)) erros.push('CPF inválido (verifique os dígitos).');
    if (!registro.cargo) erros.push('Informe o cargo/função.');
    if (!registro.matricula) erros.push('Informe a matrícula.');
    if (estado.funcionarios.some((f) => f.id === registro.id)) {
      erros.push(`Já existe um servidor com o registro ${registro.id}.`);
    }
    return erros;
  }

  /**
   * Exibe o resultado do cadastro (JSON pronto + ações).
   * @param {object} registro
   */
  function mostrarResultado(registro) {
    const saida = document.getElementById('saida');
    const baseAtualizada = {
      meta: { ...estado.meta, geradoEm: '' },
      funcionarios: [...estado.funcionarios.map(limpar), registro]
    };

    saida.hidden = false;
    saida.querySelector('#saida-registro').textContent = JSON.stringify(registro, null, 2);
    saida.dataset.base = JSON.stringify(baseAtualizada, null, 2);
    saida.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Remove campos derivados antes de gravar de volta no JSON.
   * @param {object} f
   * @returns {object}
   */
  function limpar(f) {
    const { id, nome, cpf, endereco, cargo, vinculo, matricula, status } = f;
    return { id, nome, cpf, endereco, cargo, vinculo, matricula, status };
  }

  /**
   * Copia texto para a área de transferência, com fallback para navegadores antigos.
   * @param {string} texto
   * @param {HTMLElement} [botao]
   */
  async function copiar(texto, botao) {
    try {
      if (navigator.clipboard && global.isSecureContext) {
        await navigator.clipboard.writeText(texto);
      } else {
        const area = document.createElement('textarea');
        area.value = texto;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      if (botao) {
        const original = botao.textContent;
        botao.textContent = 'Copiado!';
        setTimeout(() => (botao.textContent = original), 1600);
      }
    } catch (erro) {
      VS.log('erro', erro);
      global.prompt('Copie manualmente:', texto);
    }
  }

  /**
   * Dispara o download de um arquivo de texto gerado no navegador.
   * @param {string} nome
   * @param {string} conteudo
   */
  function baixar(nome, conteudo) {
    const blob = new Blob([conteudo], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  }

  /* ----------------------------------------------------------------- *
   * Inicialização
   * ----------------------------------------------------------------- */

  /** Liga todos os eventos da página. */
  function ligarEventos() {
    document.getElementById('filtro').addEventListener('input', (ev) => {
      estado.filtro = ev.target.value;
      renderLista();
    });

    document.getElementById('lista').addEventListener('click', (ev) => {
      const botao = ev.target.closest('[data-copiar]');
      if (botao) copiar(urlPublica(botao.dataset.copiar), botao);
    });

    const form = document.getElementById('form-cadastro');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const registro = coletarFormulario(form);
      const erros = validar(registro);
      const caixaErros = document.getElementById('erros');

      if (erros.length) {
        caixaErros.hidden = false;
        caixaErros.innerHTML = erros.map((e) => `<li>${Format.escaparHTML(e)}</li>`).join('');
        caixaErros.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      caixaErros.hidden = true;
      mostrarResultado(registro);
    });

    form.addEventListener('reset', () => {
      document.getElementById('saida').hidden = true;
      document.getElementById('erros').hidden = true;
      setTimeout(preencherPadroes, 0);
    });

    document.getElementById('btn-copiar-registro').addEventListener('click', (ev) => {
      copiar(document.getElementById('saida-registro').textContent, ev.currentTarget);
    });

    document.getElementById('btn-baixar-base').addEventListener('click', () => {
      baixar('funcionarios.json', document.getElementById('saida').dataset.base);
    });
  }

  /** Preenche os campos automáticos do formulário (o registro). */
  function preencherPadroes() {
    document.getElementById('form-cadastro').elements.id.value = proximoId();
  }

  /** Ponto de entrada. */
  async function iniciar() {
    document.getElementById('marca').src = CAMINHOS.logo;
    try {
      const base = await Dados.carregar();
      estado.meta = base.meta;
      estado.funcionarios = base.funcionarios;
    } catch (erro) {
      VS.log('erro', erro);
      document.getElementById('lista').innerHTML =
        `<p class="vazio">Não foi possível carregar <code>dados/funcionarios.json</code>. ` +
        `Execute <code>npm run gerar</code> ou inicie o servidor local com <code>npm start</code>.</p>`;
    }
    const base = estado.meta.baseUrl || '(defina githubUser em config.json)';
    document.getElementById('base-url').textContent = base;
    ligarEventos();
    preencherPadroes();
    renderLista();
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})(window);
