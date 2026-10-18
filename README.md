# 📦 Google Sheets Expiration Alerts

### Sistema de Monitoramento Preventivo de Validades

Automação desenvolvida em **Google Apps Script** para controle de produtos com validade no **Google Sheets**, com cadastro pelo **Google Forms** e envio de **alertas automáticos por e-mail**, separados por setor, em diferentes prazos antes do vencimento.

Hoje o sistema está em uso em **mais de 45 lojas**. No piloto, reduziu em **23% as perdas por vencimento**, com **custo operacional zero**: usa apenas ferramentas do Google Workspace.

---

## 🎯 Propósito do Projeto

Este projeto tem como objetivo **automatizar o acompanhamento de datas de validade**, evitando perdas e esquecimentos, através do envio de e-mails automáticos quando um produto está próximo de vencer.

O controle de validades já existia, mas era manual. Com o sistema:

- o cadastro dos produtos é **padronizado** pelo Google Forms;
- cada setor recebe **apenas os seus itens**, sem sobrecarregar ninguém;
- os alertas são enviados de forma **inteligente**, apenas quando necessário, e **não se repetem** para o mesmo produto e prazo;
- os itens vencidos saem do painel sozinhos e ficam guardados em um **histórico**.

---

## 🔄 Como Funciona

```
Google Forms ──► PAINEL ──┬──► E-mail do setor (itens críticos) + PDF (todos os itens do setor)
                          └──► HISTORICO_EXCLUIDOS (itens vencidos)
```

1. O colaborador cadastra o produto pelo **Google Forms** (código, quantidade, validade, local, setor e colaborador).
2. O script grava a resposta no **PAINEL**, e as fórmulas da planilha completam os dados do produto a partir da **BASE_PRODUTOS**.
3. O **PAINEL** é ordenado por data de validade.
4. Todos os dias o script verifica as validades e envia, para o responsável de cada setor, um e-mail com os **itens críticos** no corpo e o **relatório completo do setor em PDF** anexo.
5. Itens vencidos há 1 dia ou mais são movidos para o **HISTORICO_EXCLUIDOS**, com data, hora e motivo da remoção.

---

## ⏰ Regras de Envio de Email

O sistema envia emails automaticamente quando faltam:

- 🔵 **30 dias** para o vencimento
- 🟡 **7 dias** para o vencimento
- 🟠 **3 dias** para o vencimento
- 🔴 **No dia do vencimento (0 dias)**

Cada item aparece no e-mail com um **status colorido** que mostra a gravidade, do mais urgente para o menos urgente. Os prazos podem ser alterados em `DIAS_AVISO`, no arquivo `Config.gs`.

---

## 🗂️ Estrutura do Código

O código fica na pasta [`src/`](src), separado por automação:

| Arquivo | Função principal | O que faz |
|------|-----------|-----------|
| [`Config.gs`](src/Config.gs) | | Configurações: código da loja, banner, nomes das abas, prazos de aviso |
| [`Forms.gs`](src/Forms.gs) | `onFormSubmit(e)` | Grava cada resposta do Forms no PAINEL |
| [`Organizador.gs`](src/Organizador.gs) | `organizarPainel()` | Ordena o PAINEL por data de validade |
| [`Disparador.gs`](src/Disparador.gs) | `verificarValidadesEEnviarEmail()` | Agrupa os itens por setor e envia os alertas |
| [`Email.gs`](src/Email.gs) | `montarCorpoEmail(itens)` | Preenche o template do e-mail com os itens do setor |
| [`EmailTemplate.html`](src/EmailTemplate.html) | | Layout do e-mail de alerta em HTML e CSS |
| [`RelatorioPDF.gs`](src/RelatorioPDF.gs) | `gerarRelatorioPDF(setor, itens)` | Gera o relatório completo do setor em PDF |
| [`Limpeza.gs`](src/Limpeza.gs) | `moverItensVencidosAutomaticamente()` | Move os itens vencidos para o histórico |

---

## 🧾 Estrutura da Planilha

A planilha funciona como banco de dados do sistema, com 5 abas:

| Aba | Para que serve |
|------|-----------|
| **PAINEL** | Centraliza todos os itens coletados e suas validades. É daqui que o script lê os dados para gerar os alertas |
| **CONFIG_EMAILS** | E-mail do responsável de cada setor (coluna A = setor, coluna B = e-mail; para mais de um, separe por vírgula) |
| **FORMULARIO_VALIDADE** | Respostas do Google Forms, funciona como log de tudo o que foi coletado |
| **BASE_PRODUTOS** | Base com os produtos da loja, usada para preencher automaticamente os dados de cada item no PAINEL |
| **HISTORICO_EXCLUIDOS** | Itens removidos do PAINEL por vencimento, com data, hora e motivo |

### Colunas do PAINEL

A **linha 1** é o cabeçalho, a **linha 2** guarda as fórmulas modelo (pode ficar oculta) e os dados começam na **linha 3**.

