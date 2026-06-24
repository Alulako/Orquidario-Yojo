document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.location.port === '3000' ? '/api' : 'http://localhost:3000/api';
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');

    if (!token || !email) {
        window.location.href = 'login.html';
        return;
    }

    document.querySelectorAll('a[href="login.html"]').forEach(link => {
        link.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('adminName');
            localStorage.removeItem('adminGoogleCredential');
        });
    });

    const form = document.querySelector('.product-form');
    const inputImagem = document.getElementById('imagem-produto');
    const previewImg = document.querySelector('.preview-frame img');
    const previewBadge = document.querySelector('.preview-badge');
    const previewTitulo = document.querySelector('.preview-meta h3');
    const previewPreco = document.querySelector('.preview-meta p');
    const feedback = document.querySelector('.page-text');
    const tituloPagina = document.querySelector('.page-header h1');
    const subtituloFormulario = document.querySelector('.section-head p');

    let arquivoSelecionado = null;
    let categorias = [];
    const produtoEditId = new URLSearchParams(window.location.search).get('id');

    if (inputImagem) inputImagem.accept = 'image/*';

    function setFeedback(texto, erro = false) {
        if (!feedback) return;
        feedback.textContent = texto;
        feedback.style.color = erro ? '#9d2f2f' : '';
    }

    function parsePreco(valor) {
        const limpo = String(valor || '').replace(/[^0-9,.-]/g, '').replace('.', '').replace(',', '.');
        return Number(limpo) || 0;
    }

    function formatarPreco(valor) {
        return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
    }

    function categoriaAtualNome() {
        return document.getElementById('categoria')?.value || 'Orquídeas';
    }

    function idCategoriaPorNome(nome) {
        const cat = categorias.find(c => c.nome === nome);
        return cat?.id || '';
    }

    function atualizarPreview() {
        const nome = document.getElementById('nome-produto')?.value?.trim() || 'Produto sem nome';
        const categoria = categoriaAtualNome();
        const preco = parsePreco(document.getElementById('preco')?.value);
        if (previewTitulo) previewTitulo.textContent = nome;
        if (previewBadge) previewBadge.textContent = categoria;
        if (previewPreco) previewPreco.textContent = formatarPreco(preco);
    }

    ['nome-produto', 'categoria', 'preco'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', atualizarPreview);
        document.getElementById(id)?.addEventListener('change', atualizarPreview);
    });

    function setValor(id, valor) {
        const el = document.getElementById(id);
        if (el) el.value = valor ?? '';
    }

    function normalizarProduto(data) {
        const p = data?.produto || data;
        return p || null;
    }

    async function carregarCategorias() {
        try {
            const resposta = await fetch(`${API_BASE}/categorias`, { cache: 'no-store' });
            const data = await resposta.json().catch(() => ({}));
            if (!resposta.ok) throw new Error(data.message || 'Falha ao carregar categorias.');
            categorias = Array.isArray(data.categorias) ? data.categorias : [];

            const select = document.getElementById('categoria');
            if (select && categorias.length) {
                const valorAtual = select.value;
                select.innerHTML = categorias.map(c => `<option>${c.nome}</option>`).join('');
                if ([...select.options].some(o => o.value === valorAtual)) select.value = valorAtual;
            }
        } catch {
            categorias = [
                { id: 1, nome: 'Orquídeas' },
                { id: 2, nome: 'Adubos' },
                { id: 3, nome: 'Vasos' },
                { id: 4, nome: 'Acessórios' },
            ];
        }
    }

    async function carregarProdutoParaEdicao() {
        if (!produtoEditId) return;
        try {
            setFeedback('Carregando produto do banco para edição...');
            const resposta = await fetch(`${API_BASE}/produtos/id/${encodeURIComponent(produtoEditId)}`, { cache: 'no-store' });
            const data = await resposta.json().catch(() => ({}));
            if (!resposta.ok) throw new Error(data.message || 'Produto não encontrado.');
            const produto = normalizarProduto(data);
            if (!produto) throw new Error('Produto não encontrado.');

            setValor('nome-produto', produto.nome || '');
            setValor('categoria', produto.categoria?.nome || 'Orquídeas');
            setValor('preco', formatarPreco(produto.preco || 0));
            setValor('estoque', produto.estoque || 0);
            setValor('disponibilidade', produto.status || (Number(produto.estoque || 0) > 0 ? 'Disponível' : 'Indisponível'));
            setValor('descricao-curta', produto.resumo || '');
            setValor('descricao-completa', produto.descricao || produto.resumo || '');
            setValor('destaque', produto.destaque ? 'Sim' : 'Não');
            setValor('status', produto.status || 'Ativo');

            if (previewImg && produto.imagemUrl) previewImg.src = produto.imagemUrl;
            if (tituloPagina) tituloPagina.textContent = 'Editar produto';
            if (subtituloFormulario) subtituloFormulario.textContent = 'Altere os campos necessários e salve para atualizar o banco de dados.';
            document.title = 'Editar Produto | Orquidário Yojo';
            setFeedback('Editando produto real salvo no PostgreSQL.');
            atualizarPreview();
        } catch (err) {
            setFeedback(err.message || 'Não foi possível carregar o produto.', true);
        }
    }

    inputImagem?.addEventListener('change', () => {
        const file = inputImagem.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setFeedback('Selecione um arquivo de imagem válido.', true);
            inputImagem.value = '';
            return;
        }
        arquivoSelecionado = file;
        const reader = new FileReader();
        reader.onload = () => {
            if (previewImg) previewImg.src = String(reader.result || '');
            setFeedback('Imagem selecionada. Confira a pré-visualização antes de salvar.');
        };
        reader.readAsDataURL(file);
    });

    form?.addEventListener('submit', async e => {
        e.preventDefault();

        const nome = document.getElementById('nome-produto')?.value?.trim();
        const categoria = categoriaAtualNome();
        const preco = parsePreco(document.getElementById('preco')?.value);
        const estoque = Number(document.getElementById('estoque')?.value || 0);
        const disponibilidade = document.getElementById('disponibilidade')?.value || 'Disponível';
        const resumo = document.getElementById('descricao-curta')?.value?.trim() || '';
        const descricao = document.getElementById('descricao-completa')?.value?.trim() || resumo;
        const destaque = document.getElementById('destaque')?.value === 'Sim';
        const status = document.getElementById('status')?.value || disponibilidade || 'Ativo';

        if (!nome) { setFeedback('Informe o nome do produto.', true); return; }
        if (!preco || preco <= 0) { setFeedback('Informe um preço válido.', true); return; }

        const categoryId = idCategoriaPorNome(categoria);
        if (!categoryId) { setFeedback('Categoria inválida. Recarregue a página e tente novamente.', true); return; }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('categoria', categoria);
        formData.append('categoryId', String(categoryId));
        formData.append('preco', String(preco));
        formData.append('estoque', String(estoque));
        formData.append('disponibilidade', disponibilidade);
        formData.append('status', status);
        formData.append('resumo', resumo);
        formData.append('descricao', descricao);
        formData.append('destaque', String(destaque));
        if (arquivoSelecionado) formData.append('imagem', arquivoSelecionado);

        const editando = Boolean(produtoEditId);
        const url = editando
            ? `${API_BASE}/produtos/${encodeURIComponent(produtoEditId)}`
            : `${API_BASE}/produtos`;

        try {
            setFeedback(editando ? 'Atualizando produto no banco...' : 'Salvando produto no banco...');
            const resposta = await fetch(url, {
                method: editando ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await resposta.json().catch(() => ({}));
            if (!resposta.ok) throw new Error(data.message || 'Não foi possível salvar o produto.');

            setFeedback(editando ? 'Produto atualizado no banco. Voltando ao painel.' : 'Produto cadastrado no banco. Voltando ao painel.');
            alert(editando ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
            window.location.href = 'admin.html';
        } catch (err) {
            setFeedback(err.message || 'Erro ao salvar produto no banco.', true);
        }
    });

    async function iniciar() {
        await carregarCategorias();
        await carregarProdutoParaEdicao();
        atualizarPreview();
    }

    iniciar();
});
