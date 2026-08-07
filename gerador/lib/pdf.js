/**
 * pdf.js
 * Composição do crachá em PDF (frente e verso) pronto para gráfica.
 *
 * Padrões aplicados:
 *  - formato CR80 (ISO/IEC 7810 ID-1): 85,60 x 53,98 mm;
 *  - sangria (bleed) de 3 mm em todos os lados;
 *  - margem de segurança de 3 mm a partir da linha de corte;
 *  - marcas de corte na área de sangria;
 *  - conteúdo 100% vetorial, exceto foto e QR Code (imagens em 300 dpi ou mais).
 *
 * O mesmo desenho é reaproveitado em três saídas: PDF individual,
 * PDF único com todos os crachás e folha A4 de impressão.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const PDFDocument = require('pdfkit');
const Format = require('../../assets/js/format.js');
const Desenho = require('./desenho');
const { mm, CAMINHOS, garantirPasta } = require('./config');

/* ===================================================================== *
 * Contexto de renderização
 * ===================================================================== */

/**
 * Consolida template + config em um objeto de tema usado pelo desenho.
 * @param {object} template
 * @param {object} config
 * @returns {object}
 */
function montarTema(template, config) {
  return {
    cores: template.cores,
    fontes: template.tipografia,
    tamanhos: template.tipografia.tamanhos,
    orgao: config.orgao,
    credencial: config.credencial,
    medidas: {
      largura: mm(template.cartao.larguraMM),
      altura: mm(template.cartao.alturaMM),
      sangria: mm(template.cartao.sangriaMM),
      margem: mm(template.cartao.margemSeguraMM),
      raio: mm(template.cartao.raioMM),
      cabecalhoFrente: mm(template.frente.alturaCabecalhoMM),
      foto: { largura: mm(template.frente.fotoMM.largura), altura: mm(template.frente.fotoMM.altura) },
      faixaInferior: mm(template.frente.alturaFaixaInferiorMM),
      cabecalhoVerso: mm(template.verso.alturaCabecalhoMM),
      qrcode: mm(template.verso.qrcodeMM),
      rodapeVerso: mm(template.verso.alturaRodapeMM)
    },
    marcasDeCorte: template.cartao.marcasDeCorte !== false
  };
}

/* ===================================================================== *
 * Frente
 * ===================================================================== */

/**
 * Desenha a frente do crachá.
 * @param {PDFDocument} doc
 * @param {object} f          funcionário normalizado
 * @param {object} tema
 * @param {{x: number, y: number, sangria: number}} pos  canto de corte + sangria a extravasar
 */
