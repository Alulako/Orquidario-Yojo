document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.location.port === '3000' ? '/api' : 'http://localhost:3000/api';
    const botao = document.querySelector('.google-button');
    const nota = document.querySelector('.login-note');

    function avisar(texto, erro = false) {
        if (!nota) return;
        nota.textContent = texto;
        nota.style.color = erro ? '#9d2f2f' : '';
    }

    function carregarScriptGoogle() {
        return new Promise((resolve, reject) => {
            if (window.google?.accounts?.id) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function buscarConfigGoogle() {
        const resposta = await fetch(`${API_BASE}/auth/google/config`, { cache: 'no-store' });
        const data = await resposta.json().catch(() => ({}));
        if (!resposta.ok || !data.clientId) {
            throw new Error(data.message || 'Google Client ID não configurado no backend.');
        }
        return data.clientId;
    }

    async function autenticarNoBackend(credential) {
        const resposta = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        });
        const data = await resposta.json().catch(() => ({}));
        if (!resposta.ok || !data.token) {
            throw new Error(data.message || 'Conta Google não autorizada para o painel.');
        }
        localStorage.setItem('adminEmail', data.user?.email || '');
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminName', data.user?.nome || 'Administrador');
        window.location.href = 'admin.html';
    }

    async function iniciarLoginGoogle() {
        try {
            avisar('Carregando login Google...');
            const clientId = await buscarConfigGoogle();
            await carregarScriptGoogle();

            if (!window.google?.accounts?.id) {
                throw new Error('Google Identity Services não carregou.');
            }

            window.google.accounts.id.initialize({
                client_id: clientId,
                ux_mode: 'popup',
                auto_select: false,
                callback: async resposta => {
                    try {
                        avisar('Validando conta Google autorizada...');
                        await autenticarNoBackend(resposta.credential);
                    } catch (err) {
                        avisar(err.message || 'Conta Google não autorizada.', true);
                    }
                }
            });

            if (botao) {
                botao.innerHTML = '';
                window.google.accounts.id.renderButton(botao, {
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'pill',
                    width: 260
                });
            }

            avisar('Entre com a conta Google autorizada para acessar o painel.');
        } catch (err) {
            avisar(err.message || 'Não foi possível iniciar o login Google.', true);
        }
    }

    iniciarLoginGoogle();
});
