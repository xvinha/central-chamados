// frontend/js/admin.js
// JavaScript para o Painel Administrativo

const API_URL = 'http://localhost:3000/api/chamados';
let chamadosData = [];
let chamadosFiltrados = [];
let modalEdicao, modalDetalhes;
let paginaAtual = 1;
const itensPorPagina = 10;

// ==========================================
// 1. INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando Painel Administrativo...');
    
    try {
        // Inicializar modais
        modalEdicao = new bootstrap.Modal(document.getElementById('modalEdicao'));
        modalDetalhes = new bootstrap.Modal(document.getElementById('modalDetalhes'));
        
        // Configurar formulário de edição
        const formEdicao = document.getElementById('form-edicao');
        if (formEdicao) {
            formEdicao.addEventListener('submit', salvarEdicao);
        }
        
        // Carregar dados iniciais
        await carregarChamados();
        
        // Inicializar gráficos
        inicializarGraficos();
        
        console.log('🎉 Painel Administrativo inicializado com sucesso!');
        mostrarNotificacao('Sistema administrativo carregado!', 'success');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        mostrarNotificacao(`Erro ao inicializar: ${error.message}`, 'error');
    }
});

// ==========================================
// 2. CARREGAMENTO E RENDERIZAÇÃO
// ==========================================

async function carregarChamados() {
    console.log('📡 Carregando chamados para admin...');
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        
        chamadosData = await response.json();
        chamadosFiltrados = [...chamadosData];
        
        console.log(`✅ ${chamadosData.length} chamados carregados`);
        
        renderizarTabelaAdmin();
        atualizarEstatisticasAdmin();
        atualizarGraficos();
        
    } catch (error) {
        console.error('❌ Erro ao carregar chamados:', error);
        mostrarErroTabela('Não foi possível carregar os chamados. Verifique sua conexão.');
    }
}

