document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = window.location.port === '3000' ? '/api' : 'http://localhost:3000/api';
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');

    function limparSessao() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminName');
    }

    if (!token || !email) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const resposta = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
        });
        if (!resposta.ok) throw new Error('Sessão inválida');
    } catch {
        limparSessao();
        window.location.href = 'login.html';
        return;
    }

    document.querySelectorAll('a[href="login.html"]').forEach(link => {
        link.addEventListener('click', () => {
            limparSessao();
        });
    });
});
