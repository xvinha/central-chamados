// frontend/js/main.js

// URL da API REST
const API_URL = 'http://localhost:3000/api/chamados'; 

// VARIÁVEL GLOBAL PARA O MODAL (INICIALIZADA CORRETAMENTE)
let modalEdicao = null;

// ##########################################
// 1. FUNÇÕES DE RENDERIZAÇÃO
// ##########################################

/**
 * Renderiza a lista na Tabela Admin (com botões de CRUD).
 */
function renderizarAdmin(chamados) {
    const tbody = document.getElementById('lista-chamados-admin');
    if (!tbody) {
        console.error('❌ Elemento lista-chamados-admin não encontrado');
        return;
    }
    
    tbody.innerHTML = ''; 

    if (chamados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum chamado encontrado</td></tr>';
        return;
    }

    chamados.forEach(chamado => {
        const row = tbody.insertRow();
        
        // Colunas
        row.insertCell().textContent = chamado.id;
        row.insertCell().textContent = chamado.titulo;
        
        // Coluna Status com Badge
        const statusCell = row.insertCell();
        const badgeClass = chamado.status === 'Aberto' ? 'bg-success' : 
                          (chamado.status === 'Em Andamento' ? 'bg-warning text-dark' : 'bg-secondary');
        statusCell.innerHTML = `<span class="badge ${badgeClass}">${chamado.status}</span>`;
        
        row.insertCell().textContent = chamado.prioridade;

        // Coluna de Ações (Botões)
        const acoesCell = row.insertCell();
        acoesCell.innerHTML = `
            <button class="btn btn-sm btn-info me-2" onclick="abrirModalEdicao(${chamado.id})">
                ✏️ Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmarExclusao(${chamado.id}, '${chamado.titulo.replace(/'/g, "\\'")}')">
                🗑️ Excluir
            </button>
        `;
    });

    console.log(`✅ ${chamados.length} chamados renderizados na tabela admin`);
}

/**
 * Renderiza a lista na Área Pública (em Cards).
 */
function renderizarPublico(chamados) {
    const listaDiv = document.getElementById('lista-chamados-publica');
    if (!listaDiv) {
        console.error('❌ Elemento lista-chamados-publica não encontrado');
        return;
    }
    
    listaDiv.innerHTML = ''; 

    if (chamados.length === 0) {
        listaDiv.innerHTML = '<div class="col-12"><div class="alert alert-info">📋 Nenhum chamado encontrado. Crie o primeiro!</div></div>';
        return;
    }

    chamados.forEach(chamado => {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 mb-4'; 

        const badgeClass = chamado.status === 'Aberto' ? 'bg-success' : 
                          (chamado.status === 'Em Andamento' ? 'bg-warning text-dark' : 'bg-secondary');

        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${chamado.titulo} <small class="text-muted">#${chamado.id}</small></h5>
                    <p class="card-text">
                        <span class="badge ${badgeClass}">${chamado.status}</span>
                        <span class="badge bg-light text-dark ms-2">${chamado.prioridade}</span>
                    </p>
                    <p class="card-text">${chamado.descricao.substring(0, 120)}${chamado.descricao.length > 120 ? '...' : ''}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <small class="text-muted">
                        📅 ${chamado.dataAbertura ? new Date(chamado.dataAbertura).toLocaleDateString('pt-BR') : 'Data não informada'}
                    </small>
                </div>
            </div>
        `;
        listaDiv.appendChild(card);
    });

    console.log(`✅ ${chamados.length} chamados renderizados nos cards públicos`);
}

// ##########################################
// 2. LÓGICA DE INTERAÇÃO COM A API (CRUD)
// ##########################################

// READ - Listar Chamados
async function carregarChamados() {
    console.log('🔄 Carregando chamados da API...');
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status} - ${response.statusText}`);
        }
        
        const chamados = await response.json();
        console.log('📡 Dados recebidos da API:', chamados);
        
        // Valida se é um array
        if (!Array.isArray(chamados)) {
            console.error("❌ API retornou dados inválidos:", typeof chamados);
            throw new Error("Formato de dados da API inválido - esperado array.");
        }
        
        // Renderiza em ambas as seções
        renderizarPublico(chamados);
        renderizarAdmin(chamados); 
        
        console.log(`✅ ${chamados.length} chamados carregados com sucesso`);
        
    } catch (error) {
        console.error("❌ Erro ao carregar chamados:", error);
        
        const mensagemErro = `
            <div class="alert alert-danger" role="alert">
                <h6>⚠️ Erro de Conectividade</h6>
                <p><strong>Não foi possível carregar os chamados.</strong></p>
                <hr>
                <p class="mb-0">
                    <small>
                        • Verifique se o backend está rodando: <code>node backend/src/index.js</code><br>
                        • URL da API: <a href="${API_URL}" target="_blank">${API_URL}</a><br>
                        • Erro: ${error.message}
                    </small>
                </p>
            </div>
        `;
        
        // Mostra erro em ambas as áreas
        const listaPublica = document.getElementById('lista-chamados-publica');
        if (listaPublica) {
            listaPublica.innerHTML = `<div class="col-12">${mensagemErro}</div>`;
        }
        
        const listaAdmin = document.getElementById('lista-chamados-admin');
        if (listaAdmin) {
            listaAdmin.innerHTML = `<tr><td colspan="5">${mensagemErro}</td></tr>`;
        }
    }
}