function desenharFrente(doc, f, tema, pos) {
  const { cores, fontes, tamanhos, orgao, credencial, medidas } = tema;
  const { x, y } = pos;
  const s = pos.sangria || 0;
  const L = medidas.largura;
  const A = medidas.altura;
  const m = medidas.margem;

  // Fundo (extravasa para a sangria)
  doc.rect(x - s, y - s, L + 2 * s, A + 2 * s).fill(cores.branco);

  // Cabeçalho azul institucional
  const hCab = medidas.cabecalhoFrente;
  const degrade = doc
    .linearGradient(x - s, y - s, x + L + s, y + hCab)
    .stop(0, cores.azul)
    .stop(1, cores.azulClaro);
  doc.rect(x - s, y - s, L + 2 * s, hCab + s).fill(degrade);

  // Faixa tricolor de assinatura visual
  Desenho.faixaTricolor(doc, x - s, y + hCab - 1.6, L + 2 * s, 1.6);

  // Brasão
  const brasaoTam = hCab - 2 * 5;
  Desenho.brasao(doc, x + m, y + (hCab - brasaoTam) / 2 - 1, brasaoTam);

  // Títulos do órgão
  const xTitulo = x + m + brasaoTam + 6;
  const larguraTitulo = L - (xTitulo - x) - m;
  Desenho.textoAjustado(doc, `${orgao.prefeitura} ${orgao.municipio} - ${orgao.uf}`, {
    x: xTitulo,
    y: y + hCab / 2 - 8.5,
    largura: larguraTitulo,
    fonte: fontes.negrito,
    tamanho: tamanhos.orgao,
    cor: cores.branco,
    tamanhoMin: 4
  });
  Desenho.texto(doc, orgao.setor, {
    x: xTitulo,
    y: y + hCab / 2 + 0.5,
    largura: larguraTitulo,
    fonte: fontes.regular,
    tamanho: tamanhos.setor,
    cor: '#DCE8F9',
    espacamento: 0.9
  });

  // Foto
  const fotoX = x + m;
  const fotoY = y + hCab + 7;
  Desenho.foto(doc, {
    arquivo: path.join(CAMINHOS.raiz, f.foto),
    nome: f.nome,
    x: fotoX,
    y: fotoY,
    largura: medidas.foto.largura,
    altura: medidas.foto.altura,
    raio: 2.4
  });

  // Coluna de dados
  const colX = fotoX + medidas.foto.largura + 8;
  const colL = L - (colX - x) - m;
  let cursor = fotoY;

  // Nome (permite duas linhas)
  Desenho.texto(doc, 'NOME COMPLETO', {
    x: colX,
    y: cursor,
    largura: colL,
    fonte: fontes.negrito,
    tamanho: tamanhos.rotulo,
    cor: cores.rotulo,
    espacamento: 0.35
  });
  // O nome se ajusta à largura: nunca invade o campo seguinte.
  Desenho.textoAjustado(doc, f.nome, {
    x: colX,
    y: cursor + tamanhos.rotulo * 1.3,
    largura: colL,
    fonte: fontes.negrito,
    tamanho: tamanhos.nome,
    cor: cores.azulEscuro,
    tamanhoMin: 6.5
  });
  cursor += tamanhos.rotulo * 1.3 + tamanhos.nome * 1.2 + 6;

  // Cargo/função
  cursor += Desenho.campo(doc, {
    rotulo: 'Cargo/Função',
    valor: f.cargo,
    x: colX,
    y: cursor,
    largura: colL,
    tema
  }) + 5;

  // Matrícula e vínculo lado a lado
  const meia = (colL - 8) / 2;
  Desenho.campo(doc, { rotulo: 'Matrícula', valor: f.matricula, x: colX, y: cursor, largura: meia, tema });
  cursor += Desenho.campo(doc, {
    rotulo: 'Vínculo',
    valor: f.vinculo,
    x: colX + meia + 8,
    y: cursor,
    largura: meia,
    tema
  }) + 5;

  // CPF
  Desenho.campo(doc, {
    rotulo: 'CPF',
    valor: Format.mascararCPF(f.cpf, credencial.mascararCPF !== false),
    x: colX,
    y: cursor,
    largura: colL,
    tema
  });

  // Faixa inferior
  const hFaixa = medidas.faixaInferior;
  const faixaY = y + A - hFaixa;
  doc.rect(x - s, faixaY, L + 2 * s, hFaixa + s).fill(cores.azulTenue);
  Desenho.linha(doc, x - s, faixaY, x + L + s, faixaY, '#C9D8EE', 0.5);

  // Título à esquerda e registro à direita, na mesma linha da faixa.
  Desenho.texto(doc, credencial.tituloCartao || 'CREDENCIAL FUNCIONAL', {
    x: x + m,
    y: faixaY + hFaixa / 2 - tamanhos.faixa * 0.72,
    largura: L / 2,
    fonte: fontes.negrito,
    tamanho: tamanhos.faixa,
    cor: cores.azul,
    espacamento: 0.6
  });
  Desenho.texto(doc, `REGISTRO Nº ${f.id}`, {
    x: x + L / 2,
    y: faixaY + hFaixa / 2 - (tamanhos.micro + 0.4) * 0.72,
    largura: L / 2 - m,
    fonte: fontes.negrito,
    tamanho: tamanhos.micro + 0.4,
    cor: cores.azulEscuro,
    alinhamento: 'right',
    espacamento: 0.3
  });
}

