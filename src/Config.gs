/**
 * @fileoverview Configurações do Sistema de Monitoramento Preventivo de Validades.
 *
 * Este é o único arquivo que precisa ser alterado para usar o sistema em
 * outra loja. Os demais arquivos leem os valores daqui.
 */

// ---------------------------------------------------------------------------
// Loja
// ---------------------------------------------------------------------------

/** Código da loja gravado na coluna A do PAINEL a cada novo cadastro. */
const CODIGO_LOJA = "0000";

/**
 * Link público da imagem usada como banner no topo do e-mail de alerta.
 * Exemplo com Google Drive: "https://drive.google.com/uc?export=view&id=ID_DA_IMAGEM".
 * Enquanto não for configurado, o e-mail é enviado sem banner.
 */
const BANNER_URL = "COLE_AQUI_O_LINK_DO_BANNER";

// ---------------------------------------------------------------------------
// Regras de alerta
// ---------------------------------------------------------------------------

/** Dias antes do vencimento que disparam alerta por e-mail. */
const DIAS_AVISO = [0, 3, 7, 30];

/** Fuso horário usado para formatar as datas. */
const FUSO_HORARIO = "America/Sao_Paulo";

/** Cor principal usada no e-mail e no relatório em PDF. */
const COR_PRINCIPAL = "#0057B8";

// ---------------------------------------------------------------------------
// Estrutura da planilha
// ---------------------------------------------------------------------------

/** Nomes das abas da planilha. */
const ABA = Object.freeze({
  PAINEL: "PAINEL",
  CONFIG_EMAILS: "CONFIG_EMAILS",
  HISTORICO: "HISTORICO_EXCLUIDOS"
});

/** Número de cada coluna do PAINEL (A = 1). */
const COLUNA = Object.freeze({
  LOJA: 1,            // A
  SECAO: 2,           // B (fórmula)
  DESC_SECAO: 3,      // C (fórmula)
  CODIGO: 4,          // D
  EAN: 5,             // E (fórmula)
  PRODUTO: 6,         // F (fórmula)
  QUANTIDADE: 7,      // G
  VALIDADE: 8,        // H
  LOCAL: 9,           // I
  SETOR: 10,          // J
  COLABORADOR: 11,    // K
  CUSTO: 12,          // L (fórmula)
  DIAS_VENCIDO: 13,   // M (fórmula)
  ID: 14              // N
});

/** Quantidade de colunas usadas no PAINEL (A até N). */
const TOTAL_COLUNAS = 14;

/** Linha 2 do PAINEL guarda as fórmulas modelo (pode ficar oculta). */
const LINHA_MODELO = 2;

/** Primeira linha com dados no PAINEL (linha 1 = cabeçalho, linha 2 = modelo). */
const PRIMEIRA_LINHA_DADOS = 3;

/** Limite de linhas lidas pelo disparador, por segurança. */
const LIMITE_LINHAS = 10000;
