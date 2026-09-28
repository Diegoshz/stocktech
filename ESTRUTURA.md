# StockTech — Etapa 1: Estrutura do Projeto

**Slogan:** Tecnologia sob controle.

Coloque a pasta `stocktech/` dentro de `C:\xampp\htdocs\`.
Depois acesse no navegador: `http://localhost/stocktech/`

## Estrutura

```
stocktech/
├── index.php              → página pública (vitrine de produtos + pesquisa)
├── login.php              → formulário de login
├── logout.php             → encerra a sessão
├── dashboard.php          → painel administrativo (cards + movimentações)
│
├── config/
│   └── conexao.php        → conexão PHP + MySQL (PDO)
│
├── includes/              → (adicionado) arquivos reaproveitados em várias páginas
│   ├── protege.php        → verifica login e nível de acesso
│   ├── cabecalho.php      → topo + menu lateral
│   └── rodape.php         → fechamento do HTML
│
├── produtos/              → listar, cadastrar, editar, excluir
├── categorias/           → listar, cadastrar, excluir
├── estoque/              → entrada, saida, movimentacoes
├── relatorios/           → relatórios de estoque e movimentações
├── usuarios/             → listar, cadastrar, excluir (só administrador)
│
├── css/style.css         → todo o visual do sistema
├── js/script.js          → validações e confirmação de exclusão
└── imagens/              → fotos dos produtos enviadas no cadastro
```

## Por que a pasta `includes/` foi adicionada

Sem ela, o menu, o topo e a verificação de login teriam que ser copiados em
todos os arquivos. Com `include`, o código fica escrito uma única vez — é a
única mudança em relação à estrutura sugerida.

## O que observar

- A pasta `imagens/` precisa ter permissão de escrita (no Windows/XAMPP já tem).
- Nada funciona ainda: os arquivos serão criados nas próximas etapas.

## Próxima etapa

**Etapa 2** — criar o banco `stocktech` no phpMyAdmin com o SQL completo
(tabelas usuarios, categorias, produtos, movimentacoes).
