#!/usr/bin/env node
/**
 * index.js — Orquestrador de `npm run gerar`.
 *
 * Pipeline executado (nesta ordem):
 *   1. carrega config.json
 *   2. lê, normaliza e valida dados/funcionarios.json
 *   3. gera os QR Codes (PNG 300x300, correção H)
 *   4. regrava o JSON com metadados e o espelho dados/funcionarios.js
 *   5. atualiza o bloco de resumo do painel.html
 *   6. imprime o relatório final
 */
'use strict';

const path = require('node:path');
const Log = require('./lib/log');
const Config = require('./lib/config');
const Dados = require('./lib/dados');
const Qr = require('./lib/qrcode');
const Html = require('./lib/html');

/**
 * Data e hora local formatada para o relatório.
 * @returns {string}
 */
function agora() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Caminho relativo à raiz, para exibição. */
const rel = (p) => path.relative(Config.RAIZ, p).replace(/\\/g, '/');

async function principal() {
  Log.banner('Emissor de Credenciais · Vigilância Sanitária', 'Prefeitura Municipal de Taguatinga/TO');

  /* --------------------------------------------------- 1. Configuração */
  Log.titulo('Configuração');
  const { config, baseUrl, caminhos } = Config.carregar();
  Log.ok(`Endereço público: ${baseUrl}`);
  if (baseUrl.includes('SEU_USUARIO')) {
    Log.aviso('Troque "githubUser" em config.json pelo seu usuário do GitHub antes de publicar.');
  }

  /* ------------------------------------------------------- 2. Base */
  Log.titulo('Base de funcionários');
  const { meta, funcionarios, erros, avisos } = Dados.carregar();

  avisos.forEach((a) => Log.aviso(a));
  if (erros.length) {
    erros.forEach((e) => Log.erro(e));
    throw new Error(`${erros.length} erro(s) impedem a geração. Corrija dados/funcionarios.json.`);
  }
  if (!funcionarios.length) throw new Error('Nenhum funcionário cadastrado.');
  Log.ok(`${funcionarios.length} servidor(es) validado(s).`);

  /* ------------------------------------------------------ 3. QR Codes */
  Log.titulo('QR Codes (PNG 300x300 · correção H)');
  const urls = new Map();
  const qrcodes = await Qr.gerarTodos(funcionarios, baseUrl, (f, r) => {
    urls.set(f.id, r.url);
    Log.ok(`${f.id} → ${rel(r.arquivo)}`);
  });

  /* ----------------------------------------- 4. JSON + espelho JS */
  Log.titulo('Dados para o navegador');
  const metaAtualizada = {
    ...meta,
    versao: meta.versao || '1.0.0',
    orgao: config.orgao,
    baseUrl,
    mascararCPF: config.credencial.mascararCPF !== false,
    geradoEm: agora()
  };
  Dados.salvar(metaAtualizada, funcionarios);
  Log.ok(`Base normalizada: ${rel(caminhos.json)}`);
  Log.ok(`Espelho file://  : ${rel(Html.gravarFallback(metaAtualizada, funcionarios))}`);

  /* ------------------------------------------------------ 5. HTML */
  Log.titulo('Páginas');
  Log.ok(`Resumo atualizado: ${rel(Html.atualizarIndex(funcionarios, { baseUrl, geradoEm: metaAtualizada.geradoEm }))}`);

  /* ----------------------------------------------------- 6. Relatório */
  Log.titulo('Concluído');
  Log.resumo([
    `${funcionarios.length} credencial(is) publicada(s) em ${metaAtualizada.geradoEm}`,
    `QR Codes: ${rel(caminhos.qrcodes)}`,
    `Teste local: ${Log.negrito('npm start')} e abra http://localhost:4173`,
    `Exemplo de validação: ${baseUrl}/verificar.html?id=${funcionarios[0].id}`
  ]);
}

principal().catch((erro) => {
  Log.titulo('Falha na geração');
  Log.erro(erro.message);
  if (process.env.DEBUG) console.error(erro);
  process.exitCode = 1;
});
