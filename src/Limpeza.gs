// =========================================
// LIMPEZA DE ITENS VENCIDOS
// =========================================
// Move para a aba HISTORICO_EXCLUIDOS todos os
// itens do PAINEL vencidos há 1 dia ou mais
// (coluna M, prazo >= 1), registrando data, hora
// e motivo da remoção.

function moverItensVencidosAutomaticamente() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaPainel = ss.getSheetByName(ABA_PAINEL);
  const abaHistorico = ss.getSheetByName(ABA_HISTORICO);

  if (!abaPainel || !abaHistorico) return;

  // Linha 1 = cabeçalho
  // Linha 2 = fórmulas ocultas
  // Linha 3 = primeiro dado

  const ultimaLinha = abaPainel.getLastRow();

  if (ultimaLinha < 3) return;

  // =========================================
  // LEITURA DOS DADOS
  // =========================================

  const dados = abaPainel
    .getRange(3, 1, ultimaLinha - 2, 14)
    .getValues();

  let removeuAlgum = false;

  // =========================================
  // PERCORRE DE BAIXO PARA CIMA
  // =========================================
  // Assim, apagar uma linha não muda a posição
  // das linhas que ainda serão verificadas.

  for (let i = dados.length - 1; i >= 0; i--) {

    const prazo = dados[i][12]; // coluna M

    if (isNaN(prazo) || Number(prazo) < 1) continue;

    const linhaOriginal = i + 3;

    const linhaCompleta = abaPainel
      .getRange(linhaOriginal, 1, 1, 14)
      .getValues()[0];

    // =========================================
    // DATA E HORA DA REMOÇÃO
    // =========================================

    const agora = new Date();

    linhaCompleta.push(Utilities.formatDate(agora, FUSO_HORARIO, "dd/MM/yyyy"));
    linhaCompleta.push(Utilities.formatDate(agora, FUSO_HORARIO, "HH:mm:ss"));
    linhaCompleta.push("Remoção automática - vencido há 1 dia ou mais");

    // =========================================
    // SALVA NO HISTÓRICO E REMOVE DO PAINEL
    // =========================================

    abaHistorico.appendRow(linhaCompleta);
    abaPainel.deleteRow(linhaOriginal);

    removeuAlgum = true;

  }

  // =========================================
  // RECRIA LINHA MODELO
  // =========================================
  // Adiciona uma linha nova no fim do PAINEL
  // copiando só a formatação da linha 2
  // (sem fórmulas e sem valores).

  if (removeuAlgum) {

    abaPainel.insertRowAfter(abaPainel.getMaxRows());

    const novaLinha = abaPainel.getMaxRows();

    abaPainel
      .getRange(2, 1, 1, 14)
      .copyTo(
        abaPainel.getRange(novaLinha, 1, 1, 14),
        SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
        false
      );

  }

}