/* ===================================================================== *
 * Verso
 * ===================================================================== */

/**
 * Desenha o verso do crachá.
 * @param {PDFDocument} doc
 * @param {object} f
 * @param {object} tema
 * @param {{x: number, y: number, sangria: number, qrcode: string, url: string}} pos
 */
function desenharVerso(doc, f, tema, pos) {
  const { cores, fontes, tamanhos, orgao, medidas } = tema;
  const { x, y, qrcode, url } = pos;
  const s = pos.sangria || 0;
  const L = medidas.largura;
  const A = medidas.altura;
  const m = medidas.margem;

  doc.rect(x - s, y - s, L + 2 * s, A + 2 * s).fill(cores.branco);

  // Cabeçalho compacto
  const hCab = medidas.cabecalhoVerso;
  doc.rect(x - s, y - s, L + 2 * s, hCab + s).fill(cores.azul);
  Desenho.texto(doc, `${orgao.setor}  ·  CREDENCIAL FUNCIONAL`, {
    x: x + m,
    y: y + hCab / 2 - tamanhos.setor * 0.72,
    largura: L - 2 * m,
    fonte: fontes.negrito,
    tamanho: tamanhos.setor,
    cor: cores.branco,
    alinhamento: 'center',
    espacamento: 0.7
  });
  Desenho.faixaTricolor(doc, x - s, y + hCab - 1.2, L + 2 * s, 1.2);

  // QR Code
  const qrTam = medidas.qrcode;
  const qrX = x + m;
  const qrY = y + hCab + 7;
  doc.roundedRect(qrX - 2.5, qrY - 2.5, qrTam + 5, qrTam + 5, 2.5).fill(cores.branco);
  doc.lineWidth(0.5).roundedRect(qrX - 2.5, qrY - 2.5, qrTam + 5, qrTam + 5, 2.5).stroke('#C9D8EE');
  if (qrcode && fs.existsSync(qrcode)) {
    doc.image(qrcode, qrX, qrY, { width: qrTam, height: qrTam });
  }
  Desenho.texto(doc, 'Aponte a câmera do celular', {
    x: qrX - 2.5,
    y: qrY + qrTam + 4.5,
    largura: qrTam + 5,
    fonte: fontes.regular,
    tamanho: tamanhos.micro,
    cor: cores.rotulo,
    alinhamento: 'center'
  });
  Desenho.texto(doc, 'para validar a credencial', {
    x: qrX - 2.5,
    y: qrY + qrTam + 9,
    largura: qrTam + 5,
    fonte: fontes.regular,
    tamanho: tamanhos.micro,
    cor: cores.rotulo,
    alinhamento: 'center'
  });

  // Coluna de dados
  const colX = qrX + qrTam + 9;
  const colL = L - (colX - x) - m;
  let cursor = y + hCab + 7;

  cursor += Desenho.campo(doc, { rotulo: 'Vínculo', valor: f.vinculo, x: colX, y: cursor, largura: colL, tema }) + 4;
  Desenho.campo(doc, {
    rotulo: 'Endereço',
    valor: f.endereco,
    x: colX,
    y: cursor,
    largura: colL,
    tema,
    linhas: 3
  });

  // Rodapé institucional
  const hRod = medidas.rodapeVerso;
  const rodY = y + A - hRod;
  doc.rect(x - s, rodY, L + 2 * s, hRod + s).fill('#F4F8FE');
  Desenho.linha(doc, x - s, rodY, x + L + s, rodY, '#C9D8EE', 0.5);

  Desenho.texto(doc, orgao.rodape1, {
    x: x + m,
    y: rodY + 4,
    largura: L - 2 * m,
    fonte: fontes.negrito,
    tamanho: tamanhos.rodape,
    cor: cores.textoSuave,
    alinhamento: 'center'
  });
  Desenho.texto(doc, orgao.rodape2, {
    x: x + m,
    y: rodY + 9.6,
    largura: L - 2 * m,
    fonte: fontes.regular,
    tamanho: tamanhos.rodape,
    cor: cores.textoSuave,
    alinhamento: 'center'
  });
  Desenho.texto(doc, url, {
    x: x + m,
    y: rodY + 15.4,
    largura: L - 2 * m,
    fonte: fontes.regular,
    tamanho: tamanhos.micro,
    cor: cores.rotulo,
    alinhamento: 'center'
  });
}

