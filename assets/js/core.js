/**
 * core.js
 * Núcleo do sistema no navegador.
 *
 * Cria o namespace global `VS` (Vigilância Sanitária) e concentra
 * constantes compartilhadas. Todos os demais arquivos JS penduram
 * seus módulos aqui, evitando poluir o escopo global.
 *
 * Observação de arquitetura: usamos scripts clássicos (e não ES Modules)
 * de propósito — assim as páginas continuam funcionando quando abertas
 * diretamente do disco (protocolo file://), sem servidor.
 */
(function (global) {
  'use strict';

  const VS = global.VS || (global.VS = {});

  /** Textos institucionais padrão (sobrescritos por dados/funcionarios.json > meta). */
  VS.ORGAO = {
    prefeitura: 'PREFEITURA MUNICIPAL DE',
    municipio: 'TAGUATINGA',
    uf: 'TOCANTINS',
    ufSigla: 'TO',
    setor: 'VIGILÂNCIA SANITÁRIA',
    lema: 'O PROGRESSO CONTINUA',
    rodape1: 'Esta credencial é de uso pessoal e intransferível.',
    rodape2: 'Emitida pela Prefeitura Municipal de Taguatinga/TO.'
  };

  /** Situações possíveis de uma credencial. */
  VS.SITUACAO = {
    VALIDA: 'valida',
    VENCIDA: 'vencida',
    REVOGADA: 'revogada',
    NAO_ENCONTRADA: 'nao_encontrada'
  };

  /** Metadados de apresentação de cada situação (rótulo, cor, ícone). */
  VS.SITUACAO_INFO = {
    valida: { rotulo: 'CREDENCIAL VÁLIDA', tema: 'ok', icone: 'check' },
    vencida: { rotulo: 'CREDENCIAL VENCIDA', tema: 'alerta', icone: 'alerta' },
    revogada: { rotulo: 'CREDENCIAL REVOGADA', tema: 'erro', icone: 'erro' },
    nao_encontrada: { rotulo: 'CREDENCIAL NÃO ENCONTRADA', tema: 'erro', icone: 'erro' }
  };

  /** Caminhos relativos usados pelas páginas. */
  VS.CAMINHOS = {
    json: 'dados/funcionarios.json',
    fallbackJs: 'dados/funcionarios.js',
    qrcodes: 'qrcodes/',
    pdf: 'pdf/',
    fotos: 'funcionarios/'
  };

  /**
   * Log padronizado no console (útil para diagnóstico em campo).
   * @param {string} nivel  'info' | 'aviso' | 'erro'
   * @param {...any} args
   */
  VS.log = function (nivel, ...args) {
    const prefixo = '[credencial]';
    if (nivel === 'erro') console.error(prefixo, ...args);
    else if (nivel === 'aviso') console.warn(prefixo, ...args);
    else console.info(prefixo, ...args);
  };
})(window);
