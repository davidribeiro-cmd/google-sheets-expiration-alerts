/**
 * @fileoverview Entrada de dados pelo Google Forms.
 *
 * Gatilho: "Da planilha → Ao enviar formulário".
 * Grava cada resposta na primeira linha livre do PAINEL. As demais colunas
 * (seção, EAN, produto, custo, prazo) são preenchidas pelas fórmulas da
 * planilha a partir da BASE_PRODUTOS.
 */

/** Posição de cada pergunta em `e.values` (0 = carimbo de data/hora). */
const RESPOSTA = Object.freeze({
  CODIGO: 2,
  QUANTIDADE: 4,
  VALIDADE: 5,
  LOCAL: 6,
  SETOR: 7,
  COLABORADOR: 8
});

/**
 * Grava uma nova resposta do formulário no PAINEL.
 *
 * @param {GoogleAppsScript.Events.SheetsOnFormSubmit} e Evento do envio do formulário.
 */
function onFormSubmit(e) {
  if (!e || !e.values) return;

  const abaPainel = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA.PAINEL);
  if (!abaPainel) {
    console.error(`Aba ${ABA.PAINEL} não encontrada.`);
    return;
  }

  const respostas = e.values;
  const codigo = respostas[RESPOSTA.CODIGO];
  const validade = respostas[RESPOSTA.VALIDADE];
  const setor = respostas[RESPOSTA.SETOR];

  if (!codigo || !validade || !setor) return;

  const linha = encontrarPrimeiraLinhaLivre(abaPainel);

  const valores = {
    [COLUNA.LOJA]: CODIGO_LOJA,
    [COLUNA.CODIGO]: codigo,
    [COLUNA.QUANTIDADE]: Number(respostas[RESPOSTA.QUANTIDADE]),
    [COLUNA.VALIDADE]: converterData(validade),
    [COLUNA.LOCAL]: respostas[RESPOSTA.LOCAL],
    [COLUNA.SETOR]: setor,
    [COLUNA.COLABORADOR]: respostas[RESPOSTA.COLABORADOR],
    [COLUNA.ID]: Utilities.getUuid()
  };

  // Grava célula a célula para não sobrescrever as fórmulas das outras colunas.
  Object.keys(valores).forEach((coluna) => {
    abaPainel.getRange(linha, Number(coluna)).setValue(valores[coluna]);
  });
}

/**
 * Encontra a primeira linha do PAINEL com a coluna de código vazia.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} abaPainel Aba PAINEL.
 * @returns {number} Número da linha livre.
 */
function encontrarPrimeiraLinhaLivre(abaPainel) {
  const totalLinhas = abaPainel.getMaxRows() - PRIMEIRA_LINHA_DADOS + 1;
  if (totalLinhas < 1) return PRIMEIRA_LINHA_DADOS;

  const codigos = abaPainel
    .getRange(PRIMEIRA_LINHA_DADOS, COLUNA.CODIGO, totalLinhas, 1)
    .getValues();

  const indiceLivre = codigos.findIndex(([codigo]) => codigo === "");

  return indiceLivre === -1
    ? abaPainel.getMaxRows() + 1
    : PRIMEIRA_LINHA_DADOS + indiceLivre;
}

/**
 * Converte a validade enviada pelo Forms em Date.
 * O Forms pode entregar a data como Date ou como texto "dd/MM/yyyy".
 *
 * @param {Date|string} validade Valor recebido do formulário.
 * @returns {Date} Data de validade.
 */
function converterData(validade) {
  if (validade instanceof Date) return validade;

  const [dia, mes, ano] = validade.toString().split("/").map(Number);
  return new Date(ano, mes - 1, dia);
}