/* ===================================================================== *
 * Documentos
 * ===================================================================== */

/**
 * Metadados padrão do PDF.
 * @param {object} config
 * @param {string} titulo
 * @returns {object}
 */
function metadados(config, titulo) {
  return {
    Title: titulo,
    Author: `${config.orgao.prefeitura} ${config.orgao.municipio}/${config.orgao.ufSigla}`,
    Subject: 'Credencial funcional - Vigilância Sanitária',
    Keywords: 'credencial, vigilância sanitária, crachá, CR80',
    Creator: 'credencial-vigilancia',
    Producer: 'PDFKit',
    CreationDate: new Date()
  };
}

/**
 * Cria um documento no tamanho do cartão + sangria.
 * @param {object} tema
 * @param {object} config
 * @param {string} titulo
 * @returns {PDFDocument}
 */
function novoDocumentoCartao(tema, config, titulo) {
  const s = tema.medidas.sangria;
  return new PDFDocument({
    size: [tema.medidas.largura + 2 * s, tema.medidas.altura + 2 * s],
    margin: 0,
    autoFirstPage: false,
    info: metadados(config, titulo)
  });
}

/**
 * Acrescenta as duas páginas (frente e verso) de um servidor.
 * @param {PDFDocument} doc
 * @param {object} f
 * @param {object} tema
 * @param {string} qrcode caminho do PNG
 * @param {string} url
 */
function paginasDoCartao(doc, f, tema, qrcode, url) {
  const s = tema.medidas.sangria;
  const L = tema.medidas.largura;
  const A = tema.medidas.altura;

  doc.addPage();
  desenharFrente(doc, f, tema, { x: s, y: s, sangria: s });
  if (tema.marcasDeCorte) Desenho.marcasDeCorte(doc, { x: s, y: s, largura: L, altura: A, sangria: s });

  doc.addPage();
  desenharVerso(doc, f, tema, { x: s, y: s, sangria: s, qrcode, url });
  if (tema.marcasDeCorte) Desenho.marcasDeCorte(doc, { x: s, y: s, largura: L, altura: A, sangria: s });
}

/**
 * Finaliza o documento e resolve quando o arquivo estiver no disco.
 * @param {PDFDocument} doc
 * @param {string} arquivo
 * @returns {Promise<string>}
 */
function finalizar(doc, arquivo) {
  garantirPasta(path.dirname(arquivo));
  return new Promise((resolve, reject) => {
    const fluxo = fs.createWriteStream(arquivo);
    fluxo.on('finish', () => resolve(arquivo));
    fluxo.on('error', reject);
    doc.pipe(fluxo);
    doc.end();
  });
}

