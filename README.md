# StockTech — versão HTML, CSS e JavaScript

> Tecnologia sob controle.

Versão do StockTech que funciona **sem XAMPP**: basta abrir o `index.html` no navegador.

## Como usar
1. Extraia a pasta.
2. Dê dois cliques em `index.html`.
3. Entre com um dos usuários (senha `admin123`):
   - admin@stocktech.com — Administrador
   - funcionario@stocktech.com — Funcionário
   - visitante@stocktech.com — Visitante

## Arquivos
- `index.html` — estrutura das telas
- `css/estilo.css` — visual e layout responsivo
- `js/dados.js` — dados iniciais e salvamento (localStorage)
- `js/app.js` — login, produtos, categorias, entradas/saídas, histórico, painel, filtros e relatórios

## Diferença para a versão PHP
Aqui os dados ficam salvos **no próprio navegador** (localStorage) em vez do MySQL.
Por isso as senhas não ficam criptografadas e cada navegador tem seus próprios dados.
Serve para demonstração; a versão segura e completa é a versão PHP + MySQL.

Para voltar aos dados iniciais: abra o console do navegador (F12) e digite `localStorage.clear()`.
