document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.location.port === '3000' ? '/api' : 'http://localhost:3000/api';
    const token = localStorage.getItem('adminToken');

    const tbody = document.querySelector('.admin-table tbody');
    const tableCounter = document.querySelector('.table-header span');
    const summaryNumbers = document.querySelectorAll('.summary-card strong');
    const buscaForm = document.querySelector('.search-box');
    const buscaInput = document.getElementById('busca-produto');
    const chips = document.querySelectorAll('.filter-chip');

    let categoriaAtual = 'Todos';
    let produtos = [];

    function fp(valor) {
        return 'R$ ' + Number(valor || 0).toFixed(2).replace('.', ',');
    }

    function escapar(texto) {
        const div = document.createElement('div');
        div.textContent = String(texto ?? '');
        return div.innerHTML;
    }

    function categoriaNome(produto) {
        return produto.categoria?.nome || produto.categoria || 'Sem categoria';
    }

    function imagemProduto(produto) {
        return produto.imagemUrl || produto.img || 'https://placehold.co/120x120/2f4f3e/ffffff?text=Produto';
    }

    function badgeStatus(produto) {
        const status = String(produto.status || '').toLowerCase();
        const estoque = Number(produto.estoque || 0);
        const inativo = estoque <= 0 || ['rascunho', 'oculto', 'inativo', 'indisponível', 'indisponivel'].includes(status);
        const baixo = estoque > 0 && estoque <= 5;
        if (inativo) return { classe: 'status-inactive', texto: produto.status || 'Inativo' };
        if (baixo) return { classe: 'status-low', texto: 'Estoque baixo' };
        return { classe: 'status-active', texto: produto.status || 'Ativo' };
    }

    function atualizarResumo(listaCompleta) {
        const categorias = new Set(listaCompleta.map(categoriaNome)).size;
        const destaque = listaCompleta.filter(p => p.destaque).length;
        const baixo = listaCompleta.filter(p => Number(p.estoque || 0) <= 5).length;
        if (summaryNumbers[0]) summaryNumbers[0].textContent = String(listaCompleta.length);
        if (summaryNumbers[1]) summaryNumbers[1].textContent = String(categorias);
        if (summaryNumbers[2]) summaryNumbers[2].textContent = String(destaque);
        if (summaryNumbers[3]) summaryNumbers[3].textContent = String(baixo);
    }

    function renderizar() {
        if (!tbody) return;
        const termo = (buscaInput?.value || '').trim().toLowerCase();
        const filtrados = produtos.filter(p => {
            const cat = categoriaNome(p);
            const passaCategoria = categoriaAtual === 'Todos' || cat === categoriaAtual;
            const passaBusca = !termo || String(p.nome || '').toLowerCase().includes(termo);
            return passaCategoria && passaBusca;
        });

        tbody.innerHTML = filtrados.length ? filtrados.map(p => {
            const badge = badgeStatus(p);
            const id = encodeURIComponent(p.id);
            return `
                <tr data-id="${escapar(p.id)}">
                    <td><img src="${escapar(imagemProduto(p))}" alt="${escapar(p.nome)}" onerror="this.src='https://placehold.co/120x120/2f4f3e/ffffff?text=Produto'"></td>
                    <td>${escapar(p.nome || 'Produto sem nome')}</td>
                    <td>${escapar(categoriaNome(p))}</td>
                    <td>${fp(p.preco)}</td>
                    <td>${Number(p.estoque || 0)} un.</td>
                    <td><span class="status-badge ${badge.classe}">${escapar(badge.texto)}</span></td>
                    <td>
                        <div class="action-group">
                            <a class="action-button action-view" href="produto.html?id=${id}">Visualizar</a>
                            <a class="action-button action-edit" href="produto-admin.html?id=${id}">Editar</a>
                            <button class="action-button action-delete" type="button" data-delete-id="${escapar(p.id)}">Excluir</button>
                        </div>
                    </td>
                </tr>`;
        }).join('') : '<tr><td colspan="7">Nenhum produto encontrado.</td></tr>';

        if (tableCounter) {
            tableCounter.textContent = `${filtrados.length} registro${filtrados.length === 1 ? '' : 's'} visual${filtrados.length === 1 ? '' : 'is'}`;
        }
        atualizarResumo(produtos);
    }

    async function carregarProdutos() {
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="7">Carregando produtos do banco...</td></tr>';
        try {
            const resposta = await fetch(`${API_BASE}/produtos?limite=200&ordenar=recentes`, { cache: 'no-store' });
            const data = await resposta.json().catch(() => ({}));
            if (!resposta.ok) throw new Error(data.message || 'Falha ao carregar produtos.');
            produtos = Array.isArray(data.produtos) ? data.produtos : [];
            renderizar();
        } catch (err) {
            produtos = [];
            tbody.innerHTML = `<tr><td colspan="7">${escapar(err.message || 'Backend indisponível. Suba o servidor em http://localhost:3000.')}</td></tr>`;
            atualizarResumo([]);
        }
    }

    tbody?.addEventListener('click', async e => {
        const botao = e.target.closest('[data-delete-id]');
        if (!botao) return;
        const id = botao.dataset.deleteId;
        const produto = produtos.find(p => String(p.id) === String(id));
        const nome = produto?.nome || 'este produto';
        const ok = confirm(`Excluir ${nome} do banco de dados?`);
        if (!ok) return;
        if (!token) {
            alert('Sessão administrativa expirada. Entre novamente.');
            window.location.href = 'login.html';
            return;
        }

        botao.disabled = true;
        try {
            const resposta = await fetch(`${API_BASE}/produtos/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!resposta.ok && resposta.status !== 204) {
                const data = await resposta.json().catch(() => ({}));
                throw new Error(data.message || 'Não foi possível excluir o produto.');
            }
            produtos = produtos.filter(p => String(p.id) !== String(id));
            renderizar();
        } catch (err) {
            alert(err.message || 'Erro ao excluir produto.');
            botao.disabled = false;
        }
    });

    buscaForm?.addEventListener('submit', e => {
        e.preventDefault();
        renderizar();
    });
    buscaInput?.addEventListener('input', renderizar);

    chips.forEach(chip => {
        chip.addEventListener('click', e => {
            e.preventDefault();
            chips.forEach(c => c.classList.remove('is-selected'));
            chip.classList.add('is-selected');
            categoriaAtual = chip.textContent.trim();
            renderizar();
        });
    });

    carregarProdutos();
});