const Pdf = {
  montarTema,

  /**
   * PDF individual (2 páginas: frente e verso).
   * @param {object} f
   * @param {object} opcoes {tema, config, qrcode, url}
   * @returns {Promise<string>} caminho do arquivo
   */
  async gerarCartao(f, { tema, config, qrcode, url }) {
    const doc = novoDocumentoCartao(tema, config, `Credencial ${f.id} - ${f.nome}`);
    paginasDoCartao(doc, f, tema, qrcode, url);
    return finalizar(doc, path.join(CAMINHOS.pdf, `${f.id}.pdf`));
  },

  /**
   * PDF único com todos os crachás em sequência (frente/verso).
   * @param {object[]} funcionarios
   * @param {object} opcoes {tema, config, qrcodes: Map, urls: Map}
   * @returns {Promise<string>}
   */
  async gerarLote(funcionarios, { tema, config, qrcodes, urls }) {
    const doc = novoDocumentoCartao(tema, config, 'Credenciais - Vigilância Sanitária (lote)');
    for (const f of funcionarios) {
      paginasDoCartao(doc, f, tema, qrcodes.get(f.id), urls.get(f.id));
    }
    return finalizar(doc, path.join(CAMINHOS.pdf, '_todos-os-crachas.pdf'));
  },

  /**
   * Folha A4 de impressão com vários cartões por página.
   * Página ímpar = frentes; página par = versos com as colunas invertidas
   * (para impressão frente e verso com virada pela borda longa).
   * @param {object[]} funcionarios
   * @param {object} opcoes {tema, config, template, qrcodes, urls}
   * @returns {Promise<string>}
   */
  async gerarFolhaA4(funcionarios, { tema, config, template, qrcodes, urls }) {
    const L = tema.medidas.largura;
    const A = tema.medidas.altura;
    const colunas = template.folhaA4.colunas;
    const linhas = template.folhaA4.linhas;
    const gapX = mm(template.folhaA4.espacoHorizontalMM);
    const gapY = mm(template.folhaA4.espacoVerticalMM);
    const porFolha = colunas * linhas;

    const larguraGrade = colunas * L + (colunas - 1) * gapX;
    const alturaGrade = linhas * A + (linhas - 1) * gapY;
    const A4 = [595.28, 841.89];
    const offsetX = (A4[0] - larguraGrade) / 2;
    const offsetY = (A4[1] - alturaGrade) / 2;

    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      autoFirstPage: false,
      info: metadados(config, 'Folha A4 de impressão - Credenciais')
    });

    /**
     * Desenha um lado (frente/verso) de um grupo de até `porFolha` servidores.
     * @param {object[]} grupo
     * @param {'frente'|'verso'} lado
     */
    const desenharFolha = (grupo, lado) => {
      doc.addPage();
      Desenho.texto(doc, `Credenciais CR80 · ${lado === 'frente' ? 'FRENTE' : 'VERSO'} · corte nas marcas`, {
        x: offsetX,
        y: offsetY - 16,
        largura: larguraGrade,
        fonte: 'Helvetica',
        tamanho: 7,
        cor: '#6B7280',
        alinhamento: 'center'
      });

      grupo.forEach((f, indice) => {
        const linha = Math.floor(indice / colunas);
        let coluna = indice % colunas;
        // Inverte as colunas no verso para casar na impressão duplex.
        if (lado === 'verso') coluna = colunas - 1 - coluna;

        const x = offsetX + coluna * (L + gapX);
        const y = offsetY + linha * (A + gapY);

        if (lado === 'frente') desenharFrente(doc, f, tema, { x, y, sangria: 0 });
        else desenharVerso(doc, f, tema, { x, y, sangria: 0, qrcode: qrcodes.get(f.id), url: urls.get(f.id) });

        Desenho.marcasDeCorte(doc, { x, y, largura: L, altura: A, sangria: Math.min(gapX, gapY) || mm(3) });
      });
    };

    for (let i = 0; i < funcionarios.length; i += porFolha) {
      const grupo = funcionarios.slice(i, i + porFolha);
      desenharFolha(grupo, 'frente');
      desenharFolha(grupo, 'verso');
    }

    return finalizar(doc, path.join(CAMINHOS.pdf, '_folha-impressao-A4.pdf'));
  },

  /**
   * Confere se uma imagem atinge a resolução mínima no tamanho impresso.
   * @param {string} arquivo
   * @param {number} larguraPt largura ocupada no PDF, em pontos
   * @param {number} [dpiAlvo=300]
   * @returns {{ok: boolean, dpi: number}|null}
   */
  conferirResolucao(arquivo, larguraPt, dpiAlvo = 300) {
    if (!arquivo || !fs.existsSync(arquivo)) return null;
    try {
      const doc = new PDFDocument({ autoFirstPage: false });
      const imagem = doc.openImage(arquivo);
      const dpi = Math.round((imagem.width / larguraPt) * 72);
      return { ok: dpi >= dpiAlvo, dpi };
    } catch (erro) {
      return null;
    }
  }
};

module.exports = Pdf;
