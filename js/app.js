// ============================================================
// app.js — telas e regras do StockTech (HTML/CSS/JS)
// ============================================================

let db = carregar();
const $ = (id) => document.getElementById(id);

// ---------- Ajudantes ----------
function esc(t) { // evita que textos digitados virem HTML (segurança)
  return String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function dinheiro(v) { return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function dataHora(iso) { return new Date(iso).toLocaleString("pt-BR"); }
function usuarioAtual() { return JSON.parse(sessionStorage.getItem("stocktech_usuario") || "null"); }
function pode(...perfis) { const u = usuarioAtual(); return u && perfis.includes(u.perfil); }
function nomeCategoria(id) { const c = db.categorias.find(c => c.id === id); return c ? c.nome : "Sem categoria"; }

function situacao(p) {
  if (p.quantidade === 0) return { classe: "esgotado", texto: "🔴 Esgotado" };
  if (p.quantidade <= p.estoque_minimo) return { classe: "baixo", texto: "🟡 Estoque baixo" };
  return { classe: "normal", texto: "🟢 Em estoque" };
}

function mensagem(texto, tipo = "sucesso") {
  $("mensagem").innerHTML = `<div class="alerta ${tipo}">${esc(texto)}</div>`;
  setTimeout(() => ($("mensagem").innerHTML = ""), 4000);
}

// ---------- Login / sessão ----------
$("form-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("login-email").value.trim().toLowerCase();
  const senha = $("login-senha").value;
  const u = db.usuarios.find(u => u.email === email && u.senha === senha);
  if (!u) {
    $("erro-login").textContent = "E-mail ou senha incorretos.";
    $("erro-login").classList.remove("oculto");
    return;
  }
  sessionStorage.setItem("stocktech_usuario", JSON.stringify({ id: u.id, nome: u.nome, perfil: u.perfil }));
  location.hash = "#painel";
  iniciar();
});

$("btn-sair").addEventListener("click", (e) => {
  e.preventDefault();
  sessionStorage.removeItem("stocktech_usuario");
  location.hash = "";
  iniciar();
});

$("btn-menu").addEventListener("click", () => $("menu").classList.toggle("aberto"));

function iniciar() {
  const u = usuarioAtual();
  $("tela-login").classList.toggle("oculto", !!u);
  $("sistema").classList.toggle("oculto", !u);
  if (!u) return;
  $("usuario-logado").textContent = `${u.nome} (${u.perfil})`;
  // Esconde do menu o que o perfil não pode acessar
  document.querySelectorAll("#menu [data-perfil]").forEach(a => {
    a.classList.toggle("oculto", !a.dataset.perfil.split(" ").includes(u.perfil));
  });
  mostrarTela();
}

// ---------- Navegação entre telas (pelo # do endereço) ----------
const telas = {
  painel: { perfis: ["administrador", "funcionario", "visitante"], fn: telaPainel },
  produtos: { perfis: ["administrador", "funcionario", "visitante"], fn: telaProdutos },
  categorias: { perfis: ["administrador"], fn: telaCategorias },
  movimentar: { perfis: ["administrador", "funcionario"], fn: telaMovimentar },
  historico: { perfis: ["administrador", "funcionario"], fn: telaHistorico },
  relatorios: { perfis: ["administrador"], fn: telaRelatorios }
};

function mostrarTela() {
  if (!usuarioAtual()) return;
  const nome = location.hash.replace("#", "").split("?")[0] || "painel";
  const tela = telas[nome] || telas.painel;
  $("menu").classList.remove("aberto");
  document.querySelectorAll("#menu a").forEach(a => a.classList.toggle("ativo", a.getAttribute("href") === "#" + nome));
  if (!pode(...tela.perfis)) {
    $("conteudo").innerHTML = `<div class="cartao"><h2>Acesso negado</h2><p>Seu perfil não tem permissão para esta tela.</p></div>`;
    return;
  }
  tela.fn();
}
window.addEventListener("hashchange", mostrarTela);

// ---------- Painel ----------
function telaPainel() {
  const p = db.produtos;
  const baixo = p.filter(x => situacao(x).classe === "baixo");
  const esgot = p.filter(x => situacao(x).classe === "esgotado");
  const unidades = p.reduce((s, x) => s + x.quantidade, 0);
  const recentes = [...db.movimentacoes].reverse().slice(0, 5);
  $("conteudo").innerHTML = `
    <h2>Painel</h2>
    <div class="grade">
      <div class="indicador"><span>Produtos</span><strong>${p.length}</strong></div>
      <div class="indicador"><span>Unidades em estoque</span><strong>${unidades}</strong></div>
      <div class="indicador amarelo"><span>Estoque baixo</span><strong>${baixo.length}</strong></div>
      <div class="indicador vermelho"><span>Esgotados</span><strong>${esgot.length}</strong></div>
      <div class="indicador"><span>Movimentações</span><strong>${db.movimentacoes.length}</strong></div>
    </div>
    <div class="cartao"><h3>Precisam de reposição</h3>${tabelaProdutos([...esgot, ...baixo], false)}</div>
    ${pode("administrador", "funcionario") ? `<div class="cartao"><h3>Últimas movimentações</h3>${tabelaMov(recentes)}</div>` : ""}`;
}

// ---------- Produtos ----------
function tabelaProdutos(lista, comAcoes = true) {
  if (!lista.length) return "<p>Nenhum produto encontrado.</p>";
  const editar = comAcoes && pode("administrador", "funcionario");
  const excluir = comAcoes && pode("administrador");
  const valorTotalLista = lista.reduce((s, x) => s + (Number(x.preco) || 0) * (Number(x.quantidade) || 0), 0);
  return `<div class="tabela"><table>
    <tr><th>Código</th><th>Nome</th><th>Categoria</th><th>Marca</th><th>Preço unitário</th><th>Qtd.</th><th>Preço total</th><th>Situação</th>${editar ? "<th>Ações</th>" : ""}</tr>
    ${lista.map(x => {
      const s = situacao(x);
      return `<tr><td>${esc(x.codigo)}</td><td>${esc(x.nome)}</td><td>${esc(nomeCategoria(x.categoria_id))}</td>
        <td>${esc(x.marca)}</td><td>${dinheiro(x.preco)}</td><td>${x.quantidade}</td>
        <td>${dinheiro((Number(x.preco) || 0) * (Number(x.quantidade) || 0))}</td>
        <td><span class="etiqueta ${s.classe}">${s.texto}</span></td>
        ${editar ? `<td class="acoes"><button class="btn peq claro" onclick="formProduto(${x.id})">Editar</button>
          ${excluir ? `<button class="btn peq perigo" onclick="excluirProduto(${x.id})">Excluir</button>` : ""}</td>` : ""}</tr>`;
    }).join("")}
  </table></div><div class="total-estoque"><span>Valor total dos produtos exibidos:</span><strong>${dinheiro(valorTotalLista)}</strong></div>`;
}

function telaProdutos() {
  const opcoesCat = db.categorias.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join("");
  $("conteudo").innerHTML = `
    <h2>Produtos</h2>
    ${pode("administrador", "funcionario") ? `<p><button class="btn" onclick="formProduto()">+ Novo produto</button></p>` : ""}
    <div id="area-form"></div>
    <div class="cartao filtros">
      <label>Pesquisar <input id="f-busca" placeholder="Nome, código ou marca"></label>
      <label>Categoria <select id="f-cat"><option value="">Todas</option>${opcoesCat}</select></label>
      <label>Situação <select id="f-sit"><option value="">Todas</option>
        <option value="normal">Em estoque</option><option value="baixo">Estoque baixo</option><option value="esgotado">Esgotado</option></select></label>
    </div>
    <div class="cartao"><p id="contador"></p><div id="lista"></div></div>`;
  ["f-busca", "f-cat", "f-sit"].forEach(id => $(id).addEventListener("input", filtrarProdutos));
  filtrarProdutos();
}

function filtrarProdutos() {
  const busca = $("f-busca").value.toLowerCase();
  const cat = $("f-cat").value;
  const sit = $("f-sit").value;
  const lista = db.produtos.filter(p =>
    (!busca || [p.nome, p.codigo, p.marca].some(t => t.toLowerCase().includes(busca))) &&
    (!cat || p.categoria_id === Number(cat)) &&
    (!sit || situacao(p).classe === sit));
  $("contador").textContent = `${lista.length} produto(s) encontrado(s)`;
  $("lista").innerHTML = tabelaProdutos(lista);
}

function formProduto(id) {
  const p = db.produtos.find(x => x.id === id) || { nome: "", codigo: "", marca: "", descricao: "", preco: "", quantidade: 0, estoque_minimo: 5, categoria_id: "" };
  const opcoesCat = db.categorias.map(c => `<option value="${c.id}" ${c.id === p.categoria_id ? "selected" : ""}>${esc(c.nome)}</option>`).join("");
  $("area-form").innerHTML = `
    <form id="form-produto" class="cartao">
      <h3>${id ? "Editar produto" : "Novo produto"}</h3>
      <div class="form-linha">
        <label>Nome * <input name="nome" required value="${esc(p.nome)}"></label>
        <label>Código * <input name="codigo" required value="${esc(p.codigo)}"></label>
        <label>Marca <input name="marca" value="${esc(p.marca)}"></label>
        <label>Categoria <select name="categoria_id"><option value="">Sem categoria</option>${opcoesCat}</select></label>
        <label>Preço unitário (R$) * <input name="preco" type="number" step="0.01" min="0" required value="${p.preco}"></label>
        <label>Estoque mínimo * <input name="estoque_minimo" type="number" min="0" required value="${p.estoque_minimo}"></label>
        ${id ? "" : `<label>Quantidade inicial <input name="quantidade" type="number" min="0" value="0"></label>`}
      </div>
      <label>Descrição <textarea name="descricao">${esc(p.descricao)}</textarea></label>
      <button class="btn">Salvar</button>
      <button type="button" class="btn claro" onclick="$('area-form').innerHTML=''">Cancelar</button>
    </form>`;
  $("form-produto").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const codigo = f.get("codigo").trim().toUpperCase();
    if (db.produtos.some(x => x.codigo.toUpperCase() === codigo && x.id !== id)) {
      return mensagem("Já existe um produto com esse código.", "erro");
    }
    const dados = {
      nome: f.get("nome").trim(), codigo, marca: f.get("marca").trim(), descricao: f.get("descricao").trim(),
      preco: Number(f.get("preco")), estoque_minimo: Number(f.get("estoque_minimo")),
      categoria_id: f.get("categoria_id") ? Number(f.get("categoria_id")) : null
    };
    if (id) Object.assign(db.produtos.find(x => x.id === id), dados);
    else db.produtos.push({ id: proximoId(db.produtos), quantidade: Number(f.get("quantidade") || 0), ...dados });
    salvar(db);
    mensagem(id ? "Produto atualizado." : "Produto cadastrado.");
    telaProdutos();
  });
  $("area-form").scrollIntoView({ behavior: "smooth" });
}

