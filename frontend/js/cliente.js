// frontend/js/cliente.js
// JavaScript para o Portal do Cliente

const API_URL = 'http://localhost:3000/api/chamados';
let chamadosData = [];
let chamadosFiltrados = [];

// ==========================================
// 1. CARREGAMENTO E RENDERIZAÇÃO
// ==========================================

async function carregarChamados() {
    console.log('📡 Carregando chamados para cliente...');
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        
        chamadosData = await response.json();
        chamadosFiltrados = [...chamadosData];
        
        console.log(`✅ ${chamadosData.length} chamados carregados`);
        
        renderizarChamados(chamadosData);
        atualizarEstatisticas(chamadosData);
        
    } catch (error) {
        console.error('❌ Erro ao carregar chamados:', error);
        mostrarErro('Não foi possível carregar os chamados. Verifique sua conexão.');
    }
}

function renderizarChamados(chamados) {
    const container = document.getElementById('lista-chamados');
    
    if (chamados.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="card text-center">
                    <div class="card-body">
                        <h5>📭 Nenhum chamado encontrado</h5>
                        <p class="text-muted">Ainda não há chamados ou nenhum chamado corresponde aos filtros aplicados.</p>
                        <a href="#novo-chamado" class="btn btn-primary">➕ Abrir Primeiro Chamado</a>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = chamados.map(chamado => {
        const statusClass = getStatusClass(chamado.status);
        const prioridadeIcon = getPrioridadeIcon(chamado.prioridade);
        const dataFormatada = formatarData(chamado.dataAbertura);
        
        return `
            <div class="col-lg-6 col-xl-4 mb-4">
                <div class="card card-chamado h-100 ${statusClass}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h6 class="card-title text-primary fw-bold mb-0">
                                #${chamado.id}
                            </h6>
                            <span class="badge ${getStatusBadge(chamado.status)}">
                                ${chamado.status}
                            </span>
                        </div>
                        
                        <h5 class="card-title">${chamado.titulo}</h5>
                        
                        <p class="card-text text-muted small">
                            ${chamado.descricao.length > 100 ? 
                                chamado.descricao.substring(0, 100) + '...' : 
                                chamado.descricao}
                        </p>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <small class="text-muted">
                                    ${prioridadeIcon} ${chamado.prioridade}
                                </small>
                                ${chamado.categoria ? 
                                    `<br><small class="text-info">📂 ${chamado.categoria}</small>` : 
                                    ''}
                            </div>
                            <div class="text-end">
                                <small class="text-muted d-block">📅 ${dataFormatada}</small>
                                <button class="btn btn-outline-primary btn-sm mt-1" 
                                        onclick="verDetalhes(${chamado.id})">
                                    👁️ Ver Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`✅ ${chamados.length} chamados renderizados`);
}

function atualizarEstatisticas(chamados) {
    const total = chamados.length;
    const abertos = chamados.filter(c => c.status === 'Aberto').length;
    const andamento = chamados.filter(c => c.status === 'Em Andamento').length;
    const fechados = chamados.filter(c => c.status === 'Fechado').length;
    
    document.getElementById('total-chamados').textContent = total;
    document.getElementById('chamados-abertos').textContent = abertos;
    document.getElementById('chamados-resolvidos').textContent = fechados;
}

// ==========================================
// 2. SISTEMA DE FILTROS
// ==========================================

function aplicarFiltros() {
    const filtroStatus = document.getElementById('filtro-status').value;
    const filtroPrioridade = document.getElementById('filtro-prioridade').value;
    const filtroBusca = document.getElementById('filtro-busca').value.toLowerCase();
    
    chamadosFiltrados = chamadosData.filter(chamado => {
        const matchStatus = !filtroStatus || chamado.status === filtroStatus;
        const matchPrioridade = !filtroPrioridade || chamado.prioridade === filtroPrioridade;
        const matchBusca = !filtroBusca || 
            chamado.titulo.toLowerCase().includes(filtroBusca) ||
            chamado.descricao.toLowerCase().includes(filtroBusca);
        
        return matchStatus && matchPrioridade && matchBusca;
    });
    
    renderizarChamados(chamadosFiltrados);
    console.log(`🔍 Filtros aplicados: ${chamadosFiltrados.length} de ${chamadosData.length} chamados`);
}

// ==========================================
// 3. CRUD - CRIAR CHAMADO
// ==========================================

async function criarChamado(dados) {
    console.log('➕ Criando novo chamado:', dados);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            let mensagem = 'Erro ao criar chamado';
            try {
                const erro = await response.json();
                mensagem = erro.mensagem || mensagem;
            } catch (e) {
                mensagem = `HTTP ${response.status} - ${response.statusText}`;
            }
            throw new Error(mensagem);
        }
        
        const chamadoCriado = await response.json();
        console.log('✅ Chamado criado:', chamadoCriado);
        
        mostrarSucesso(`Chamado #${chamadoCriado.id} criado com sucesso! 🎉`);
        
        // Limpa formulário e recarrega dados
        document.getElementById('form-novo-chamado').reset();
        await carregarChamados();
        
        // Rolar para seção de chamados
        document.getElementById('meus-chamados').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ Erro ao criar chamado:', error);
        mostrarErro(`Erro ao criar chamado: ${error.message}`);
    }
}

// ==========================================
// 4. DETALHES DO CHAMADO
// ==========================================

function verDetalhes(id) {
    const chamado = chamadosData.find(c => c.id === id);
    if (!chamado) {
        mostrarErro('Chamado não encontrado');
        return;
    }
    
    // Preenche modal com detalhes
    document.getElementById('detalhe-id').textContent = chamado.id;
    document.getElementById('detalhe-status').innerHTML = `<span class="badge ${getStatusBadge(chamado.status)}">${chamado.status}</span>`;
    document.getElementById('detalhe-prioridade').innerHTML = `${getPrioridadeIcon(chamado.prioridade)} ${chamado.prioridade}`;
    document.getElementById('detalhe-data').textContent = formatarDataCompleta(chamado.dataAbertura);
    document.getElementById('detalhe-categoria').textContent = chamado.categoria || 'Não informada';
    document.getElementById('detalhe-titulo').textContent = chamado.titulo;
    document.getElementById('detalhe-descricao').textContent = chamado.descricao;
    
    // Abre modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetalhes'));
    modal.show();
}

// ==========================================
// 5. UTILITÁRIOS
// ==========================================

function getStatusClass(status) {
    const classes = {
        'Aberto': 'status-aberto',
        'Em Andamento': 'status-andamento', 
        'Fechado': 'status-fechado'
    };
    return classes[status] || '';
}

function getStatusBadge(status) {
    const badges = {
        'Aberto': 'bg-success',
        'Em Andamento': 'bg-warning text-dark',
        'Fechado': 'bg-secondary'
    };
    return badges[status] || 'bg-primary';
}

function getPrioridadeIcon(prioridade) {
    const icones = {
        'Alta': '🔴',
        'Média': '🟡', 
        'Baixa': '🟢'
    };
    return icones[prioridade] || '⚪';
}

function formatarData(dataString) {
    if (!dataString) return 'Data não informada';
    
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}

function formatarDataCompleta(dataString) {
    if (!dataString) return 'Data não informada';
    
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}

function mostrarSucesso(mensagem) {
    mostrarNotificacao(mensagem, 'success');
}

function mostrarErro(mensagem) {
    mostrarNotificacao(mensagem, 'error');
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remove notificações antigas
    document.querySelectorAll('.toast-notification').forEach(n => n.remove());
    
    const cores = {
        success: 'alert-success',
        error: 'alert-danger',
        info: 'alert-info',
        warning: 'alert-warning'
    };
    
    const icones = {
        success: '✅',
        error: '❌', 
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    const toast = document.createElement('div');
    toast.className = `alert ${cores[tipo]} alert-dismissible fade show toast-notification`;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '1060';
    toast.style.minWidth = '300px';
    toast.style.maxWidth = '400px';
    
    toast.innerHTML = `
        ${icones[tipo]} ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// ==========================================
// 6. INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando Portal do Cliente...');
    
    try {
        // Carregar dados iniciais
        await carregarChamados();
        
        // Configurar formulário de novo chamado
        const formNovoChamado = document.getElementById('form-novo-chamado');
        if (formNovoChamado) {
            formNovoChamado.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Coletar dados do formulário
                const formData = new FormData(formNovoChamado);
                const dados = Object.fromEntries(formData);
                
                // Validação básica
                if (!dados.titulo.trim() || !dados.descricao.trim()) {
                    mostrarErro('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }
                
                // Limpar espaços em branco
                dados.titulo = dados.titulo.trim();
                dados.descricao = dados.descricao.trim();
                if (dados.contato) dados.contato = dados.contato.trim();
                
                await criarChamado(dados);
            });
            
            console.log('✅ Formulário de criação configurado');
        }
        
        // Configurar scroll suave para links internos
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        console.log('🎉 Portal do Cliente inicializado com sucesso!');
        mostrarSucesso('Portal carregado com sucesso! 🎉');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        mostrarErro(`Erro ao inicializar: ${error.message}`);
    }
});

// ==========================================
// 7. FUNÇÕES GLOBAIS DE DEBUG
// ==========================================

window.debugCliente = function() {
    console.log('🐛 Debug do Portal Cliente:');
    console.log('- Total de chamados:', chamadosData.length);
    console.log('- Chamados filtrados:', chamadosFiltrados.length);
    console.log('- API URL:', API_URL);
    console.log('- Dados dos chamados:', chamadosData);
};