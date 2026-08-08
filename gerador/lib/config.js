/**
 * config.js
 * Leitura de configuração, resolução de caminhos e conversões de medida.
 *
 * É o único módulo que conhece a estrutura de pastas do projeto —
 * todos os demais pedem os caminhos daqui.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** Raiz do projeto (uma pasta acima de gerador/lib). */
const RAIZ = path.resolve(__dirname, '..', '..');

/** Caminhos absolutos usados por todo o gerador. */
const CAMINHOS = {
  raiz: RAIZ,
  config: path.join(RAIZ, 'config.json'),
  dados: path.join(RAIZ, 'dados'),
  json: path.join(RAIZ, 'dados', 'funcionarios.json'),
  fallbackJs: path.join(RAIZ, 'dados', 'funcionarios.js'),
  qrcodes: path.join(RAIZ, 'qrcodes'),
  painelHtml: path.join(RAIZ, 'painel.html'),
  assets: path.join(RAIZ, 'assets')
};

/**
 * Lê um JSON do disco com mensagem de erro amigável.
 * @param {string} arquivo
 * @returns {object}
 */
function lerJSON(arquivo) {
  let bruto;
  try {
    bruto = fs.readFileSync(arquivo, 'utf8');
  } catch (erro) {
    throw new Error(`Arquivo não encontrado: ${path.relative(RAIZ, arquivo)}`);
  }
  try {
    return JSON.parse(bruto.replace(/^﻿/, '')); // remove BOM, se houver
  } catch (erro) {
    throw new Error(`JSON inválido em ${path.relative(RAIZ, arquivo)} — ${erro.message}`);
  }
}

/**
 * Grava um JSON formatado (2 espaços, UTF-8, quebra de linha final).
 * @param {string} arquivo
 * @param {object} dados
 */
function gravarJSON(arquivo, dados) {
  garantirPasta(path.dirname(arquivo));
  fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2) + '\n', 'utf8');
}

/**
 * Cria a pasta (e as intermediárias) caso não exista.
 * @param {string} pasta
 */
function garantirPasta(pasta) {
  fs.mkdirSync(pasta, { recursive: true });
}

/**
 * Monta a URL pública base do projeto.
 * Prioridade: baseUrlPersonalizada > https://<githubUser>.github.io/<repositorio>
 * @param {object} config
 * @returns {string} sem barra final
 */
function montarBaseUrl(config) {
  const personalizada = (config.baseUrlPersonalizada || '').trim();
  if (personalizada) return personalizada.replace(/\/+$/, '');
  const usuario = (config.githubUser || 'SEU_USUARIO').trim();
  const repositorio = (config.repositorio || 'credencial-vigilancia').trim();
  return `https://${usuario}.github.io/${repositorio}`.replace(/\/+$/, '');
}

/**
 * Carrega config.json e devolve tudo já resolvido.
 * @returns {{config: object, baseUrl: string, caminhos: object}}
 */
function carregar() {
  const config = lerJSON(CAMINHOS.config);
  return {
    config,
    baseUrl: montarBaseUrl(config),
    caminhos: CAMINHOS
  };
}

/**
 * URL de validação de um servidor.
 * @param {string} baseUrl
 * @param {string} id
 * @returns {string}
 */
function urlValidacao(baseUrl, id) {
  return `${baseUrl}/verificar.html?id=${id}`;
}

module.exports = {
  RAIZ,
  CAMINHOS,
  lerJSON,
  gravarJSON,
  garantirPasta,
  montarBaseUrl,
  carregar,
  urlValidacao
};
