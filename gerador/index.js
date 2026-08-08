#!/usr/bin/env node
/**
 * index.js — Orquestrador de `npm run gerar`.
 *
 * Pipeline executado (nesta ordem):
 *   1. carrega config.json
 *   2. lê, normaliza e valida todos os dados/<id>.json
 *   3. gera os QR Codes (PNG 300x300, correção H)
 *   4. regrava um JSON por servidor e o índice privado do painel
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
  const { funcionarios, erros, avisos } = Dados.carregar();

  avisos.forEach((a) => Log.aviso(a));
  if (erros.length) {
    erros.forEach((e) => Log.erro(e));
    throw new Error(`${erros.length} erro(s) impedem a geração. Corrija os arquivos em dados/.`);
  }
  if (!funcionarios.length) throw new Error('Nenhum funcionário cadastrado em dados/.');
  Log.ok(`${funcionarios.length} servidor(es) validado(s).`);

  /* ------------------------------------------------------ 3. QR Codes */
  Log.titulo('QR Codes (PNG 300x300 · correção H)');
  await Qr.gerarTodos(funcionarios, baseUrl, (f, r) => Log.ok(`${f.id} → ${rel(r.arquivo)}`));

  /* ----------------------------------------- 4. Um JSON por servidor */
  Log.titulo('Dados para o navegador');
  const meta = {
    versao: '1.0.0',
    orgao: config.orgao,
    baseUrl,
    mascararCPF: config.credencial.mascararCPF !== false,
    geradoEm: agora()
  };
  const gravados = Dados.salvar(funcionarios, meta);
  Log.ok(`${gravados.length} arquivo(s) em ${rel(caminhos.dados)} — um por servidor`);
  Log.ok(`Índice do painel : ${rel(Dados.salvarIndice(funcionarios, meta))} (não vai para o GitHub)`);

  /* ------------------------------------------------------ 5. HTML */
  Log.titulo('Páginas');
  Log.ok(`Resumo atualizado: ${rel(Html.atualizarIndex(funcionarios, { baseUrl, geradoEm: meta.geradoEm }))}`);

  /* ----------------------------------------------------- 6. Relatório */
  Log.titulo('Concluído');
  Log.resumo([
    `${funcionarios.length} credencial(is) publicada(s) em ${meta.geradoEm}`,
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
