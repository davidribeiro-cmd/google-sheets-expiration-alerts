# 📦 Google Sheets Expiration Alerts

Automação desenvolvida em **Google Apps Script** para controle de produtos com validade no **Google Sheets**, com envio de **alertas automáticos por email** em diferentes prazos antes do vencimento.

---

## 🎯 Propósito do Projeto

Este projeto tem como objetivo **automatizar o acompanhamento de datas de validade**, evitando perdas e esquecimentos, através do envio de emails automáticos quando um produto está próximo de vencer.

Os alertas são enviados de forma **inteligente**, apenas quando necessário, e **não se repetem no mesmo dia** para o mesmo produto e prazo.

---

## ⏰ Regras de Envio de Email

O sistema envia emails automaticamente quando faltam:

- 🗓️ **30 dias** para o vencimento  
- ⚠️ **7 dias** para o vencimento  
- 🚨 **3 dias** para o vencimento  
- ❌ **No dia do vencimento (0 dias)**  

Cada aviso possui um **tom adequado de gravidade** no email.

---

## 🧠 Como o Código Funciona (Visão Geral)

1. O script percorre todas as linhas da planilha (até a linha 1000)
2. Para cada linha:
   - Lê a **data de validade**
   - Calcula quantos dias faltam para vencer
3. Se o prazo bater com algum alerta configurado:
   - Verifica se o email **já foi enviado naquele dia**
   - Caso não tenha sido enviado, dispara o email
4. O envio é registrado usando **Script Properties**, evitando reenvios duplicados

---

## 🧾 Estrutura da Planilha

O código utiliza as seguintes colunas:

| Coluna | Informação |
|------|-----------|
| B | Seção |
| C | Descrição da seção |
| D | Código |
| E | EAN |
| F | Descrição do produto |
| G | Quantidade |
| H | Validade |
| I | Local |
| J | Colaborador |
| K | Custo |
| L | Prazo (dias restantes) |

⚠️ **A coluna H (Validade) é obrigatória para o funcionamento do script.**

---

## 📧 Estrutura do Email

Os emails são enviados em **HTML**, organizados em formato de tabela, contendo:

- Seção
- Código
- EAN
- Descrição do produto
- Quantidade
- Data de validade (formato brasileiro)
- Local
- Colaborador
- Custo
- Prazo restante

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

---

## 🔐 Primeira Execução (Muito Importante)

Antes de testar o envio de emails:

1. Abra a planilha no Google Sheets
2. Vá em **Extensões → Apps Script**
3. Execute a função principal manualmente
4. **Autorize as permissões solicitadas pelo Google**

⚠️ Sem essa autorização inicial, o envio de emails não funciona.

---

## 🧪 Como Testar o Sistema

Para realizar testes de forma simples:

- Defina a data de validade como:
- Hoje + 30 dias
- Hoje + 7 dias
- Hoje + 3 dias
- Hoje
- Execute o script
- Verifique se o email é enviado
- Execute novamente no mesmo dia → o email **não deve ser reenviado**

Você também pode testar múltiplas vezes utilizando **linhas diferentes** da planilha.

---

## ⏱️ Automação com Gatilho

O script foi projetado para funcionar com um **gatilho de tempo**, como por exemplo:

- Execução diária (recomendado)
- Execução a cada hora (opcional)

Isso garante que os alertas sejam enviados automaticamente sem necessidade de execução manual.

---

## 🚀 Tecnologias Utilizadas

- Google Sheets
- Google Apps Script
- HTML para formatação de emails
- Script Properties para controle de estado dos envios

---

## 📌 Observações Finais

- O código pode ser facilmente adaptado para outras planilhas
- Os prazos de aviso podem ser alterados conforme a necessidade
- Ideal para controle de estoque, validade de produtos ou documentos

---

## 🤝 Contribuições

Sugestões, melhorias e adaptações são sempre bem-vindas!