// CREATE - Criar Novo Chamado
async function criarNovoChamado(dadosChamado) {
    console.log('➕ Criando novo chamado:', dadosChamado);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dadosChamado), 
        });

        if (!response.ok) {
            let mensagemErro = `Erro HTTP ${response.status}`;
            try {
                const erro = await response.json();
                mensagemErro = erro.mensagem || mensagemErro;
            } catch (e) {
                mensagemErro = `${mensagemErro} - ${response.statusText}`;
            }
            throw new Error(mensagemErro);
        }

        const chamadoCriado = await response.json();
        console.log('✅ Chamado criado:', chamadoCriado);
        
        // Feedback visual
        mostrarNotificacao('Chamado criado com sucesso!', 'success');
        
        // Limpa formulário e recarrega
        const form = document.getElementById('form-novo-chamado');
        if (form) form.reset();
        
        await carregarChamados(); 
        
    } catch (error) {
        console.error("❌ Erro ao criar chamado:", error);
        mostrarNotificacao(`Erro ao criar chamado: ${error.message}`, 'error');
    }
}

// DELETE - Excluir Chamado
async function excluirChamado(id) {
    console.log(`🗑️ Excluindo chamado #${id}...`);
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.status === 204) {
            console.log(`✅ Chamado #${id} excluído com sucesso`);
            mostrarNotificacao(`Chamado #${id} excluído com sucesso!`, 'success');
            await carregarChamados(); 
        } else if (response.status === 404) {
            throw new Error(`Chamado #${id} não encontrado`);
        } else {
            throw new Error(`Erro HTTP ${response.status} - ${response.statusText}`);
        }

    } catch (error) {
        console.error("❌ Erro ao excluir chamado:", error);
        mostrarNotificacao(`Erro ao excluir chamado: ${error.message}`, 'error');
    }
}

// Confirmação de exclusão
window.confirmarExclusao = function(id, titulo) {
    if (confirm(`⚠️ Tem certeza que deseja excluir o chamado?\n\n#${id}: "${titulo}"\n\nEsta ação não pode ser desfeita.`)) {
        excluirChamado(id);
    }
};

// UPDATE - Abre o Modal de Edição
window.abrirModalEdicao = async function(id) {
    console.log(`✏️ Abrindo modal de edição para chamado #${id}...`);
    
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Chamado #${id} não encontrado (${response.status})`);
        }
        
        const chamado = await response.json();
        console.log('📄 Dados carregados para edição:', chamado);

        // Preenche o formulário do Modal
        document.getElementById('edit-id-display').textContent = chamado.id;
        document.getElementById('edit-id').value = chamado.id;
        document.getElementById('edit-titulo').value = chamado.titulo;
        document.getElementById('edit-descricao').value = chamado.descricao;
        document.getElementById('edit-status').value = chamado.status;
        document.getElementById('edit-prioridade').value = chamado.prioridade;

        // Abre o modal
        if (modalEdicao) {
            modalEdicao.show();
        } else {
            console.error('❌ Modal não foi inicializado');
            alert('Erro: Modal não foi inicializado corretamente');
        }
        
    } catch (error) {
        console.error("❌ Erro ao carregar dados para edição:", error);
        mostrarNotificacao(`Erro ao carregar chamado: ${error.message}`, 'error');
    }
};

