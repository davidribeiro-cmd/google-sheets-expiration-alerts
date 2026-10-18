/**
 * @fileoverview Disparo dos alertas de validade por e-mail.
 *
 * Gatilho sugerido: baseado no tempo (diário).
 * Lê o PAINEL, agrupa os itens por setor e envia ao responsável de cada setor
 * (aba CONFIG_EMAILS) um e-mail com os itens críticos no corpo e o relatório
 * completo do setor em PDF anexo. Cada aviso é enviado uma única vez.
 */

/** Milissegundos em um dia. */
const MS_POR_DIA = 1000 * 60 * 60 * 24;

/** Texto da coluna STATUS do e-mail para cada prazo de aviso. */
const TEXTO_STATUS = Object.freeze({
  0: "🔴 VENCE HOJE",
  3: "🟠 Vence em 3 dias",
  7: "🟡 Vence em 7 dias",
  30: "🔵 Vence em 30 dias"
});

/**
 * @typedef {Object} ItemRelatorio
 * @property {string} codigo
 * @property {string} produto
 * @property {number} qtd
 * @property {string} validade         Data formatada (dd/MM/yyyy).
 * @property {Date}   validadeOriginal Data usada na ordenação.
 * @property {string} local
 */

/**
 * @typedef {Object} ItemCritico
 * @property {number} linha
 * @property {string} chave         Chave do controle anti-envio duplicado.
 * @property {string} codigo
 * @property {string} produto
 * @property {string} ean
 * @property {string} setor
 * @property {string} local
 * @property {string} colaborador
 * @property {number} qtd
 * @property {string} validade      Data formatada (dd/MM/yyyy).
 * @property {number} diasRestantes
 * @property {string} status        Texto exibido na coluna STATUS.
 */

/**
 * Verifica as validades do PAINEL e envia os alertas de cada setor.
 */
function verificarValidadesEEnviarEmail() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const abaPainel = planilha.getSheetByName(ABA.PAINEL);
  const abaConfig = planilha.getSheetByName(ABA.CONFIG_EMAILS);

  if (!abaPainel || !abaConfig) {
    console.error(`Abas ${ABA.PAINEL} e ${ABA.CONFIG_EMAILS} são obrigatórias.`);
    return;
  }

  const propriedades = PropertiesService.getScriptProperties();
  const emailsPorSetor = lerEmailsPorSetor(abaConfig);
  const { criticosPorSetor, relatorioPorSetor } = agruparItensPorSetor(abaPainel, propriedades);

  let enviados = 0;

  Object.keys(criticosPorSetor).forEach((setor) => {
    const destinatarios = emailsPorSetor[setor.toString().trim()];

    if (!destinatarios) {
      console.warn(`Setor "${setor}" sem e-mail cadastrado em ${ABA.CONFIG_EMAILS}.`);
      return;
    }

    const itens = criticosPorSetor[setor].sort((a, b) => a.diasRestantes - b.diasRestantes);

    MailApp.sendEmail({
      to: destinatarios,
      subject: `🚨 Relatório Preventivo de Validades | ${setor}`,
      htmlBody: montarCorpoEmail(itens),
      attachments: [gerarRelatorioPDF(setor, relatorioPorSetor[setor])]
    });

    itens.forEach((item) => propriedades.setProperty(item.chave, "enviado"));
    enviados++;
  });

  console.log(`${enviados} e-mail(s) de alerta enviado(s).`);
}

/**
 * Lê o PAINEL e separa, por setor, os itens críticos (corpo do e-mail) e
 * todos os itens (relatório em PDF).
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} abaPainel Aba PAINEL.
 * @param {GoogleAppsScript.Properties.Properties} propriedades Controle de envios.
 * @returns {{criticosPorSetor: Object<string, ItemCritico[]>, relatorioPorSetor: Object<string, ItemRelatorio[]>}}
 */
function agruparItensPorSetor(abaPainel, propriedades) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Lê o PAINEL inteiro de uma vez, em vez de célula por célula.
  const dados = abaPainel.getDataRange().getValues();
  const ultimaLinha = Math.min(abaPainel.getLastRow(), LIMITE_LINHAS);

  const criticosPorSetor = {};
  const relatorioPorSetor = {};

  for (let linha = PRIMEIRA_LINHA_DADOS; linha <= ultimaLinha; linha++) {
    const registro = dados[linha - 1];
    const valor = (coluna) => registro[coluna - 1];

    const validade = valor(COLUNA.VALIDADE);
    if (!(validade instanceof Date)) continue;

    validade.setHours(0, 0, 0, 0);
    const diasRestantes = Math.ceil((validade - hoje) / MS_POR_DIA);

    // Controle anti-envio duplicado: uma chave por linha e tipo de aviso.
    const chave = `linha_${linha}_aviso_${diasRestantes}`;
    if (propriedades.getProperty(chave)) continue;

    const setor = valor(COLUNA.SETOR);
    if (!setor) continue;

    const item = {
      codigo: valor(COLUNA.CODIGO),
      produto: valor(COLUNA.PRODUTO),
      qtd: valor(COLUNA.QUANTIDADE),
      validade: Utilities.formatDate(validade, FUSO_HORARIO, "dd/MM/yyyy"),
      local: valor(COLUNA.LOCAL)
    };

    // Todos os itens vão para o relatório em PDF.
    (relatorioPorSetor[setor] = relatorioPorSetor[setor] || []).push({
      ...item,
      validadeOriginal: validade
    });

    // Só os itens nos prazos de aviso vão para o corpo do e-mail.
    if (!DIAS_AVISO.includes(diasRestantes)) continue;

    (criticosPorSetor[setor] = criticosPorSetor[setor] || []).push({
      ...item,
      linha,
      chave,
      ean: valor(COLUNA.EAN),
      setor,
      colaborador: valor(COLUNA.COLABORADOR),
      diasRestantes,
      status: textoStatus(diasRestantes)
    });
  }

  return { criticosPorSetor, relatorioPorSetor };
}

/**
 * Texto da coluna STATUS do e-mail. Prazos incluídos em DIAS_AVISO que não
 * estão em TEXTO_STATUS usam um texto padrão.
 *
 * @param {number} diasRestantes Dias até o vencimento.
 * @returns {string}
 */
function textoStatus(diasRestantes) {
  return TEXTO_STATUS[diasRestantes] || `Vence em ${diasRestantes} dias`;
}

/**
 * Lê a aba CONFIG_EMAILS (coluna A = setor, coluna B = e-mails separados por
 * vírgula).
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} abaConfig Aba CONFIG_EMAILS.
 * @returns {Object<string, string>} E-mails de cada setor.
 */
function lerEmailsPorSetor(abaConfig) {
  const totalLinhas = abaConfig.getLastRow() - 1;
  if (totalLinhas < 1) return {};

  return abaConfig
    .getRange(2, 1, totalLinhas, 2)
    .getValues()
    .reduce((mapa, [setor, emails]) => {
      if (setor && emails) {
        mapa[setor.toString().trim()] = emails.toString().trim();
      }
      return mapa;
    }, {});
}

/**
 * Apaga o registro de avisos já enviados, liberando os alertas para serem
 * enviados de novo. Executar manualmente (útil em testes).
 */
function limparControleEnvios() {
  PropertiesService.getScriptProperties().deleteAllProperties();
}