function renderizarTabelaAdmin() {
    const tbody = document.getElementById('lista-chamados-admin');
    const chamadosPaginados = paginarChamados(chamadosFiltrados);
    
    if (chamadosPaginados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <h5>📭 Nenhum chamado encontrado</h5>
                    <p>Ajuste os filtros ou verifique se há chamados cadastrados.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = chamadosPaginados.map(chamado => {
        const priorityClass = getPriorityClass(chamado.prioridade);
        const dataFormatada = formatarData(chamado.dataAbertura);
        
        return `
            <tr class="${priorityClass}">
                <td>
                    <strong>#${chamado.id}</strong>
                </td>
                <td>
                    <div class="fw-bold">${chamado.titulo}</div>
                    <small class="text-muted">
                        ${chamado.descricao.length > 50 ? 
                            chamado.descricao.substring(0, 50) + '...' : 
                            chamado.descricao}
                    </small>
                </td>
                <td>
                    <span class="badge ${getStatusBadge(chamado.status)}">
                        ${chamado.status}
                    </span>
                </td>
                <td>
                    <span class="badge ${getPriorityBadge(chamado.prioridade)}">
                        ${getPrioridadeIcon(chamado.prioridade)} ${chamado.prioridade}
                    </span>
                </td>
                <td>
                    <small>${dataFormatada}</small>
                </td>
                <td>
                    <small>${chamado.categoria || 'N/A'}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary btn-action" 
                                onclick="verDetalhesAdmin(${chamado.id})" 
                                title="Ver Detalhes">
                            👁️
                        </button>
                        <button class="btn btn-outline-secondary btn-action" 
                                onclick="editarChamadoAdmin(${chamado.id})" 
                                title="Editar">
                            ✏️
                        </button>
                        <button class="btn btn-outline-danger btn-action" 
                                onclick="confirmarExclusaoAdmin(${chamado.id}, '${chamado.titulo.replace(/'/g, "\\'")})" 
                                title="Excluir">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    renderizarPaginacao();
    console.log(`✅ ${chamadosPaginados.length} chamados renderizados na tabela admin`);
}

function atualizarEstatisticasAdmin() {
    const total = chamadosData.length;
    const abertos = chamadosData.filter(c => c.status === 'Aberto').length;
    const andamento = chamadosData.filter(c => c.status === 'Em Andamento').length;
    const fechados = chamadosData.filter(c => c.status === 'Fechado').length;
    
    // Animação de contador
    animarContador('total-chamados', total);
    animarContador('chamados-abertos', abertos);
    animarContador('chamados-andamento', andamento);
    animarContador('chamados-fechados', fechados);
}

function animarContador(elementId, valorFinal) {
    const elemento = document.getElementById(elementId);
    const valorInicial = parseInt(elemento.textContent) || 0;
    const duracao = 1000; // 1 segundo
    const inicio = Date.now();
    
    function atualizar() {
        const agora = Date.now();
        const progresso = Math.min((agora - inicio) / duracao, 1);
        const valorAtual = Math.floor(valorInicial + (valorFinal - valorInicial) * progresso);
        
        elemento.textContent = valorAtual;
        
        if (progresso < 1) {
            requestAnimationFrame(atualizar);
        }
    }
    
    requestAnimationFrame(atualizar);
}

// ==========================================
// 3. SISTEMA DE PAGINAÇÃO
// ==========================================

function paginarChamados(chamados) {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return chamados.slice(inicio, fim);
}

function renderizarPaginacao() {
    const totalPaginas = Math.ceil(chamadosFiltrados.length / itensPorPagina);
    const paginacao = document.getElementById('paginacao');
    
    if (totalPaginas <= 1) {
        paginacao.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Botão anterior
    html += `
        <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="irParaPagina(${paginaAtual - 1})">
                « Anterior
            </a>
        </li>
    `;
    
    // Números das páginas
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaAtual - 2 && i <= paginaAtual + 2)) {
            html += `
                <li class="page-item ${i === paginaAtual ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="irParaPagina(${i})">${i}</a>
                </li>
            `;
        } else if (i === paginaAtual - 3 || i === paginaAtual + 3) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // Botão próximo
    html += `
        <li class="page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="irParaPagina(${paginaAtual + 1})">
                Próxima »
            </a>
        </li>
    `;
    
    paginacao.innerHTML = html;
}

window.irParaPagina = function(pagina) {
    const totalPaginas = Math.ceil(chamadosFiltrados.length / itensPorPagina);
    if (pagina >= 1 && pagina <= totalPaginas) {
        paginaAtual = pagina;
        renderizarTabelaAdmin();
    }
};

// ==========================================
// 4. SISTEMA DE FILTROS
// ==========================================

function aplicarFiltrosAdmin() {
    const filtroStatus = document.getElementById('filtro-status-admin').value;
    const filtroPrioridade = document.getElementById('filtro-prioridade-admin').value;
    const filtroBusca = document.getElementById('filtro-busca-admin').value.toLowerCase();
    
    chamadosFiltrados = chamadosData.filter(chamado => {
        const matchStatus = !filtroStatus || chamado.status === filtroStatus;
        const matchPrioridade = !filtroPrioridade || chamado.prioridade === filtroPrioridade;
        const matchBusca = !filtroBusca || 
            chamado.titulo.toLowerCase().includes(filtroBusca) ||
            chamado.descricao.toLowerCase().includes(filtroBusca) ||
            chamado.id.toString().includes(filtroBusca);
        
        return matchStatus && matchPrioridade && matchBusca;
    });
    
    paginaAtual = 1; // Resetar para primeira página
    renderizarTabelaAdmin();
    console.log(`🔍 Filtros aplicados: ${chamadosFiltrados.length} de ${chamadosData.length} chamados`);
}

function limparFiltrosAdmin() {
    document.getElementById('filtro-status-admin').value = '';
    document.getElementById('filtro-prioridade-admin').value = '';
    document.getElementById('filtro-busca-admin').value = '';
    
    chamadosFiltrados = [...chamadosData];
    paginaAtual = 1;
    renderizarTabelaAdmin();
    
    mostrarNotificacao('Filtros limpos', 'info');
}

// ==========================================
// 5. CRUD - OPERAÇÕES ADMIN
// ==========================================

window.verDetalhesAdmin = function(id) {
    const chamado = chamadosData.find(c => c.id === id);
    if (!chamado) {
        mostrarNotificacao('Chamado não encontrado', 'error');
        return;
    }
    
    // Preenche modal com detalhes
    document.getElementById('detalhe-id').textContent = chamado.id;
    document.getElementById('detalhe-status').innerHTML = `<span class="badge ${getStatusBadge(chamado.status)}">${chamado.status}</span>`;
    document.getElementById('detalhe-prioridade').innerHTML = `<span class="badge ${getPriorityBadge(chamado.prioridade)}">${getPrioridadeIcon(chamado.prioridade)} ${chamado.prioridade}</span>`;
    document.getElementById('detalhe-data').textContent = formatarDataCompleta(chamado.dataAbertura);
    document.getElementById('detalhe-categoria').textContent = chamado.categoria || 'Não informada';
    document.getElementById('detalhe-contato').textContent = chamado.contato || 'Não informado';
    document.getElementById('detalhe-titulo').textContent = chamado.titulo;
    document.getElementById('detalhe-descricao').textContent = chamado.descricao;
    document.getElementById('detalhe-observacoes').textContent = chamado.observacoes || 'Nenhuma observação registrada';
    
    // Armazenar ID para possível edição
    modalDetalhes.chamadoId = chamado.id;
    
    modalDetalhes.show();
};

window.editarChamadoModal = function() {
    modalDetalhes.hide();
    setTimeout(() => {
        editarChamadoAdmin(modalDetalhes.chamadoId);
    }, 300);
};

window.editarChamadoAdmin = async function(id) {
    console.log(`✏️ Abrindo edição para chamado #${id}`);
    
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Chamado #${id} não encontrado`);
        }
        
        const chamado = await response.json();
        
        // Preencher formulário
        document.getElementById('edit-id-display').textContent = chamado.id;
        document.getElementById('edit-id').value = chamado.id;
        document.getElementById('edit-titulo').value = chamado.titulo;
        document.getElementById('edit-descricao').value = chamado.descricao;
        document.getElementById('edit-status').value = chamado.status;
        document.getElementById('edit-prioridade').value = chamado.prioridade;
        document.getElementById('edit-categoria').value = chamado.categoria || '';
        document.getElementById('edit-observacoes').value = chamado.observacoes || '';
        
        modalEdicao.show();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados para edição:', error);
        mostrarNotificacao(`Erro ao carregar chamado: ${error.message}`, 'error');
    }
};

async function salvarEdicao(event) {
    event.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const dadosAtualizados = {
        titulo: document.getElementById('edit-titulo').value.trim(),
        descricao: document.getElementById('edit-descricao').value.trim(),
        status: document.getElementById('edit-status').value,
        prioridade: document.getElementById('edit-prioridade').value,
        categoria: document.getElementById('edit-categoria').value,
        observacoes: document.getElementById('edit-observacoes').value.trim()
    };
    
    console.log(`💾 Salvando edição do chamado #${id}:`, dadosAtualizados);
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dadosAtualizados)
        });
        
        if (!response.ok) {
            let mensagem = `Erro HTTP ${response.status}`;
            try {
                const erro = await response.json();
                mensagem = erro.mensagem || mensagem;
            } catch (e) {
                mensagem = `${mensagem} - ${response.statusText}`;
            }
            throw new Error(mensagem);
        }
        
        console.log('✅ Chamado atualizado com sucesso');
        mostrarNotificacao(`Chamado #${id} atualizado com sucesso!`, 'success');
        
        modalEdicao.hide();
        await carregarChamados();
        
    } catch (error) {
        console.error('❌ Erro ao atualizar chamado:', error);
        mostrarNotificacao(`Erro ao atualizar: ${error.message}`, 'error');
    }
}

