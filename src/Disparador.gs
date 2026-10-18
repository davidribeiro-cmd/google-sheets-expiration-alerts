// =========================================
// DISPARADOR DE E-MAIL AUTOMÁTICO
// =========================================
// Gatilho: por tempo (ex.: todos os dias).
// Lê o PAINEL, agrupa os itens por setor e envia
// para o responsável de cada setor (aba
// CONFIG_EMAILS) um e-mail com os itens críticos
// no corpo e o relatório completo do setor em PDF
// anexo. Cada aviso é enviado uma única vez.

function verificarValidadesEEnviarEmail() {

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const abaPainel = planilha.getSheetByName(ABA_PAINEL);
  const abaConfig = planilha.getSheetByName(ABA_CONFIG_EMAILS);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const ultimaLinha = Math.min(abaPainel.getLastRow(), 10000);

  // =========================================
  // LEITURA OTIMIZADA
  // =========================================
  // Lê o PAINEL inteiro de uma vez, em vez de
  // célula por célula.

  const dadosPainel = abaPainel.getDataRange().getValues();

  const propriedades = PropertiesService.getScriptProperties();

  const mapaEmails = lerEmailsPorSetor(abaConfig);

  // =========================================
  // AGRUPAMENTO POR SETOR
  // =========================================

  const agrupadoPorSetor = {};          // itens críticos (corpo do e-mail)
  const relatorioCompletoPorSetor = {}; // todos os itens (PDF)

  for (let linha = 3; linha <= ultimaLinha; linha++) {

    const dadosLinha = dadosPainel[linha - 1];

    const validade = dadosLinha[7]; // H

    if (!(validade instanceof Date)) continue;

    validade.setHours(0, 0, 0, 0);

    const diasRestantes = Math.ceil(
      (validade - hoje) / (1000 * 60 * 60 * 24)
    );

    // Trava anti-envio duplicado: uma chave por
    // linha e tipo de aviso.
    const chaveEnvio = "linha_" + linha + "_aviso_" + diasRestantes;

    if (propriedades.getProperty(chaveEnvio)) continue;

    const codigo = dadosLinha[3];       // D
    const ean = dadosLinha[4];          // E
    const produto = dadosLinha[5];      // F
    const qtd = dadosLinha[6];          // G
    const local = dadosLinha[8];        // I
    const setor = dadosLinha[9];        // J
    const colaborador = dadosLinha[10]; // K

    if (!setor) continue;

    const validadeBR = Utilities.formatDate(validade, FUSO_HORARIO, "dd/MM/yyyy");

    // -----------------------------------------
    // Todos os itens vão para o relatório em PDF
    // -----------------------------------------

    if (!relatorioCompletoPorSetor[setor]) {
      relatorioCompletoPorSetor[setor] = [];
    }

    relatorioCompletoPorSetor[setor].push({
      codigo: codigo,
      produto: produto,
      qtd: qtd,
      validade: validadeBR,
      validadeOriginal: validade,
      local: local
    });

    // -----------------------------------------
    // Só os itens em 0, 3, 7 ou 30 dias vão
    // para o corpo do e-mail
    // -----------------------------------------

    if (!DIAS_AVISO.includes(diasRestantes)) continue;

    if (!agrupadoPorSetor[setor]) {
      agrupadoPorSetor[setor] = [];
    }

    agrupadoPorSetor[setor].push({
      linha: linha,
      chave: chaveEnvio,
      codigo: codigo,
      produto: produto,
      ean: ean,
      setor: setor,
      local: local,
      colaborador: colaborador,
      qtd: qtd,
      validade: validadeBR,
      diasRestantes: diasRestantes,
      status: textoStatus(diasRestantes)
    });

  }

  // =========================================
  // ENVIO POR SETOR
  // =========================================

  for (let setor in agrupadoPorSetor) {

    const itens = agrupadoPorSetor[setor];
    const destinatarios = mapaEmails[setor.toString().trim()];

    if (!destinatarios) continue;

    // Mais urgente primeiro
    itens.sort(function (a, b) {
      return a.diasRestantes - b.diasRestantes;
    });

    const corpoEmail = montarCorpoEmail(itens);

    const pdfBlob = gerarRelatorioPDF(setor, relatorioCompletoPorSetor[setor]);

    MailApp.sendEmail({
      to: destinatarios,
      subject: "🚨 Relatório Preventivo de Validades | " + setor,
      htmlBody: corpoEmail,
      attachments: [pdfBlob]
    });

    // Marca como enviado
    itens.forEach(function (item) {
      propriedades.setProperty(item.chave, "enviado");
    });

  }

}

// =========================================
// STATUS DE CADA AVISO
// =========================================
// Texto mostrado na coluna STATUS do e-mail.
// Se um novo prazo for incluído em DIAS_AVISO
// (Config.gs), ele usa o texto padrão.

function textoStatus(diasRestantes) {

  const textos = {
    0: "🔴 VENCE HOJE",
    3: "🟠 Vence em 3 dias",
    7: "🟡 Vence em 7 dias",
    30: "🔵 Vence em 30 dias"
  };

  return textos[diasRestantes] || "Vence em " + diasRestantes + " dias";

}

// =========================================
// E-MAILS DOS SETORES
// =========================================
// Aba CONFIG_EMAILS: coluna A = setor,
// coluna B = e-mail(s) do responsável.
// Para mais de um e-mail, separe por vírgula.

function lerEmailsPorSetor(abaConfig) {

  const dadosConfig = abaConfig
    .getRange(2, 1, abaConfig.getLastRow() - 1, 2)
    .getValues();

  const mapaEmails = {};

  dadosConfig.forEach(function (linha) {

    const setor = linha[0];
    const emails = linha[1];

    if (setor && emails) {
      mapaEmails[setor.toString().trim()] = emails.toString().trim();
    }

  });

  return mapaEmails;

}

// =========================================
// LIMPAR CONTROLE DE ENVIOS
// =========================================
// Executar manualmente para apagar o registro de
// avisos já enviados (útil em testes). Depois
// disso, os alertas podem ser enviados de novo.

function limparControleEnvios() {

  PropertiesService
    .getScriptProperties()
    .deleteAllProperties();

}
