// =========================================
// FORMS AUTOMÁTICO
// =========================================
// Gatilho: "Ao enviar formulário" (da planilha).
// Grava cada resposta do Google Forms na
// primeira linha livre do PAINEL. As demais
// colunas (seção, EAN, produto, prazo...) são
// preenchidas pelas fórmulas da planilha a
// partir da BASE_PRODUTOS.

function onFormSubmit(e) {

  if (!e || !e.values) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaPainel = ss.getSheetByName(ABA_PAINEL);

  if (!abaPainel) return;

  // =========================================
  // RESPOSTAS DO FORMULÁRIO
  // =========================================

  const dados = e.values;

  const codigo = dados[2];
  const quantidade = dados[4];
  const validade = dados[5];
  const local = dados[6];
  const setor = dados[7];
  const colaborador = dados[8];

  if (!codigo || !validade || !setor) return;

  const idUnico = Utilities.getUuid();

  // =========================================
  // PRIMEIRA LINHA LIVRE
  // =========================================
  // Linha 1 = cabeçalho
  // Linha 2 = fórmulas ocultas
  // Linha 3 = primeiro dado

  let linha = 3;

  while (abaPainel.getRange(linha, 4).getValue() !== "") {
    linha++;
  }

  // =========================================
  // GRAVAÇÃO NO PAINEL
  // =========================================

  abaPainel.getRange(linha, 1).setValue(CODIGO_LOJA);         // A
  abaPainel.getRange(linha, 4).setValue(codigo);              // D
  abaPainel.getRange(linha, 7).setValue(Number(quantidade));  // G
  abaPainel.getRange(linha, 8).setValue(converterData(validade)); // H
  abaPainel.getRange(linha, 9).setValue(local);               // I
  abaPainel.getRange(linha, 10).setValue(setor);              // J
  abaPainel.getRange(linha, 11).setValue(colaborador);        // K
  abaPainel.getRange(linha, 14).setValue(idUnico);            // N

}

// =========================================
// CONVERSÃO DA DATA
// =========================================
// O Forms pode entregar a data como Date ou
// como texto no formato dd/MM/yyyy.

function converterData(validade) {

  if (validade instanceof Date) return validade;

  const partes = validade.toString().split("/");

  return new Date(
    Number(partes[2]),
    Number(partes[1]) - 1,
    Number(partes[0])
  );

}
