<?php
// ============================================================
// StockTech — Etapa 9: Dashboard (index.php)
// Página inicial com o resumo do estoque:
//   - cartões com os totais
//   - lista de produtos com estoque baixo ou esgotados
//   - últimas movimentações
// ============================================================
require_once __DIR__ . '/includes/verificar_login.php';
require_once __DIR__ . '/config/conexao.php';

// ---------- 1. Totais (uma consulta só) ----------
$resumo = $conexao->query(
    'SELECT
        COUNT(*)                                                       AS total_produtos,
        COALESCE(SUM(quantidade), 0)                                   AS total_unidades,
        COALESCE(SUM(quantidade * preco), 0)                           AS valor_estoque,
        COALESCE(SUM(quantidade > 0 AND quantidade <= estoque_minimo), 0) AS estoque_baixo,
        COALESCE(SUM(quantidade = 0), 0)                               AS esgotados
       FROM produtos'
)->fetch();

$total_categorias = $conexao->query('SELECT COUNT(*) FROM categorias')->fetchColumn();

// Movimentações feitas hoje
$hoje = $conexao->query(
    "SELECT
        COALESCE(SUM(tipo = 'entrada'), 0) AS entradas,
        COALESCE(SUM(tipo = 'saida'), 0)   AS saidas
       FROM movimentacoes
      WHERE DATE(criado_em) = CURDATE()"
)->fetch();

// ---------- 2. Produtos que precisam de atenção ----------
$alertas = $conexao->query(
    'SELECT codigo, nome, quantidade, estoque_minimo
       FROM produtos
      WHERE quantidade <= estoque_minimo
      ORDER BY quantidade ASC, nome
      LIMIT 10'
)->fetchAll();

// ---------- 3. Últimas movimentações ----------
$ultimas = $conexao->query(
    'SELECT m.tipo, m.quantidade, m.criado_em, p.nome AS produto, u.nome AS usuario
       FROM movimentacoes m
       JOIN produtos p ON p.id = m.produto_id
       LEFT JOIN usuarios u ON u.id = m.usuario_id
      ORDER BY m.criado_em DESC, m.id DESC
      LIMIT 5'
)->fetchAll();

$titulo = 'Início';
require_once __DIR__ . '/includes/topo.php';
?>

<h1>Olá, <?= htmlspecialchars($_SESSION['usuario_nome']) ?>!</h1>
<p>Resumo do seu estoque hoje, <?= date('d/m/Y') ?>.</p>

<div class="painel">
    <div class="cartao indicador">
        <span>Produtos cadastrados</span>
        <strong><?= $resumo['total_produtos'] ?></strong>
    </div>
    <div class="cartao indicador">
        <span>Unidades em estoque</span>
        <strong><?= $resumo['total_unidades'] ?></strong>
    </div>
    <div class="cartao indicador">
        <span>Valor total do estoque</span>
        <strong>R$ <?= number_format($resumo['valor_estoque'], 2, ',', '.') ?></strong>
    </div>
    <div class="cartao indicador">
        <span>Categorias</span>
        <strong><?= $total_categorias ?></strong>
    </div>
    <div class="cartao indicador alerta-baixo">
        <span>Estoque baixo</span>
        <strong><?= $resumo['estoque_baixo'] ?></strong>
    </div>
    <div class="cartao indicador alerta-esgotado">
        <span>Esgotados</span>
        <strong><?= $resumo['esgotados'] ?></strong>
    </div>
    <div class="cartao indicador">
        <span>Movimentações hoje</span>
        <strong><?= $hoje['entradas'] ?> entr. / <?= $hoje['saidas'] ?> saídas</strong>
    </div>
</div>

<div class="cartao" style="overflow-x:auto">
    <h2>Precisam de reposição</h2>
    <?php if (!$alertas): ?>
        <p>Tudo certo! Nenhum produto com estoque baixo.</p>
    <?php else: ?>
        <table>
            <tr><th>Código</th><th>Produto</th><th>Qtd.</th><th>Mínimo</th><th>Situação</th></tr>
            <?php foreach ($alertas as $a): ?>
                <tr>
                    <td><?= htmlspecialchars($a['codigo']) ?></td>
                    <td><?= htmlspecialchars($a['nome']) ?></td>
                    <td><?= $a['quantidade'] ?></td>
                    <td><?= $a['estoque_minimo'] ?></td>
                    <td>
                        <?php if ($a['quantidade'] == 0): ?>
                            <span class="etiqueta esgotado">Esgotado</span>
                        <?php else: ?>
                            <span class="etiqueta baixo">Estoque baixo</span>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
        </table>
    <?php endif; ?>
</div>

<div class="cartao" style="overflow-x:auto">
    <h2>Últimas movimentações</h2>
    <?php if (!$ultimas): ?>
        <p>Nenhuma movimentação registrada ainda.</p>
    <?php else: ?>
        <table>
            <tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Qtd.</th><th>Usuário</th></tr>
            <?php foreach ($ultimas as $m): ?>
                <tr>
                    <td><?= date('d/m/Y H:i', strtotime($m['criado_em'])) ?></td>
                    <td><?= htmlspecialchars($m['produto']) ?></td>
                    <td><?= $m['tipo'] === 'entrada' ? '<span class="etiqueta normal">Entrada</span>' : '<span class="etiqueta esgotado">Saída</span>' ?></td>
                    <td><?= $m['quantidade'] ?></td>
                    <td><?= htmlspecialchars($m['usuario'] ?? 'Usuário removido') ?></td>
                </tr>
            <?php endforeach; ?>
        </table>
        <p><a href="estoque/historico.php">Ver histórico completo →</a></p>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/rodape.php'; ?>
