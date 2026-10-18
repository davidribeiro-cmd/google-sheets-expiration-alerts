// =========================================
// E-MAIL DE ALERTA (HTML + CSS)
// =========================================
// Monta o corpo do e-mail com a tabela dos itens
// críticos de um setor. O CSS fica inline porque
// a maioria dos leitores de e-mail ignora <style>.

const ESTILO_CELULA = "padding:12px;border:1px solid #dcdcdc;";
const ESTILO_CABECALHO = "padding:14px;border:1px solid #dcdcdc;";

function montarCorpoEmail(itens) {

  // =========================================
  // LINHAS DA TABELA
  // =========================================

  let linhasTabela = "";

  itens.forEach(function (item) {

    linhasTabela += `
      <tr>
        <td style="${ESTILO_CELULA}text-align:center;">${item.codigo}</td>
        <td style="${ESTILO_CELULA}">${item.produto}</td>
        <td style="${ESTILO_CELULA}text-align:center;">${item.ean}</td>
        <td style="${ESTILO_CELULA}text-align:center;">${item.setor}</td>
        <td style="${ESTILO_CELULA}text-align:center;">${item.local}</td>
        <td style="${ESTILO_CELULA}text-align:center;">${item.colaborador}</td>
        <td style="${ESTILO_CELULA}text-align:center;">${item.qtd}</td>
        <td style="${ESTILO_CELULA}text-align:center;">${item.validade}</td>
        <td style="${ESTILO_CELULA}font-weight:bold;text-align:center;">${item.status}</td>
      </tr>
    `;

  });

  const titulos = ["CÓDIGO", "PRODUTO", "EAN", "SETOR", "LOCAL", "COLAB", "QTD", "DATA", "STATUS"];

  const cabecalho = titulos
    .map(function (titulo) {
      return `<th style="${ESTILO_CABECALHO}">${titulo}</th>`;
    })
    .join("");

  // =========================================
  // E-MAIL COMPLETO
  // =========================================

  return `
    <div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border-collapse:collapse;margin:0;padding:0;background:#f4f6f9;">
        <tr>
          <td align="center" style="padding:0;margin:0;">

            <table width="1200" cellpadding="0" cellspacing="0" border="0"
              style="width:100%;max-width:1200px;border-collapse:collapse;background:white;">

              ${montarBanner()}

              <!-- CONTEÚDO -->
              <tr>
                <td style="padding:35px;">

                  <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr style="background:${COR_PRINCIPAL};color:white;">
                      ${cabecalho}
                    </tr>
                    ${linhasTabela}
                  </table>

                  <div style="margin-top:35px;padding-top:20px;border-top:1px solid #dcdcdc;
                    text-align:center;color:#666;font-size:13px;">
                    Sistema de Monitoramento Preventivo de Validades
                  </div>

                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </div>
  `;

}

// =========================================
// BANNER
// =========================================
// Só aparece se BANNER_URL estiver configurado
// em Config.gs. Assim o e-mail nunca mostra
// uma imagem quebrada.

function montarBanner() {

  if (!BANNER_URL || BANNER_URL.indexOf("COLE_AQUI") === 0) return "";

  return `
    <!-- BANNER -->
    <tr>
      <td style="padding:0;margin:0;line-height:0;font-size:0;">
        <img src="${BANNER_URL}" width="1200"
          style="width:100%;max-width:1200px;height:auto;display:block;border:0;margin:0;padding:0;">
      </td>
    </tr>
  `;

}
