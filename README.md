# StockTech — Sistema Web de Gerenciamento de Estoque

> **Tecnologia sob controle.**

Sistema web de gerenciamento de estoque para pequenas empresas (lojas de informática, roupas, mercados, papelarias e distribuidoras). Desenvolvido como Trabalho de Conclusão de Curso de Técnico em Informática.

## Tecnologias

- HTML5, CSS3 e JavaScript
- PHP (PDO com prepared statements)
- MySQL
- XAMPP + phpMyAdmin

## Funcionalidades

- Login com sessões e níveis de acesso (Administrador, Funcionário e Visitante)
- Cadastro, edição, exclusão e consulta de produtos (com código, marca, categoria e estoque mínimo)
- Cadastro de categorias
- Entradas e saídas de estoque (saída nunca maior que o estoque disponível)
- Histórico completo de movimentações (produto, usuário, tipo, quantidade, data e observação)
- Dashboard com totais, produtos que precisam de reposição e últimas movimentações
- Pesquisa e filtros por nome, código, marca, categoria e situação do estoque
- Senhas criptografadas com `password_hash` e proteção contra SQL Injection

## Como executar

1. Instale o [XAMPP](https://www.apachefriends.org/) e inicie **Apache** e **MySQL**.
2. Copie a pasta `stocktech` para `C:\xampp\htdocs\`.
3. Abra `http://localhost/phpmyadmin`, vá na aba **SQL** e execute o arquivo `database_v2.sql`.
4. Acesse `http://localhost/stocktech/`.

## Usuários de teste (senha: `admin123`)

| E-mail | Perfil |
|---|---|
| admin@stocktech.com | Administrador |
| funcionario@stocktech.com | Funcionário |
| visitante@stocktech.com | Visitante |

## Estrutura do projeto

Veja o arquivo [ESTRUTURA.md](ESTRUTURA.md) para a descrição de cada pasta e arquivo.