function excluirProduto(id) {
  const p = db.produtos.find(x => x.id === id);
  if (!confirm(`Excluir o produto "${p.nome}"? O histórico dele também será apagado.`)) return;
  db.produtos = db.produtos.filter(x => x.id !== id);
  db.movimentacoes = db.movimentacoes.filter(m => m.produto_id !== id);
  salvar(db);
  mensagem("Produto excluído.");
  telaProdutos();
}

// ---------- Categorias ----------
function telaCategorias() {
  $("conteudo").innerHTML = `
    <h2>Categorias</h2>
    <form id="form-cat" class="cartao form-linha">
      <label>Nome * <input name="nome" required></label>
      <label>Descrição <input name="descricao"></label>
      <div><button class="btn">Cadastrar</button></div>
    </form>
    <div class="cartao tabela"><table>
      <tr><th>Nome</th><th>Descrição</th><th>Produtos</th><th>Ações</th></tr>
      ${db.categorias.map(c => `<tr><td>${esc(c.nome)}</td><td>${esc(c.descricao)}</td>
        <td>${db.produtos.filter(p => p.categoria_id === c.id).length}</td>
        <td><button class="btn peq perigo" onclick="excluirCategoria(${c.id})">Excluir</button></td></tr>`).join("")}
    </table></div>`;
  $("form-cat").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const nome = f.get("nome").trim();
    if (db.categorias.some(c => c.nome.toLowerCase() === nome.toLowerCase())) return mensagem("Essa categoria já existe.", "erro");
    db.categorias.push({ id: proximoId(db.categorias), nome, descricao: f.get("descricao").trim() });
    salvar(db);
    mensagem("Categoria cadastrada.");
    telaCategorias();
  });
}

