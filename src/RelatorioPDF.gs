/**
 * @fileoverview Geração do relatório completo do setor em PDF.
 *
 * O relatório é montado numa aba temporária, exportado como PDF e anexado ao
 * e-mail. A aba temporária é sempre apagada, mesmo se a exportação falhar.
 */

/** Colunas do relatório: título e largura em pixels. */
const COLUNAS_RELATORIO = Object.freeze([
  { titulo: "CÓDIGO", largura: 90 },
  { titulo: "PRODUTO", largura: 350 },
  { titulo: "QTD", largura: 70 },
  { titulo: "VALIDADE", largura: 100 },
  { titulo: "LOCAL", largura: 140 }
]);

/** Parâmetros da exportação de PDF do Google Sheets. */
const PARAMETROS_PDF = Object.freeze({
  format: "pdf",
  portrait: "true",
  fitw: "true",
  sheetnames: "false",
  printtitle: "false",
  pagenumbers: "false",
  gridlines: "false",
  fzr: "false"
});

/**
 * Gera o relatório completo de um setor em PDF.
 *
 * @param {string} setor Nome do setor.
 * @param {ItemRelatorio[]} itensDoSetor Todos os itens do setor.
 * @returns {GoogleAppsScript.Base.Blob} Arquivo PDF.
 */
function gerarRelatorioPDF(setor, itensDoSetor) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  const itens = [...(itensDoSetor || [])].sort(
    (a, b) => new Date(a.validadeOriginal) - new Date(b.validadeOriginal)
  );

  const abaTemp = planilha.insertSheet(`TEMP_PDF_${Date.now()}`);

  try {
    preencherAbaRelatorio(abaTemp, setor, itens);

    // Garante que a aba terminou de ser montada antes de exportar.
    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    return exportarAbaComoPDF(planilha, abaTemp).setName(`RELATORIO_${setor}.pdf`);
  } finally {
    SpreadsheetApp.flush();
    Utilities.sleep(1000);
    planilha.deleteSheet(abaTemp);
  }
}

/**
 * Monta o título, o cabeçalho e a tabela do relatório na aba temporária.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} aba Aba temporária.
 * @param {string} setor Nome do setor.
 * @param {ItemRelatorio[]} itens Itens já ordenados por validade.
 */
function preencherAbaRelatorio(aba, setor, itens) {
  const totalColunas = COLUNAS_RELATORIO.length;

  // Título
  aba.getRange(1, 1, 1, totalColunas).merge();
  aba
    .getRange("A1")
    .setValue(`RELATÓRIO COMPLETO DO SETOR - ${setor}`)
    .setFontSize(18)
    .setFontWeight("bold")
    .setBackground(COR_PRINCIPAL)
    .setFontColor("white")
    .setHorizontalAlignment("center");
  aba.setRowHeight(1, 35);

  // Cabeçalho da tabela
  aba
    .getRange(3, 1, 1, totalColunas)
    .setValues([COLUNAS_RELATORIO.map((coluna) => coluna.titulo)])
    .setBackground(COR_PRINCIPAL)
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  // Dados
  const linhas = itens.map((item) => [item.codigo, item.produto, item.qtd, item.validade, item.local]);

  if (linhas.length > 0) {
    aba.getRange(4, 1, linhas.length, totalColunas).setValues(linhas);
  }

  // Largura das colunas e bordas
  COLUNAS_RELATORIO.forEach((coluna, i) => aba.setColumnWidth(i + 1, coluna.largura));

  aba
    .getRange(3, 1, linhas.length + 1, totalColunas)
    .setBorder(true, true, true, true, true, true);
}

/**
 * Exporta uma aba como PDF pelo link de exportação do Google Sheets,
 * autenticado com o token do próprio script.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} planilha Planilha.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} aba Aba a exportar.
 * @returns {GoogleAppsScript.Base.Blob} Arquivo PDF.
 */
function exportarAbaComoPDF(planilha, aba) {
  const parametros = Object.entries({ ...PARAMETROS_PDF, gid: aba.getSheetId() })
    .map(([chave, valor]) => `${chave}=${valor}`)
    .join("&");

  const url = `https://docs.google.com/spreadsheets/d/${planilha.getId()}/export?${parametros}`;

  const resposta = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: true
  });

  if (resposta.getResponseCode() !== 200) {
    console.warn(`Exportação do PDF retornou HTTP ${resposta.getResponseCode()}.`);
  }

  return resposta.getBlob();
}