window.confirmarExclusaoAdmin = function(id, titulo) {
    if (confirm(`⚠️ ATENÇÃO!\n\nDeseja realmente excluir o chamado?\n\n#${id}: "${titulo}"\n\nEsta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.`)) {
        excluirChamadoAdmin(id);
    }
};

async function excluirChamadoAdmin(id) {
    console.log(`🗑️ Excluindo chamado #${id}...`);
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
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
        console.error('❌ Erro ao excluir chamado:', error);
        mostrarNotificacao(`Erro ao excluir: ${error.message}`, 'error');
    }
}

// ==========================================
// 6. GRÁFICOS E RELATÓRIOS
// ==========================================

function inicializarGraficos() {
    // Configuração padrão dos gráficos
    Chart.defaults.font.family = 'system-ui, -apple-system, sans-serif';
    Chart.defaults.plugins.legend.position = 'bottom';
}

function atualizarGraficos() {
    criarGraficoStatus();
    criarGraficoPrioridade();
}

function criarGraficoStatus() {
    const ctx = document.getElementById('grafico-status');
    if (!ctx) return;
    
    const abertos = chamadosData.filter(c => c.status === 'Aberto').length;
    const andamento = chamadosData.filter(c => c.status === 'Em Andamento').length;
    const fechados = chamadosData.filter(c => c.status === 'Fechado').length;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Abertos', 'Em Andamento', 'Fechados'],
            datasets: [{
                data: [abertos, andamento, fechados],
                backgroundColor: ['#28a745', '#ffc107', '#6c757d'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function criarGraficoPrioridade() {
    const ctx = document.getElementById('grafico-prioridade');
    if (!ctx) return;
    
    const alta = chamadosData.filter(c => c.prioridade === 'Alta').length;
    const media = chamadosData.filter(c => c.prioridade === 'Média').length;
    const baixa = chamadosData.filter(c => c.prioridade === 'Baixa').length;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Alta', 'Média', 'Baixa'],
            datasets: [{
                label: 'Quantidade',
                data: [alta, media, baixa],
                backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
                borderColor: ['#dc3545', '#ffc107', '#28a745'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// ==========================================
// 7. UTILITÁRIOS
// ==========================================

function getStatusBadge(status) {
    const badges = {
        'Aberto': 'bg-success',
        'Em Andamento': 'bg-warning text-dark',
        'Fechado': 'bg-secondary'
    };
    return badges[status] || 'bg-primary';
}

function getPriorityClass(prioridade) {
    const classes = {
        'Alta': 'priority-alta',
        'Média': 'priority-media',
        'Baixa': 'priority-baixa'
    };
    return classes[prioridade] || '';
}

function getPriorityBadge(prioridade) {
    const badges = {
        'Alta': 'bg-danger',
        'Média': 'bg-warning text-dark',
        'Baixa': 'bg-success'
    };
    return badges[prioridade] || 'bg-secondary';
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
    if (!dataString) return 'N/A';
    
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

function mostrarErroTabela(mensagem) {
    const tbody = document.getElementById('lista-chamados-admin');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-danger py-4">
                <h5>❌ ${mensagem}</h5>
                <button class="btn btn-primary mt-2" onclick="carregarChamados()">
                    🔄 Tentar Novamente
                </button>
            </td>
        </tr>
    `;
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
// 8. EXPORTAÇÃO DE DADOS
// ==========================================

window.exportarDados = function() {
    try {
        const dados = chamadosFiltrados.map(chamado => ({
            ID: chamado.id,
            Título: chamado.titulo,
            Descrição: chamado.descricao,
            Status: chamado.status,
            Prioridade: chamado.prioridade,
            Categoria: chamado.categoria || 'N/A',
            'Data Abertura': formatarData(chamado.dataAbertura),
            Observações: chamado.observacoes || 'N/A'
        }));
        
        const csv = gerarCSV(dados);
        baixarArquivo(csv, 'chamados_export.csv', 'text/csv');
        
        mostrarNotificacao('Dados exportados com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao exportar:', error);
        mostrarNotificacao('Erro ao exportar dados', 'error');
    }
};

function gerarCSV(dados) {
    if (dados.length === 0) return '';
    
    const cabecalhos = Object.keys(dados[0]);
    const linhas = dados.map(obj => 
        cabecalhos.map(campo => `"${obj[campo]}"`).join(',')
    );
    
    return [cabecalhos.join(','), ...linhas].join('\n');
}

function baixarArquivo(conteudo, nomeArquivo, tipoMime) {
    const blob = new Blob([conteudo], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// ==========================================
// 9. FUNÇÕES GLOBAIS DE DEBUG
// ==========================================

window.debugAdmin = function() {
    console.log('🐛 Debug do Painel Admin:');
    console.log('- Total de chamados:', chamadosData.length);
    console.log('- Chamados filtrados:', chamadosFiltrados.length);
    console.log('- Página atual:', paginaAtual);
    console.log('- API URL:', API_URL);
    console.log('- Modais inicializados:', {
        modalEdicao: !!modalEdicao,
        modalDetalhes: !!modalDetalhes
    });
};