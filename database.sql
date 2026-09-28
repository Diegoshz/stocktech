-- ============================================================
-- StockTech — Sistema Web de Gerenciamento de Estoque
-- Etapa 2: Criação do banco de dados e das tabelas
--
-- Como usar:
--   1. Abra o phpMyAdmin (http://localhost/phpmyadmin)
--   2. Clique na aba "SQL"
--   3. Cole todo este arquivo e clique em "Executar"
-- ============================================================

-- Cria o banco de dados (se ainda não existir)
CREATE DATABASE IF NOT EXISTS stocktech
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE stocktech;

-- ------------------------------------------------------------
-- Tabela: usuarios
-- Guarda quem pode acessar o sistema (login e senha).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,          -- senha criptografada (password_hash)
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabela: categorias
-- Agrupa os produtos (ex.: Eletrônicos, Alimentos, Limpeza).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabela: produtos
-- Cadastro dos produtos e a quantidade atual em estoque.
-- estoque_minimo: limite que dispara o alerta de "estoque baixo".
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT DEFAULT NULL,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  quantidade INT NOT NULL DEFAULT 0,
  estoque_minimo INT NOT NULL DEFAULT 5,
  categoria_id INT DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  -- Chave estrangeira: liga o produto à sua categoria
  FOREIGN KEY (categoria_id)
    REFERENCES categorias(id)
    ON DELETE SET NULL        -- se a categoria for apagada, o produto fica sem categoria
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabela: movimentacoes
-- Histórico de entradas e saídas de estoque.
-- tipo: 'entrada' ou 'saida'
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimentacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  usuario_id INT DEFAULT NULL,
  tipo ENUM('entrada', 'saida') NOT NULL,
  quantidade INT NOT NULL,
  observacao VARCHAR(255) DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id)
    REFERENCES produtos(id)
    ON DELETE CASCADE         -- se o produto for apagado, o histórico dele também é
    ON UPDATE CASCADE,
  FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE SET NULL        -- guarda quem fez a movimentação
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Dados iniciais (para o sistema já abrir funcionando)
-- ------------------------------------------------------------

-- Usuário administrador padrão
-- Login: admin@stocktech.com  |  Senha: admin123
-- (a senha abaixo já está criptografada com password_hash)
INSERT INTO usuarios (nome, email, senha) VALUES
('Administrador', 'admin@stocktech.com',
 '$2b$10$lKo6Q/PqrWpwAzzZvsbZkOsIY8DDmnvbK6/H5bboDye5l3Q/OVYuW');

-- Algumas categorias de exemplo
INSERT INTO categorias (nome, descricao) VALUES
('Eletrônicos', 'Aparelhos e acessórios eletrônicos'),
('Alimentos', 'Produtos alimentícios em geral'),
('Limpeza', 'Produtos de limpeza e higiene');

-- Alguns produtos de exemplo
INSERT INTO produtos (nome, descricao, preco, quantidade, estoque_minimo, categoria_id) VALUES
('Mouse sem fio', 'Mouse óptico sem fio 2.4GHz', 45.90, 20, 5, 1),
('Teclado USB', 'Teclado padrão ABNT2', 59.90, 3, 5, 1),
('Arroz 5kg', 'Arroz branco tipo 1', 24.50, 50, 10, 2),
('Detergente 500ml', 'Detergente neutro', 2.99, 100, 20, 3);
