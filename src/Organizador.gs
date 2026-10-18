/**
 * @fileoverview Organização do PAINEL.
 *
 * Gatilho sugerido: baseado no tempo (ex.: a cada hora).
 */

/**
 * Ordena os itens do PAINEL pela data de validade, do mais próximo de
 * vencer para o mais distante.
 */
function organizarPainel() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA.PAINEL);
  if (!aba) {
    console.error(`Aba ${ABA.PAINEL} não encontrada.`);
    return;
  }

  const totalLinhas = aba.getLastRow() - PRIMEIRA_LINHA_DADOS + 1;
  if (totalLinhas < 1) return;

  aba
    .getRange(PRIMEIRA_LINHA_DADOS, 1, totalLinhas, TOTAL_COLUNAS)
    .sort([{ column: COLUNA.VALIDADE, ascending: true }]);
}
