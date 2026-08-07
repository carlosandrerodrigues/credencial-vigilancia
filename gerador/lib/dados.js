/**
 * dados.js (gerador)
 * Leitura, normalização e validação da base de funcionários.
 *
 * Reaproveita assets/js/format.js — as mesmas regras de CPF, datas e
 * identificadores valem no navegador e no Node, sem duplicação de código.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Format = require('../../assets/js/format.js');
const { CAMINHOS, lerJSON, gravarJSON } = require('./config');

/**
 * Normaliza um registro, preenchendo o que faltar.
 * @param {object} bruto
 * @param {object} config
 * @returns {object}
 */
function normalizar(bruto) {
  const id = Format.normalizarId(bruto.id);
  return {
    id,
    nome: String(bruto.nome || '').trim(),
    cpf: Format.formatarCPF(bruto.cpf),
    endereco: String(bruto.endereco || '').trim(),
    cargo: String(bruto.cargo || '').trim(),
    vinculo: String(bruto.vinculo || '').trim(),
    matricula: String(bruto.matricula || '').trim(),
    status: bruto.status || 'valida',
    foto: bruto.foto || `funcionarios/${id}.jpg`
  };
}

/**
 * Verifica a consistência de um registro.
 * @param {object} f
 * @param {Set<string>} idsVistos
 * @returns {{erros: string[], avisos: string[]}}
 */
function validar(f, idsVistos) {
  const erros = [];
  const avisos = [];
  const onde = `registro ${f.id || '(sem id)'}`;

  if (!/^\d{6}$/.test(f.id)) erros.push(`${onde}: id deve ter 6 dígitos.`);
  if (idsVistos.has(f.id)) erros.push(`${onde}: id duplicado.`);
  if (!f.nome) erros.push(`${onde}: nome obrigatório.`);
  if (!f.cargo) erros.push(`${onde}: cargo/função obrigatório.`);
  if (!f.matricula) avisos.push(`${onde}: matrícula não informada.`);
  if (!Format.cpfValido(f.cpf)) avisos.push(`${onde}: CPF ${f.cpf} não passa na validação dos dígitos.`);

  const foto = path.join(CAMINHOS.raiz, f.foto);
  if (!fs.existsSync(foto)) {
    avisos.push(`${onde}: foto ausente (${f.foto}) — será usado o avatar com as iniciais.`);
  } else if (!/\.(jpe?g|png)$/i.test(f.foto)) {
    erros.push(`${onde}: a foto precisa ser .jpg ou .png (PDFKit não lê outros formatos).`);
  }

  return { erros, avisos };
}

const Dados = {
  /**
   * Carrega e valida a base inteira.
   * @returns {{meta: object, funcionarios: object[], erros: string[], avisos: string[]}}
   */
  carregar() {
    const bruto = lerJSON(CAMINHOS.json);
    if (!Array.isArray(bruto.funcionarios)) {
      throw new Error('dados/funcionarios.json deve conter a lista "funcionarios".');
    }

    const idsVistos = new Set();
    const erros = [];
    const avisos = [];
    const funcionarios = [];

    for (const registro of bruto.funcionarios) {
      const f = normalizar(registro);
      const resultado = validar(f, idsVistos);
      erros.push(...resultado.erros);
      avisos.push(...resultado.avisos);
      idsVistos.add(f.id);
      funcionarios.push(f);
    }

    funcionarios.sort((a, b) => a.id.localeCompare(b.id));
    return { meta: bruto.meta || {}, funcionarios, erros, avisos };
  },

  /**
   * Regrava dados/funcionarios.json já normalizado e com metadados atualizados.
   * @param {object} meta
   * @param {object[]} funcionarios
   */
  salvar(meta, funcionarios) {
    gravarJSON(CAMINHOS.json, { meta, funcionarios });
  },

  /**
   * Acrescenta um servidor à base (usado por `npm run cadastrar`).
   * @param {object} registro
   * @returns {object} registro normalizado
   */
  acrescentar(registro) {
    const bruto = lerJSON(CAMINHOS.json);
    const novo = normalizar(registro);
    if (bruto.funcionarios.some((f) => Format.normalizarId(f.id) === novo.id)) {
      throw new Error(`Já existe um servidor com o registro ${novo.id}.`);
    }
    bruto.funcionarios.push(novo);
    gravarJSON(CAMINHOS.json, bruto);
    return novo;
  },

  /**
   * Próximo identificador livre.
   * @returns {string}
   */
  proximoId() {
    const bruto = lerJSON(CAMINHOS.json);
    const maior = (bruto.funcionarios || []).reduce(
      (max, f) => Math.max(max, Number(Format.normalizarId(f.id)) || 0),
      0
    );
    return String(maior + 1).padStart(6, '0');
  },

  normalizar,
  validar
};

module.exports = Dados;
