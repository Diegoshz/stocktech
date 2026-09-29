// ============================================================
// dados.js — "banco de dados" da versão HTML/CSS/JS
// Os dados ficam guardados no navegador (localStorage),
// fazendo o papel que o MySQL faz na versão PHP.
// ============================================================

const CHAVE = "stocktech_dados";

// Dados iniciais (os mesmos do database_v2.sql)
function dadosIniciais() {
  return {
    usuarios: [
      { id: 1, nome: "Administrador", email: "admin@stocktech.com", senha: "admin123", perfil: "administrador" },
      { id: 2, nome: "Funcionário", email: "funcionario@stocktech.com", senha: "admin123", perfil: "funcionario" },
      { id: 3, nome: "Visitante", email: "visitante@stocktech.com", senha: "admin123", perfil: "visitante" }
    ],
    categorias: [
      { id: 1, Nome:"Eletrônicos", Descricao: "Periféricos e acessórios" },
      { id: 2, Nome:"Alimentos", Descricao: "Produtos alimentícios" },
      { id: 3, Nome: "Limpeza", Descricao: "Produtos de limpeza" }
    ],
    produtos: [
      { id: 1, Nome: "Mouse sem fio", Codigo: "ELE001", Marca: "Logitech", Descricao: "", Preco Unit: 59.9, Quantidade: 25, Estoque_Minimo: 5, Categoria_id: 1 },
      { id: 2, Nome: "Teclado USB", Codigo: "ELE002", Marca: "Multilaser", Descricao: "", Preco Unit: 45, Quantidade: 3, Estoque_Minimo: 5, Categoria_id: 1 },
      { id: 3, Nome: "Arroz 5kg", Codigo: "ALI001", Marca: "Tio João", Descricao: "", Preco Unit: 28.5, Quantidade: 40, Estoque_Minimo: 10, Categoria_id: 2 },
      { id: 4, Nome: "Detergente 500ml", Codigo: "LIM001", Marca: "Ypê", Descricao: "", Preco Unit: 2.99, Quantidade: 0, Estoque_Minimo: 10, Categoria_id: 3 }
    ],
    movimentacoes: []
  };
}

// Lê os dados salvos (ou cria os iniciais na primeira vez)
function carregar() {
  const salvo = localStorage.getItem(CHAVE);
  if (!salvo) {
    const d = dadosIniciais();
    salvar(d);
    return d;
  }
  return JSON.parse(salvo);
}

function salvar(d) {
  localStorage.setItem(CHAVE, JSON.stringify(d));
}

// Gera o próximo ID de uma lista (igual ao AUTO_INCREMENT do MySQL)
function proximoId(lista) {
  return lista.length ? Math.max(...lista.map(i => i.id)) + 1 : 1;
}
