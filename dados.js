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
      { id: 1, nome: "Eletrônicos", descricao: "Periféricos e acessórios" },
      { id: 2, nome: "Alimentos", descricao: "Produtos alimentícios" },
      { id: 3, nome: "Limpeza", descricao: "Produtos de limpeza" }
    ],
    produtos: [
      { id: 1, nome: "Mouse sem fio", codigo: "ELE001", marca: "Logitech", descricao: "", preco: 59.9, quantidade: 25, estoque_minimo: 5, categoria_id: 1 },
      { id: 2, nome: "Teclado USB", codigo: "ELE002", marca: "Multilaser", descricao: "", preco: 45, quantidade: 3, estoque_minimo: 5, categoria_id: 1 },
      { id: 3, nome: "Arroz 5kg", codigo: "ALI001", marca: "Tio João", descricao: "", preco: 28.5, quantidade: 40, estoque_minimo: 10, categoria_id: 2 },
      { id: 4, nome: "Detergente 500ml", codigo: "LIM001", marca: "Ypê", descricao: "", preco: 2.99, quantidade: 0, estoque_minimo: 10, categoria_id: 3 }
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