// UPDATE - Salva as Alterações
async function salvarEdicao(event) {
    event.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const dadosAtualizados = {
        titulo: document.getElementById('edit-titulo').value.trim(),
        descricao: document.getElementById('edit-descricao').value.trim(),
        status: document.getElementById('edit-status').value,
        prioridade: document.getElementById('edit-prioridade').value,
    };

    console.log(`💾 Salvando edição do chamado #${id}:`, dadosAtualizados);

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dadosAtualizados), 
        });

        if (!response.ok) {
            let mensagemErro = `Erro HTTP ${response.status}`;
            try {
                const erro = await response.json();
                mensagemErro = erro.mensagem || mensagemErro;
            } catch (e) {
                mensagemErro = `${mensagemErro} - ${response.statusText}`;
            }
            throw new Error(mensagemErro);
        }

        const chamadoAtualizado = await response.json();
        console.log('✅ Chamado atualizado:', chamadoAtualizado);
        
        mostrarNotificacao(`Chamado #${id} atualizado com sucesso!`, 'success');
        
        // Fecha modal e recarrega
        if (modalEdicao) {
            modalEdicao.hide();
        }
        await carregarChamados();
        
    } catch (error) {
        console.error("❌ Erro ao atualizar chamado:", error);
        mostrarNotificacao(`Erro ao atualizar chamado: ${error.message}`, 'error');
    }
}

// ##########################################
// 3. UTILITÁRIOS
// ##########################################

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remove notificações antigas
    const notificacoesAntigas = document.querySelectorAll('.notificacao-toast');
    notificacoesAntigas.forEach(n => n.remove());
    
    const cores = {
        success: 'alert-success',
        error: 'alert-danger', 
        info: 'alert-info',
        warning: 'alert-warning'
    };
    
    const iconePor = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    const notificacao = document.createElement('div');
    notificacao.className = `alert ${cores[tipo] || cores.info} alert-dismissible fade show notificacao-toast`;
    notificacao.style.position = 'fixed';
    notificacao.style.top = '20px';
    notificacao.style.right = '20px';
    notificacao.style.zIndex = '1050';
    notificacao.style.minWidth = '300px';
    
    notificacao.innerHTML = `
        ${iconePor[tipo] || iconePor.info} ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notificacao);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.remove();
        }
    }, 5000);
}

// ##########################################
// 4. INICIALIZAÇÃO E EVENT LISTENERS
// ##########################################

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando aplicação...');
    
    try {
        // 1. Inicializar Modal Bootstrap
        const modalElement = document.getElementById('modalEdicao');
        if (modalElement && typeof bootstrap !== 'undefined') {
            modalEdicao = new bootstrap.Modal(modalElement);
            console.log('✅ Modal Bootstrap inicializado');
        } else {
            console.error('❌ Modal ou Bootstrap não encontrado');
        }
        
        // 2. Configurar Event Listeners
        
        // Formulário de Novo Chamado
        const formNovo = document.getElementById('form-novo-chamado');
        if (formNovo) {
            formNovo.addEventListener('submit', (event) => {
                event.preventDefault(); 
                
                const dados = {
                    titulo: document.getElementById('titulo').value.trim(),
                    descricao: document.getElementById('descricao').value.trim(),
                    prioridade: document.getElementById('prioridade').value,
                };
                
                // Validação básica
                if (!dados.titulo || !dados.descricao) {
                    mostrarNotificacao('Preencha todos os campos obrigatórios', 'warning');
                    return;
                }
                
                criarNovoChamado(dados);
            });
            console.log('✅ Listener do formulário de criação configurado');
        } else {
            console.error('❌ Formulário de novo chamado não encontrado');
        }

        // Formulário de Edição
        const formEdicao = document.getElementById('form-edicao');
        if (formEdicao) {
            formEdicao.addEventListener('submit', salvarEdicao);
            console.log('✅ Listener do formulário de edição configurado');
        } else {
            console.error('❌ Formulário de edição não encontrado');
        }
        
        // 3. Carregar dados iniciais
        console.log('📡 Carregando dados iniciais...');
        await carregarChamados();
        
        console.log('🎉 Aplicação inicializada com sucesso!');
        mostrarNotificacao('Sistema carregado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        mostrarNotificacao(`Erro na inicialização: ${error.message}`, 'error');
    }
});

// Função global para debug
window.debugApp = function() {
    console.log('🐛 Estado da aplicação:');
    console.log('- API_URL:', API_URL);
    console.log('- modalEdicao:', modalEdicao);
    console.log('- Bootstrap disponível:', typeof bootstrap !== 'undefined');
    console.log('- Elementos encontrados:', {
        'lista-chamados-publica': !!document.getElementById('lista-chamados-publica'),
        'lista-chamados-admin': !!document.getElementById('lista-chamados-admin'),
        'modalEdicao': !!document.getElementById('modalEdicao'),
        'form-novo-chamado': !!document.getElementById('form-novo-chamado'),
        'form-edicao': !!document.getElementById('form-edicao')
    });
    
    // Teste rápido da API
    fetch(API_URL)
        .then(r => r.json())
        .then(data => console.log('📡 Teste API:', data))
        .catch(e => console.log('❌ API inacessível:', e.message));
};