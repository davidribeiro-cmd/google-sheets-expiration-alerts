/**
 * @fileoverview Limpeza dos itens vencidos.
 *
 * Gatilho sugerido: baseado no tempo (diário).
 */

/** Motivo registrado no histórico para cada item removido. */
const MOTIVO_REMOCAO = "Remoção automática - vencido há 1 dia ou mais";

/**
 * Move para o HISTORICO_EXCLUIDOS todos os itens do PAINEL vencidos há
 * 1 dia ou mais (coluna M), registrando data, hora e motivo da remoção.
 */
function moverItensVencidosAutomaticamente() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const abaPainel = planilha.getSheetByName(ABA.PAINEL);
  const abaHistorico = planilha.getSheetByName(ABA.HISTORICO);

  if (!abaPainel || !abaHistorico) {
    console.error(`Abas ${ABA.PAINEL} e ${ABA.HISTORICO} são obrigatórias.`);
    return;
  }

  const totalLinhas = abaPainel.getLastRow() - PRIMEIRA_LINHA_DADOS + 1;
  if (totalLinhas < 1) return;

  const dados = abaPainel
    .getRange(PRIMEIRA_LINHA_DADOS, 1, totalLinhas, TOTAL_COLUNAS)
    .getValues();

  let removidos = 0;

  // De baixo para cima: apagar uma linha não muda a posição das que faltam.
  for (let i = dados.length - 1; i >= 0; i--) {
    if (!estaVencido(dados[i][COLUNA.DIAS_VENCIDO - 1])) continue;

    const linha = PRIMEIRA_LINHA_DADOS + i;
    const registro = abaPainel.getRange(linha, 1, 1, TOTAL_COLUNAS).getValues()[0];
    const agora = new Date();

    abaHistorico.appendRow([
      ...registro,
      Utilities.formatDate(agora, FUSO_HORARIO, "dd/MM/yyyy"),
      Utilities.formatDate(agora, FUSO_HORARIO, "HH:mm:ss"),
      MOTIVO_REMOCAO
    ]);

    abaPainel.deleteRow(linha);
    removidos++;
  }

  if (removidos > 0) {
    recriarLinhaVazia(abaPainel);
  }

  console.log(`${removidos} item(ns) movido(s) para o histórico.`);
}

/**
 * Indica se o item está vencido há 1 dia ou mais.
 *
 * @param {*} diasVencido Valor da coluna M (dias desde o vencimento).
 * @returns {boolean}
 */
function estaVencido(diasVencido) {
  return !isNaN(diasVencido) && Number(diasVencido) >= 1;
}

/**
 * Adiciona uma linha no fim do PAINEL copiando apenas a formatação da linha
 * modelo (sem fórmulas e sem valores), para repor a linha removida.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} abaPainel Aba PAINEL.
 */
function recriarLinhaVazia(abaPainel) {
  abaPainel.insertRowAfter(abaPainel.getMaxRows());

  const novaLinha = abaPainel.getMaxRows();

  abaPainel
    .getRange(LINHA_MODELO, 1, 1, TOTAL_COLUNAS)
    .copyTo(
      abaPainel.getRange(novaLinha, 1, 1, TOTAL_COLUNAS),
      SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
      false
    );
}