| Coluna | Informação |
|------|-----------|
| A | Código da loja |
| B | Seção |
| C | Descrição da seção |
| D | Código |
| E | EAN |
| F | Descrição do produto |
| G | Quantidade |
| H | Validade |
| I | Local |
| J | Setor |
| K | Colaborador |
| L | Custo |
| M | Prazo (dias desde o vencimento; usado na limpeza) |
| N | ID único do registro |

⚠️ **As colunas H (Validade) e J (Setor) são obrigatórias para o envio dos alertas.**

---

## 📧 Estrutura do Email

Os emails são enviados em **HTML**, com um banner opcional no topo e os itens críticos do setor organizados em tabela, contendo:

- Código
- Descrição do produto
- EAN
- Setor
- Local
- Colaborador
- Quantidade
- Data de validade (formato brasileiro)
- Status (vence hoje, em 3, 7 ou 30 dias)

Junto com o e-mail vai um **PDF com todos os itens do setor** ordenados por validade, para o responsável se antecipar aos próximos vencimentos.

Isso facilita a leitura e o acompanhamento pelos responsáveis.

---

## 🛑 Controle de Emails Repetidos

Para evitar envios duplicados:

- O script salva uma **chave única** por:
  - Linha
  - Tipo de aviso (30, 7, 3 ou 0 dias)
- Essas informações ficam armazenadas em:
🔐 Script Properties

➡️ Dessa forma, mesmo que o script seja executado várias vezes no mesmo dia, **o email só é enviado uma única vez** para cada produto e tipo de aviso.

Para apagar esse controle (por exemplo, depois de testes), execute manualmente a função `limparControleEnvios()`.

---

## ⚙️ Como Configurar

1. Crie a planilha com as 5 abas descritas acima e ligue o Google Forms a ela.
2. Abra a planilha e vá em **Extensões → Apps Script**.
3. Crie um arquivo para cada arquivo da pasta `src/` e cole o conteúdo. Os arquivos `.gs` são do tipo **Script**; o `EmailTemplate.html` é do tipo **HTML** e deve se chamar exatamente `EmailTemplate`.
4. Em `Config.gs`, ajuste:
   - `CODIGO_LOJA`: código da sua loja;
   - `BANNER_URL`: link público da imagem do banner (se ficar como está, o e-mail sai sem banner);
   - `DIAS_AVISO`: prazos que disparam alerta, se quiser mudar.
5. Preencha a aba **CONFIG_EMAILS** com o setor e o e-mail de cada responsável.

---

## 🔐 Primeira Execução (Muito Importante)

Antes de testar o envio de emails:

1. Abra a planilha no Google Sheets
2. Vá em **Extensões → Apps Script**
3. Execute a função `verificarValidadesEEnviarEmail` manualmente
4. **Autorize as permissões solicitadas pelo Google**

⚠️ Sem essa autorização inicial, o envio de emails não funciona.

---

## 🧪 Como Testar o Sistema

Para realizar testes de forma simples:

- Cadastre um item com a data de validade como:
  - Hoje + 30 dias
  - Hoje + 7 dias
  - Hoje + 3 dias
  - Hoje
- Execute o script
- Verifique se o email chega para o responsável do setor, com o PDF anexo
- Execute novamente no mesmo dia → o email **não deve ser reenviado**

Você também pode testar múltiplas vezes utilizando **linhas diferentes** da planilha, ou executar `limparControleEnvios()` para liberar os envios de novo.

---

## ⏱️ Automação com Gatilhos

No Apps Script, vá em **Acionadores (ícone de relógio) → Adicionar acionador** e crie:

| Função | Tipo de gatilho |
|------|-----------|
| `onFormSubmit` | Da planilha → Ao enviar formulário |
| `organizarPainel` | Baseado no tempo (ex.: a cada hora) |
| `verificarValidadesEEnviarEmail` | Baseado no tempo → diário (recomendado) |
| `moverItensVencidosAutomaticamente` | Baseado no tempo → diário |

Isso garante que os alertas sejam enviados automaticamente sem necessidade de execução manual.

---

## 🚀 Tecnologias Utilizadas

- JavaScript (Google Apps Script)
- HTML e CSS para formatação de emails
- Google Sheets (banco de dados)
- Google Forms (cadastro padronizado)
- Gmail (MailApp) para envio dos alertas
- Exportação de PDF do Google Sheets
- Script Properties para controle de estado dos envios

---

## 📌 Observações Finais

- O código pode ser facilmente adaptado para outras planilhas e lojas: basta ajustar o `Config.gs`
- Os prazos de aviso podem ser alterados conforme a necessidade
- Ideal para controle de estoque, validade de produtos ou documentos
- Nenhum dado real (e-mails, IDs de planilha ou dados de produtos) fica no código

---

## 🤝 Contribuições

Sugestões, melhorias e adaptações são sempre bem-vindas!
