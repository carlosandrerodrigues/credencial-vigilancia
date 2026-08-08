/**
 * dados.js (gerador)
 * Leitura, normalização e validação da base de funcionários.
 *
 * A base é uma pasta, não um arquivo: cada servidor mora em seu próprio
 * dados/<id>.json. Isso existe por privacidade — no GitHub Pages não há
 * autenticação, e um arquivo único deixaria a lista inteira a um clique de
 * distância. Com um arquivo por pessoa, quem tem o QR Code de alguém alcança
 * só aquele registro.
 *
 * Arquivos começados por "_" são artefatos internos (o índice do painel) e
 * ficam de fora da varredura.
 *
 * Reaproveita assets/js/format.js — as mesmas regras de CPF e de identificador
 * valem no navegador e no Node, sem duplicação de código.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Format = require('../../assets/js/format.js');
const { CAMINHOS, lerJSON, gravarJSON, garantirPasta } = require('./config');

/**
 * Normaliza um registro, preenchendo o que faltar.
 * @param {object} bruto
 * @returns {object}
 */
function normalizar(bruto) {
  return {
    id: Format.normalizarId(bruto.id),
    nome: String(bruto.nome || '').trim(),
    cpf: Format.formatarCPF(bruto.cpf),
    endereco: String(bruto.endereco || '').trim(),
    cargo: String(bruto.cargo || '').trim(),
    vinculo: String(bruto.vinculo || '').trim(),
    matricula: String(bruto.matricula || '').trim(),
    status: bruto.status || 'valida'
  };
}

/**
 * Verifica a consistência de um registro.
 * @param {object} f
 * @param {Set<string>} idsVistos
 * @param {string} arquivo nome do arquivo de origem, para a mensagem de erro
 * @returns {{erros: string[], avisos: string[]}}
 */
function validar(f, idsVistos, arquivo) {
  const erros = [];
  const avisos = [];
  const onde = `${arquivo}`;

  if (!f.id) {
    erros.push(`${onde}: id inválido — use ${Format.ID_TAMANHO}+ caracteres, só letras minúsculas e números.`);
  } else if (`${f.id}.json` !== arquivo) {
    erros.push(`${onde}: o campo id é "${f.id}"; renomeie o arquivo para ${f.id}.json.`);
  }
  if (idsVistos.has(f.id)) erros.push(`${onde}: id duplicado.`);
  if (!f.nome) erros.push(`${onde}: nome obrigatório.`);
  if (!f.cargo) erros.push(`${onde}: cargo/função obrigatório.`);
  if (!f.matricula) avisos.push(`${onde}: matrícula não informada.`);
  if (!Format.cpfValido(f.cpf)) avisos.push(`${onde}: CPF ${f.cpf} não passa na validação dos dígitos.`);

  return { erros, avisos };
}

/**
 * Nomes dos arquivos de servidor dentro de dados/, em ordem alfabética.
 * @returns {string[]}
 */
function arquivosDeServidor() {
  garantirPasta(CAMINHOS.dados);
  return fs
    .readdirSync(CAMINHOS.dados)
    .filter((nome) => nome.endsWith('.json') && !nome.startsWith('_'))
    .sort();
}

const Dados = {
  /**
   * Carrega e valida todos os servidores da pasta dados/.
   * @returns {{funcionarios: object[], erros: string[], avisos: string[]}}
   */
  carregar() {
    const idsVistos = new Set();
    const erros = [];
    const avisos = [];
    const funcionarios = [];

    for (const arquivo of arquivosDeServidor()) {
      const f = normalizar(lerJSON(path.join(CAMINHOS.dados, arquivo)));
      const resultado = validar(f, idsVistos, arquivo);
      erros.push(...resultado.erros);
      avisos.push(...resultado.avisos);
      idsVistos.add(f.id);
      funcionarios.push(f);
    }

    funcionarios.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    return { funcionarios, erros, avisos };
  },

  /**
   * Regrava cada servidor em seu arquivo, já normalizado e com os textos
   * institucionais embutidos.
   *
   * O `meta` é repetido em todo arquivo de propósito: assim a página de
   * validação resolve a credencial inteira com uma única requisição, o que
   * importa em celular no 4G. Ele é sempre reescrito a partir do config.json,
   * então não deve ser editado à mão.
   *
   * @param {object[]} funcionarios
   * @param {object} meta
   * @returns {string[]} caminhos gravados
   */
  salvar(funcionarios, meta) {
    garantirPasta(CAMINHOS.dados);
    return funcionarios.map((f) => {
      const arquivo = path.join(CAMINHOS.dados, `${f.id}.json`);
      gravarJSON(arquivo, { ...f, meta });
      return arquivo;
    });
  },

  /**
   * Grava o índice consumido pelo painel administrativo.
   *
   * Fica fora do GitHub Pages (ver .gitignore): é justamente a lista completa
   * que a nova estrutura existe para não publicar.
   *
   * @param {object[]} funcionarios
   * @param {object} meta
   * @returns {string} caminho do arquivo
   */
  salvarIndice(funcionarios, meta) {
    garantirPasta(CAMINHOS.dados);
    gravarJSON(CAMINHOS.indicePainel, { meta, funcionarios });
    return CAMINHOS.indicePainel;
  },

  /**
   * Acrescenta um servidor, sorteando um id livre.
   * @param {object} registro
   * @returns {object} registro normalizado, já com o id definitivo
   */
  acrescentar(registro) {
    const usados = new Set(arquivosDeServidor().map((nome) => nome.replace(/\.json$/, '')));
    const novo = normalizar({ ...registro, id: registro.id || Dados.novoId(usados) });
    if (!novo.id) throw new Error('Não foi possível definir um identificador válido.');
    if (usados.has(novo.id)) throw new Error(`Já existe um servidor com o identificador ${novo.id}.`);

    garantirPasta(CAMINHOS.dados);
    gravarJSON(path.join(CAMINHOS.dados, `${novo.id}.json`), novo);
    return novo;
  },

  /**
   * Sorteia um identificador que ainda não está em uso.
   * @param {Set<string>} [usados]
   * @returns {string}
   */
  novoId(usados) {
    const ocupados = usados || new Set(arquivosDeServidor().map((n) => n.replace(/\.json$/, '')));
    let id;
    do {
      id = Format.gerarId();
    } while (ocupados.has(id));
    return id;
  },

  arquivosDeServidor,
  normalizar,
  validar
};

module.exports = Dados;
