// =========================================
// CONFIGURAÇÕES DO SISTEMA
// =========================================
// Este é o único arquivo que precisa ser
// alterado para usar o sistema em outra loja.
// Os demais arquivos leem os valores daqui.

// Código da loja gravado na coluna A do PAINEL
// a cada novo cadastro feito pelo Forms.
const CODIGO_LOJA = "0000";

// Link público da imagem usada como banner no
// topo do e-mail de alerta. Exemplo com Google Drive:
// "https://drive.google.com/uc?export=view&id=ID_DA_IMAGEM"
// Enquanto não for configurado, o e-mail é
// enviado sem banner.
const BANNER_URL = "COLE_AQUI_O_LINK_DO_BANNER";

// Nomes das abas da planilha.
const ABA_PAINEL = "PAINEL";
const ABA_CONFIG_EMAILS = "CONFIG_EMAILS";
const ABA_HISTORICO = "HISTORICO_EXCLUIDOS";

// Dias antes do vencimento que disparam alerta.
const DIAS_AVISO = [0, 3, 7, 30];

// Fuso horário usado para formatar as datas.
const FUSO_HORARIO = "America/Sao_Paulo";

// Cor principal usada no e-mail e no PDF.
const COR_PRINCIPAL = "#0057B8";