function excluirCategoria(id) {
  if (!confirm("Excluir esta categoria? Os produtos dela ficarão sem categoria.")) return;
  db.categorias = db.categorias.filter(c => c.id !== id);
  db.produtos.forEach(p => { if (p.categoria_id === id) p.categoria_id = null; });
  salvar(db);
  mensagem("Categoria excluída.");
  telaCategorias();
}

// ---------- Entrada e saída ----------
function telaMovimentar() {
  const opcoes = db.produtos.map(p => `<option value="${p.id}">${esc(p.codigo)} — ${esc(p.nome)} (estoque: ${p.quantidade})</option>`).join("");
  $("conteudo").innerHTML = `
    <h2>Entrada e saída de estoque</h2>
    <form id="form-mov" class="cartao">
      <div class="form-linha">
        <label>Produto * <select name="produto_id" required>${opcoes}</select></label>
        <label>Tipo * <select name="tipo"><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label>
        <label>Quantidade * <input name="quantidade" type="number" min="1" required></label>
      </div>
      <label>Observação <input name="observacao"></label>
      <button class="btn">Confirmar</button>
    </form>`;
  $("form-mov").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const p = db.produtos.find(x => x.id === Number(f.get("produto_id")));
    const qtd = Number(f.get("quantidade"));
    const tipo = f.get("tipo");
    if (!p || qtd < 1) return mensagem("Informe um produto e uma quantidade válida.", "erro");
    if (tipo === "saida" && qtd > p.quantidade) {
      return mensagem(`Saída recusada: só há ${p.quantidade} unidade(s) de "${p.nome}".`, "erro");
    }
    p.quantidade += tipo === "entrada" ? qtd : -qtd;
    db.movimentacoes.push({
      id: proximoId(db.movimentacoes), produto_id: p.id, usuario: usuarioAtual().nome,
      tipo, quantidade: qtd, observacao: f.get("observacao").trim(), data: new Date().toISOString()
    });
    salvar(db); // estoque e histórico são salvos juntos
    mensagem(`${tipo === "entrada" ? "Entrada" : "Saída"} registrada. Estoque atual: ${p.quantidade}.`);
    telaMovimentar();
  });
}

