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
