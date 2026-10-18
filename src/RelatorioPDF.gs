// =========================================
// RELATÓRIO COMPLETO DO SETOR EM PDF
// =========================================
// Cria uma aba temporária com todos os itens do
// setor ordenados por validade, exporta essa aba
// como PDF e devolve o arquivo pronto para anexar
// no e-mail. A aba temporária é apagada sempre,
// mesmo se a exportação der erro.

function gerarRelatorioPDF(setor, itensDoSetor) {

  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  // Mais próximo de vencer primeiro
  const itens = (itensDoSetor || []).slice().sort(function (a, b) {
    return new Date(a.validadeOriginal) - new Date(b.validadeOriginal);
  });

  const abaTemp = planilha.insertSheet("TEMP_PDF_" + new Date().getTime());

  try {

    preencherAbaRelatorio(abaTemp, setor, itens);

    // Garante que a aba terminou de ser montada
    // antes de exportar
    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    return exportarAbaComoPDF(planilha, abaTemp)
      .setName("RELATORIO_" + setor + ".pdf");

  } finally {

    SpreadsheetApp.flush();
    Utilities.sleep(1000);
    planilha.deleteSheet(abaTemp);

  }

}

// =========================================
// MONTAGEM DA ABA TEMPORÁRIA
// =========================================

function preencherAbaRelatorio(aba, setor, itens) {

  // Título
  aba.getRange("A1:E1").merge();

  aba.getRange("A1")
    .setValue("RELATÓRIO COMPLETO DO SETOR - " + setor)
    .setFontSize(18)
    .setFontWeight("bold")
    .setBackground(COR_PRINCIPAL)
    .setFontColor("white")
    .setHorizontalAlignment("center");

  aba.setRowHeight(1, 35);

  // Cabeçalho da tabela
  aba.getRange(3, 1, 1, 5)
    .setValues([["CÓDIGO", "PRODUTO", "QTD", "VALIDADE", "LOCAL"]])
    .setBackground(COR_PRINCIPAL)
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  // Dados
  const linhas = itens.map(function (item) {
    return [item.codigo, item.produto, item.qtd, item.validade, item.local];
  });

  if (linhas.length > 0) {
    aba.getRange(4, 1, linhas.length, 5).setValues(linhas);
  }

  // Largura das colunas
  aba.setColumnWidth(1, 90);   // Código
  aba.setColumnWidth(2, 350);  // Produto
  aba.setColumnWidth(3, 70);   // QTD
  aba.setColumnWidth(4, 100);  // Validade
  aba.setColumnWidth(5, 140);  // Local

  // Bordas em toda a tabela
  aba.getRange(3, 1, linhas.length + 1, 5)
    .setBorder(true, true, true, true, true, true);

}

// =========================================
// EXPORTAÇÃO DA ABA EM PDF
// =========================================
// Usa o link de exportação do Google Sheets,
// autenticado com o token do próprio script.

function exportarAbaComoPDF(planilha, aba) {

  const url =
    "https://docs.google.com/spreadsheets/d/" + planilha.getId() + "/export?" +
    "format=pdf" +
    "&portrait=true" +
    "&fitw=true" +
    "&sheetnames=false" +
    "&printtitle=false" +
    "&pagenumbers=false" +
    "&gridlines=false" +
    "&fzr=false" +
    "&gid=" + aba.getSheetId();

  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });

  return response.getBlob();

}