// ---------- Histórico ----------
function tabelaMov(lista) {
  if (!lista.length) return "<p>Nenhuma movimentação encontrada.</p>";
  return `<div class="tabela"><table>
    <tr><th>Data e hora</th><th>Produto</th><th>Tipo</th><th>Qtd.</th><th>Usuário</th><th>Observação</th></tr>
    ${lista.map(m => {
      const p = db.produtos.find(x => x.id === m.produto_id);
      return `<tr><td>${dataHora(m.data)}</td><td>${esc(p ? p.nome : "—")}</td>
        <td><span class="etiqueta ${m.tipo}">${m.tipo === "entrada" ? "ENTRADA" : "SAÍDA"}</span></td>
        <td>${m.quantidade}</td><td>${esc(m.usuario)}</td><td>${esc(m.observacao)}</td></tr>`;
    }).join("")}
  </table></div>`;
}

function telaHistorico() {
  const opcoes = db.produtos.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join("");
  $("conteudo").innerHTML = `
    <h2>Histórico de movimentações</h2>
    <div class="cartao filtros">
      <label>Produto <select id="h-prod"><option value="">Todos</option>${opcoes}</select></label>
      <label>Tipo <select id="h-tipo"><option value="">Todos</option><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label>
      <label>De <input type="date" id="h-de"></label>
      <label>Até <input type="date" id="h-ate"></label>
    </div>
    <div class="cartao"><p id="h-totais"></p><div id="h-lista"></div></div>`;
  ["h-prod", "h-tipo", "h-de", "h-ate"].forEach(id => $(id).addEventListener("input", filtrarHistorico));
  filtrarHistorico();
}

function filtrarHistorico() {
  const prod = $("h-prod").value, tipo = $("h-tipo").value, de = $("h-de").value, ate = $("h-ate").value;
  const lista = [...db.movimentacoes].reverse().filter(m => {
    const dia = m.data.slice(0, 10);
    return (!prod || m.produto_id === Number(prod)) && (!tipo || m.tipo === tipo) && (!de || dia >= de) && (!ate || dia <= ate);
  });
  const ent = lista.filter(m => m.tipo === "entrada").reduce((s, m) => s + m.quantidade, 0);
  const sai = lista.filter(m => m.tipo === "saida").reduce((s, m) => s + m.quantidade, 0);
  $("h-totais").innerHTML = `Entraram <strong>${ent}</strong> unidade(s) • Saíram <strong>${sai}</strong> unidade(s)`;
  $("h-lista").innerHTML = tabelaMov(lista);
}

// ---------- Relatórios ----------
function telaRelatorios() {
  $("conteudo").innerHTML = `
    <h2>Relatórios</h2>
    <div class="cartao filtros nao-imprimir">
      <label>Tipo de relatório <select id="r-tipo">
        <option value="todos">Produtos cadastrados</option><option value="baixo">Estoque baixo</option>
        <option value="esgotado">Esgotados</option><option value="mov">Todas as movimentações</option>
        <option value="entrada">Entradas</option><option value="saida">Saídas</option></select></label>
      <button class="btn" onclick="window.print()">🖨️ Imprimir</button>
    </div>
    <div class="cartao"><h3 id="r-titulo"></h3><p><small>Gerado em ${new Date().toLocaleString("pt-BR")}</small></p><div id="r-lista"></div></div>`;
  $("r-tipo").addEventListener("input", gerarRelatorio);
  gerarRelatorio();
}

function gerarRelatorio() {
  const sel = $("r-tipo");
  const t = sel.value;
  $("r-titulo").textContent = "Relatório: " + sel.options[sel.selectedIndex].text;
  if (t === "todos") $("r-lista").innerHTML = tabelaProdutos(db.produtos, false);
  else if (t === "baixo" || t === "esgotado") $("r-lista").innerHTML = tabelaProdutos(db.produtos.filter(p => situacao(p).classe === t), false);
  else {
    const lista = [...db.movimentacoes].reverse().filter(m => t === "mov" || m.tipo === t);
    $("r-lista").innerHTML = tabelaMov(lista);
  }
}

iniciar();
