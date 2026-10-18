// =========================================
// ORGANIZADOR DO PAINEL
// =========================================
// Ordena os itens do PAINEL pela data de
// validade (coluna H), do mais próximo de
// vencer para o mais distante.

function organizarPainel() {

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(ABA_PAINEL);
  const ultimaLinha = aba.getLastRow();

  // Linha 1 = cabeçalho
  // Linha 2 = fórmulas ocultas
  // Linha 3 = início dos dados

  if (ultimaLinha < 3) return;

  aba
    .getRange(
      3,                // começa na linha 3
      1,                // coluna A
      ultimaLinha - 2,  // quantidade de linhas com dados
      14                // até a coluna N
    )
    .sort([
      { column: 8, ascending: true }
    ]);

}
