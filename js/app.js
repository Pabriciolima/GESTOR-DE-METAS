// Elementos do DOM
const formAddMeta = document.getElementById('form-add-meta');
const tableMetas = document.getElementById('table-metas').querySelector('tbody');
const listaFeriados = document.getElementById('lista-feriados');
const btnAddFeriado = document.getElementById('btn-add-feriado');
const feriadoData = document.getElementById('feriado-data');
const modalEdit = document.getElementById('modal-edit');
const formEditMeta = document.getElementById('form-edit-meta');
const btnSaveEdit = document.getElementById('btn-save-edit');
const totalFiliais = document.getElementById('total-filiais');
const totalMeta = document.getElementById('total-meta');
const totalAtingimento = document.getElementById('total-atingimento');
const totalDiasRestantes = document.getElementById('total-dias-restantes');
const comparativeContainer = document.getElementById('comparative-container');
const formMetaGeral = document.getElementById('form-meta-geral');
const metaGeralValor = document.getElementById('meta-geral-valor');
const metaGeralRealizado = document.getElementById('meta-geral-realizado');
const btnSalvarMetaGeral = document.getElementById('btn-salvar-meta-geral');
const comparativoMetaGeral = document.getElementById('comparativo-meta-geral');
const btnExport = document.getElementById('btn-export');
const btnDashboard = document.getElementById('btn-dashboard');

// Variáveis globais
let metas = [];
let feriados = [];
let chartIndividual, chartGlobal;
let dashboardChartIndividual, dashboardChartGlobal, dashboardChartAtingimento;
let dashboardOpen = false;
const dashboardSidebar = document.getElementById('dashboard-sidebar');
const dashboardOverlay = document.createElement('div');
dashboardOverlay.className = 'overlay';

// Funções de inicialização
function init() {
    setupDatePickers();
    loadData();
    setupEventListeners();
    initCharts();
    updateUI();
    updateMetaGeral();
    setupExportMenu();
    
    // Adiciona o overlay ao body
    document.body.appendChild(dashboardOverlay);
}

function setupDatePickers() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data-inicio').min = today;
    document.getElementById('data-fim').min = today;
    document.getElementById('feriado-data').min = today;
}

function loadData() {
    metas = JSON.parse(localStorage.getItem('metas')) || [];
    feriados = JSON.parse(localStorage.getItem('feriados')) || [];
}

function saveData() {
    localStorage.setItem('metas', JSON.stringify(metas));
    localStorage.setItem('feriados', JSON.stringify(feriados));
}

// Funções de manipulação de dados
function addMeta() {
    const filial = document.getElementById('filial').value;
    const nucleo = document.getElementById('nucleo').value;
    const metaValor = parseFloat(document.getElementById('meta-valor').value);
    const realizadoValor = parseFloat(document.getElementById('realizado-valor').value) || 0;
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;

    if (!validateMetaForm(filial, nucleo, metaValor, dataInicio, dataFim)) return;

    const novaMeta = {
        id: Date.now(),
        filial,
        nucleo,
        meta: metaValor,
        realizado: realizadoValor,
        inicio: dataInicio,
        fim: dataFim
    };

    metas.push(novaMeta);
    saveData();
    updateUI();
    showComparative(novaMeta);
    
    // Notificação Premium melhorada
    Swal.fire({
        title: '<strong style="font-size: 1.5rem; color: #4b6cb7;">Meta Adicionada com Sucesso!</strong>',
        html: `
            <div style="text-align: left; margin: 1.5rem 0;">
                <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                    <div style="background: #4b6cb7; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
                        <i class="fas fa-check" style="color: white; font-size: 1.2rem;"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0; color: #2c3e50;">${filial} - ${nucleo}</h4>
                        <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">${formatDate(dataInicio)} à ${formatDate(dataFim)}</p>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 0.9rem; color: #7f8c8d;">Meta</p>
                        <p style="margin: 0; font-weight: bold; color: #4b6cb7;">${formatCurrency(metaValor)}</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 0.9rem; color: #7f8c8d;">Realizado</p>
                        <p style="margin: 0; font-weight: bold; color: #4b6cb7;">${formatCurrency(realizadoValor)}</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 0.9rem; color: #7f8c8d;">Atingimento</p>
                        <p style="margin: 0; font-weight: bold; color: #4b6cb7;">${(realizadoValor / metaValor * 100 || 0).toFixed(1)}%</p>
                    </div>
                </div>
                
                <div style="background: #e3f2fd; padding: 0.75rem; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; color: #4b6cb7; font-size: 0.9rem;">
                        <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                        Meta cadastrada com sucesso no sistema
                    </p>
                </div>
            </div>
        `,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'white',
        width: '450px',
        padding: '2rem',
        backdrop: `
            rgba(0,0,123,0.4)
            url("/images/nyan-cat.gif")
            left top
            no-repeat
        `,
        customClass: {
            popup: 'animated zoomIn',
            timerProgressBar: 'swal2-timer-progress-bar-premium'
        }
    });
    
    // Reset do formulário
    formAddMeta.reset();
}

function validateMetaForm(filial, nucleo, metaValor, dataInicio, dataFim) {
    if (!filial || !nucleo || isNaN(metaValor) || !dataInicio || !dataFim) {
        Swal.fire({
            title: 'Campos Obrigatórios',
            text: 'Por favor, preencha todos os campos obrigatórios',
            icon: 'warning',
            confirmButtonColor: '#3085d6'
        });
        return false;
    }

    if (new Date(dataFim) < new Date(dataInicio)) {
        Swal.fire({
            title: 'Data Inválida',
            text: 'A data final deve ser posterior à data inicial',
            icon: 'error',
            confirmButtonColor: '#3085d6'
        });
        return false;
    }

    return true;
}

function editMeta() {
    const id = parseInt(document.getElementById('edit-id').value);
    const metaValor = parseFloat(document.getElementById('edit-meta-valor').value);
    const realizadoValor = parseFloat(document.getElementById('edit-realizado-valor').value);
    const dataInicio = document.getElementById('edit-data-inicio').value;
    const dataFim = document.getElementById('edit-data-fim').value;

    if (new Date(dataFim) < new Date(dataInicio)) {
        Swal.fire({
            title: 'Data Inválida',
            text: 'A data final deve ser posterior à data inicial',
            icon: 'error',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const metaIndex = metas.findIndex(m => m.id === id);
    if (metaIndex !== -1) {
        const filial = metas[metaIndex].filial;
        const nucleo = metas[metaIndex].nucleo;
        
        metas[metaIndex] = {
            ...metas[metaIndex],
            meta: metaValor,
            realizado: realizadoValor,
            inicio: dataInicio,
            fim: dataFim
        };
        
        saveData();
        updateUI();
        closeModal();
        
        // Notificação Premium ao editar meta
        Swal.fire({
            title: 'Meta Atualizada!',
            text: `A meta de ${filial} - ${nucleo} foi atualizada com sucesso!`,
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end',
            background: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            iconColor: 'white'
        });
    }
}

function deleteMeta(id) {
    const meta = metas.find(m => m.id === id);
    if (!meta) return;

    Swal.fire({
        title: 'Confirmar Exclusão',
        text: `Tem certeza que deseja excluir a meta de ${meta.filial} - ${meta.nucleo}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        background: '#f8f9fa',
        backdrop: `
            rgba(0,0,123,0.4)
            url("/images/nyan-cat.gif")
            left top
            no-repeat
        `
    }).then((result) => {
        if (result.isConfirmed) {
            metas = metas.filter(m => m.id !== id);
            saveData();
            updateUI();
            
            // Notificação Premium ao excluir meta
            Swal.fire({
                title: 'Excluído!',
                text: `A meta de ${meta.filial} foi removida.`,
                icon: 'success',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                toast: true,
                position: 'top-end',
                background: 'linear-gradient(to right, #f85032 0%, #e73827 100%)',
                color: 'white',
                iconColor: 'white'
            });
        }
    });
}

// Funções para Meta Geral
function updateMetaGeral() {
    const totalRealizado = metas.reduce((sum, meta) => sum + meta.realizado, 0);
    metaGeralRealizado.value = totalRealizado.toFixed(2);

    const savedMetaGeral = localStorage.getItem('metaGeral');
    if (savedMetaGeral) {
        metaGeralValor.value = parseFloat(savedMetaGeral).toFixed(2);
        showComparativoMetaGeral(parseFloat(savedMetaGeral), totalRealizado);
    }
}

function saveMetaGeral() {
    const valor = parseFloat(metaGeralValor.value);
    if (isNaN(valor)) {
        Swal.fire({
            title: 'Valor Inválido',
            text: 'Por favor, informe um valor válido para a meta geral',
            icon: 'error',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    localStorage.setItem('metaGeral', valor);
    updateMetaGeral();
    updateCharts();
    updateDashboardCharts();
    
    Swal.fire({
        title: 'Meta Geral Salva!',
        text: 'A meta geral foi atualizada com sucesso.',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        background: 'linear-gradient(to right, #4b6cb7 0%, #182848 100%)',
        color: 'white',
        iconColor: 'white'
    });
}

function showComparativoMetaGeral(meta, realizado) {
    const porcentagem = meta > 0 ? (realizado / meta) * 100 : 0;
    
    comparativoMetaGeral.innerHTML = `
        <div class="comparative-grid">
            <div class="comparative-item meta-geral-item">
                <span>Meta Geral:</span>
                <strong class="meta-geral-value">${formatCurrency(meta)}</strong>
            </div>
            <div class="comparative-item meta-geral-item">
                <span>Realizado Geral:</span>
                <strong class="meta-geral-value">${formatCurrency(realizado)}</strong>
            </div>
            <div class="comparative-item meta-geral-item">
                <span>Atingimento Geral:</span>
                <strong class="meta-geral-value">${porcentagem.toFixed(1)}%</strong>
            </div>
        </div>
        <div class="progress-container" style="margin-top: 1rem;">
            <div class="progress-bar" style="width: ${Math.min(porcentagem, 100)}%; 
                background-color: ${porcentagem >= 100 ? 'var(--secondary-color)' : 'var(--primary-color)'}">
            </div>
        </div>
    `;
    comparativoMetaGeral.style.display = 'block';
}

// Funções para feriados
function addFeriado() {
    const data = feriadoData.value;
    
    if (!data) {
        Swal.fire({
            title: 'Data Inválida',
            text: 'Por favor, selecione uma data',
            icon: 'warning',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    if (!feriados.includes(data)) {
        feriados.push(data);
        saveData();
        updateFeriadosList();
        feriadoData.value = '';
        
        Swal.fire({
            title: 'Feriado Adicionado!',
            text: `O feriado em ${formatDate(data)} foi cadastrado com sucesso.`,
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end',
            background: 'linear-gradient(to right, #4b6cb7 0%, #182848 100%)',
            color: 'white',
            iconColor: 'white'
        });
    } else {
        Swal.fire({
            title: 'Feriado Existente',
            text: 'Esta data já está cadastrada como feriado',
            icon: 'warning',
            confirmButtonColor: '#3085d6'
        });
    }
}

function updateFeriadosList() {
    listaFeriados.innerHTML = '';
    
    if (feriados.length === 0) {
        listaFeriados.innerHTML = '<p>Nenhum feriado cadastrado</p>';
        return;
    }
    
    feriados.sort().forEach(data => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            <span>${formatDate(data)}</span>
            <span class="tag-remove" data-date="${data}">&times;</span>
        `;
        listaFeriados.appendChild(tag);
    });
    
    document.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            removeFeriado(this.getAttribute('data-date'));
        });
    });
}

function removeFeriado(data) {
    feriados = feriados.filter(f => f !== data);
    saveData();
    updateFeriadosList();
    
    Swal.fire({
        title: 'Feriado Removido!',
        text: `O feriado em ${formatDate(data)} foi excluído.`,
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        background: 'linear-gradient(to right, #f85032 0%, #e73827 100%)',
        color: 'white',
        iconColor: 'white'
    });
}

// Funções de UI
function updateUI() {
    updateMetasTable();
    updateFeriadosList();
    updateSummaryCards();
    updateCharts();
    updateMetaGeral();
    updateDashboardCharts();
}

function updateMetasTable() {
    tableMetas.innerHTML = '';
    
    if (metas.length === 0) {
        tableMetas.innerHTML = '<tr><td colspan="9" class="text-center">Nenhuma meta cadastrada</td></tr>';
        return;
    }
    
    const metasOrdenadas = [...metas].sort((a, b) => a.filial.localeCompare(b.filial));
    
    metasOrdenadas.forEach(meta => {
        const progresso = calcularProgresso(meta);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${meta.filial}</td>
            <td>${meta.nucleo}</td>
            <td>${formatDate(meta.inicio)} - ${formatDate(meta.fim)}</td>
            <td>${formatCurrency(meta.meta)}</td>
            <td>${formatCurrency(meta.realizado)}</td>
            <td>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${Math.min(progresso.porcentagem, 100)}%; 
                        background-color: ${progresso.porcentagem >= 100 ? 'var(--secondary-color)' : 'var(--primary-color)'}">
                    </div>
                </div>
                <small>${progresso.porcentagem.toFixed(1)}%</small>
            </td>
            <td>${progresso.diasRestantes}</td>
            <td>${formatCurrency(progresso.porDia)}</td>
            <td>
                <button class="btn btn-icon btn-edit" data-id="${meta.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-delete" data-id="${meta.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableMetas.appendChild(row);
    });
    
    setupEditDeleteButtons();
}

function setupEditDeleteButtons() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            openEditModal(parseInt(this.getAttribute('data-id')));
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteMeta(parseInt(this.getAttribute('data-id')));
        });
    });
}

function openEditModal(id) {
    const meta = metas.find(m => m.id === id);
    if (!meta) return;
    
    document.getElementById('edit-id').value = meta.id;
    document.getElementById('edit-filial').value = meta.filial;
    document.getElementById('edit-nucleo').value = meta.nucleo;
    document.getElementById('edit-meta-valor').value = meta.meta;
    document.getElementById('edit-realizado-valor').value = meta.realizado;
    document.getElementById('edit-data-inicio').value = meta.inicio;
    document.getElementById('edit-data-fim').value = meta.fim;
    
    modalEdit.style.display = 'flex';
}

function closeModal() {
    modalEdit.style.display = 'none';
}

function updateSummaryCards() {
    totalFiliais.textContent = metas.length;
    
    const totalMetaValue = metas.reduce((sum, meta) => sum + meta.meta, 0);
    totalMeta.textContent = formatCurrency(totalMetaValue);
    
    const totalRealizado = metas.reduce((sum, meta) => sum + meta.realizado, 0);
    const totalAtingimentoValue = totalMetaValue > 0 ? (totalRealizado / totalMetaValue) * 100 : 0;
    totalAtingimento.textContent = totalAtingimentoValue.toFixed(1) + '%';
    
    if (metas.length > 0) {
        const totalDias = metas.reduce((sum, meta) => sum + calcularProgresso(meta).diasRestantes, 0);
        totalDiasRestantes.textContent = Math.round(totalDias / metas.length);
    } else {
        totalDiasRestantes.textContent = '0';
    }
}

function showComparative(meta) {
    const progresso = calcularProgresso(meta);
    
    comparativeContainer.innerHTML = `
        <div class="comparative-container">
            <h4>Comparativo para ${meta.filial}</h4>
            <div class="comparative-grid">
                <div class="comparative-item">
                    <span>Meta:</span>
                    <strong>${formatCurrency(meta.meta)}</strong>
                </div>
                <div class="comparative-item">
                    <span>Realizado:</span>
                    <strong>${formatCurrency(meta.realizado)}</strong>
                </div>
                <div class="comparative-item">
                    <span>Atingimento:</span>
                    <strong>${progresso.porcentagem.toFixed(1)}%</strong>
                </div>
                <div class="comparative-item">
                    <span>Dias Restantes:</span>
                    <strong>${progresso.diasRestantes}</strong>
                </div>
                <div class="comparative-item">
                    <span>Por Dia:</span>
                    <strong>${formatCurrency(progresso.porDia)}</strong>
                </div>
                <div class="comparative-item">
                    <span>Por Semana:</span>
                    <strong>${formatCurrency(progresso.porSemana)}</strong>
                </div>
            </div>
        </div>
    `;
    comparativeContainer.style.display = 'block';
}

// Funções para gráficos
function initCharts() {
    const ctxIndividual = document.getElementById('chart-individual').getContext('2d');
    const ctxGlobal = document.getElementById('chart-global').getContext('2d');
    
    chartIndividual = new Chart(ctxIndividual, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Meta (R$)',
                    data: [],
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Realizado (R$)',
                    data: [],
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: getChartOptions()
    });
    
    chartGlobal = new Chart(ctxGlobal, {
        type: 'bar',
        data: {
            labels: ['Meta Total', 'Realizado Total'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)'
                ],
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            ...getChartOptions(),
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Inicializar gráficos do dashboard
    const ctxDashboardIndividual = document.getElementById('dashboard-chart-individual').getContext('2d');
    const ctxDashboardGlobal = document.getElementById('dashboard-chart-global').getContext('2d');
    const ctxDashboardAtingimento = document.getElementById('dashboard-chart-atingimento').getContext('2d');
    
    dashboardChartIndividual = new Chart(ctxDashboardIndividual, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: getDashboardChartOptions('Desempenho por Filial', 'horizontalBar')
    });
    
    dashboardChartGlobal = new Chart(ctxDashboardGlobal, {
        type: 'doughnut',
        data: { labels: [], datasets: [] },
        options: getDashboardChartOptions('Atingimento Geral', 'doughnut')
    });
    
    dashboardChartAtingimento = new Chart(ctxDashboardAtingimento, {
        type: 'radar',
        data: { labels: [], datasets: [] },
        options: getDashboardChartOptions('Atingimento por Filial (%)', 'radar')
    });
}

function getChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 20,
                    font: {
                        family: 'Roboto',
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    family: 'Roboto',
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    family: 'Roboto',
                    size: 12
                },
                cornerRadius: 8,
                displayColors: true,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        return label + 'R$ ' + context.raw.toLocaleString('pt-BR');
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return 'R$ ' + value.toLocaleString('pt-BR');
                    },
                    autoSkip: true,
                    maxTicksLimit: 6
                },
                grid: {
                    drawBorder: false,
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        layout: {
            padding: {
                top: 10,
                right: 15,
                bottom: 10,
                left: 15
            }
        }
    };
}

function updateCharts() {
    const metasOrdenadas = [...metas].sort((a, b) => a.filial.localeCompare(b.filial));
    
    // Gráfico individual
    chartIndividual.data.labels = metasOrdenadas.map(meta => meta.filial);
    chartIndividual.data.datasets[0].data = metasOrdenadas.map(meta => meta.meta);
    chartIndividual.data.datasets[1].data = metasOrdenadas.map(meta => meta.realizado);
    chartIndividual.update();
    
    // Gráfico global
    const totalRealizado = metas.reduce((sum, meta) => sum + meta.realizado, 0);
    const metaGeral = parseFloat(localStorage.getItem('metaGeral')) || 
                     metas.reduce((sum, meta) => sum + meta.meta, 0);
    
    chartGlobal.data.datasets[0].data = [metaGeral, totalRealizado];
    chartGlobal.update();
    
    // Atualizar gráficos do dashboard
    updateDashboardCharts();
}

// Funções de cálculo
function calcularProgresso(meta) {
    const inicio = new Date(meta.inicio);
    const fim = new Date(meta.fim);
    const hoje = new Date();
    
    const diasUteisTotal = calcularDiasUteis(inicio, fim);
    const diasDecorridos = calcularDiasUteis(inicio, hoje > fim ? fim : hoje);
    const diasRestantes = diasUteisTotal - diasDecorridos;
    const porcentagem = meta.meta > 0 ? (meta.realizado / meta.meta) * 100 : 0;
    const porDia = diasRestantes > 0 ? (meta.meta - meta.realizado) / diasRestantes : 0;
    const porSemana = porDia * 5;
    
    return {
        porcentagem,
        diasRestantes,
        porDia,
        porSemana,
        diasUteisTotal,
        diasDecorridos
    };
}

function calcularDiasUteis(inicio, fim) {
    let count = 0;
    let current = new Date(inicio);
    const end = new Date(fim);
    
    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    while (current <= end) {
        const day = current.getDay();
        const dateStr = current.toISOString().split('T')[0];
        
        if (day !== 0 && day !== 6 && !feriados.includes(dateStr)) {
            count++;
        }
        
        current.setDate(current.getDate() + 1);
    }
    
    return count;
}

// Funções auxiliares
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function formatCurrency(value) {
    if (isNaN(value)) return 'R$ 0,00';
    return 'R$ ' + value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Dashboard functions
// Funções do Dashboard melhoradas
function openDashboard() {
    // Fechar qualquer notificação aberta
    Swal.close();
    
    // Atualizar dados antes de abrir
    updateDashboardCharts();
    
    // Mostrar overlay e sidebar
    dashboardOverlay.style.display = 'block';
    dashboardSidebar.style.display = 'block';
    
    // Animação premium de entrada
    gsap.fromTo(dashboardSidebar, 
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
    );
    
    gsap.fromTo(dashboardOverlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
    );
    
    // Bloquear scroll do body
    document.body.style.overflow = 'hidden';
    
    // Adicionar evento para fechar com ESC
    document.addEventListener('keydown', handleEscapeKey);
}

function closeDashboard() {
    // Animação premium de saída
    gsap.to(dashboardSidebar, {
        x: '100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
            dashboardSidebar.style.display = 'none';
            dashboardOverlay.style.display = 'none';
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscapeKey);
        }
    });
    
    gsap.to(dashboardOverlay, {
        opacity: 0,
        duration: 0.2
    });
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeDashboard();
    }
}

// Configuração do overlay do dashboard
dashboardOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: none;
    backdrop-filter: blur(3px);
`;

dashboardSidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 85%;
    max-width: 800px;
    height: 100vh;
    background: white;
    z-index: 1000;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    display: none;
    padding: 20px;
`;
// Botões de Exportação diretos (substitua o setupExportMenu por este código)
function setupExportButtons() {
    // Remove o menu antigo se existir
    const oldMenu = document.getElementById('export-menu');
    if (oldMenu) oldMenu.remove();
    
    // Cria container para os botões
    const exportContainer = document.createElement('div');
    exportContainer.className = 'export-buttons';
    exportContainer.style.display = 'flex';
    exportContainer.style.gap = '10px';
    exportContainer.style.marginLeft = '10px';
    
    // Botão PDF
    const btnPDF = document.createElement('button');
    btnPDF.id = 'btn-pdf-direct';
    btnPDF.className = 'btn';
    btnPDF.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
    btnPDF.style.backgroundColor = '#e74c3c';
    btnPDF.style.color = 'white';
    
    // Botão Excel
    const btnExcel = document.createElement('button');
    btnExcel.id = 'btn-excel-direct';
    btnExcel.className = 'btn';
    btnExcel.innerHTML = '<i class="fas fa-file-excel"></i> Excel';
    btnExcel.style.backgroundColor = '#2ecc71';
    btnExcel.style.color = 'white';
    
    // Adiciona os botões ao container
    exportContainer.appendChild(btnPDF);
    exportContainer.appendChild(btnExcel);
    
    // Insere os botões após o botão de dashboard
    btnDashboard.parentNode.insertBefore(exportContainer, btnDashboard.nextSibling);
    
    // Event listeners
    btnPDF.addEventListener('click', exportToPDF);
    btnExcel.addEventListener('click', exportToExcel);
}
// Modifique a função init() para usar o novo setup
function init() {
    setupDatePickers();
    loadData();
    setupEventListeners();
    initCharts();
    updateUI();
    updateMetaGeral();
    setupExportButtons();
    setupThemeToggle(); // Adicione esta linha
    dashboardOverlay.addEventListener('click', closeDashboard);
    document.body.appendChild(dashboardOverlay);
}

// Atualize os gráficos do dashboard com estilo premium
function updateDashboardCharts() {
    // Dados para os gráficos
    const metasOrdenadas = [...metas].sort((a, b) => a.filial.localeCompare(b.filial));
    const totalMeta = metas.reduce((sum, meta) => sum + meta.meta, 0);
    const totalRealizado = metas.reduce((sum, meta) => sum + meta.realizado, 0);
    const metaGeral = parseFloat(localStorage.getItem('metaGeral')) || totalMeta;
    
    // Gráfico Individual (Barras horizontais)
    dashboardChartIndividual.data = {
        labels: metasOrdenadas.map(meta => meta.filial),
        datasets: [{
            label: 'Realizado (R$)',
            data: metasOrdenadas.map(meta => meta.realizado),
            backgroundColor: metasOrdenadas.map(meta => {
                const percent = (meta.realizado / meta.meta) * 100 || 0;
                if (percent >= 100) return 'rgba(75, 192, 192, 0.7)'; // Verde - meta alcançada
                if (percent >= 70) return 'rgba(255, 206, 86, 0.7)'; // Amarelo - próximo da meta
                return 'rgba(255, 99, 132, 0.7)'; // Vermelho - abaixo de 70%
            }),
            borderColor: metasOrdenadas.map(meta => {
                const percent = (meta.realizado / meta.meta) * 100 || 0;
                if (percent >= 100) return 'rgba(75, 192, 192, 1)';
                if (percent >= 70) return 'rgba(255, 206, 86, 1)';
                return 'rgba(255, 99, 132, 1)';
            }),
            borderWidth: 1,
            borderRadius: 6
        }]
    };
    dashboardChartIndividual.options = getDashboardChartOptions('Desempenho por Filial', 'horizontalBar');
    
    // Gráfico Global (Donut)
    dashboardChartGlobal.data = {
        labels: ['Realizado', 'Restante'],
        datasets: [{
            data: [totalRealizado, Math.max(0, metaGeral - totalRealizado)],
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 99, 132, 0.7)'
            ],
            borderWidth: 0
        }]
    };
    dashboardChartGlobal.options = getDashboardChartOptions('Atingimento Geral', 'doughnut');
    
    // Gráfico de Atingimento (Radar)
    dashboardChartAtingimento.data = {
        labels: metasOrdenadas.map(meta => meta.filial),
        datasets: [{
            label: 'Atingimento (%)',
            data: metasOrdenadas.map(meta => {
                return meta.meta > 0 ? (meta.realizado / meta.meta) * 100 : 0;
            }),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            pointBackgroundColor: 'rgba(153, 102, 255, 1)',
            pointBorderColor: '#fff',
            pointHoverRadius: 6,
            pointHoverBorderWidth: 2,
            borderWidth: 2
        }]
    };
    dashboardChartAtingimento.options = getDashboardChartOptions('Atingimento por Filial (%)', 'radar');
    
    // Atualiza todos os gráficos
    dashboardChartIndividual.update();
    dashboardChartGlobal.update();
    dashboardChartAtingimento.update();
}

function getDashboardChartOptions(title, chartType = 'bar') {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    family: 'Roboto',
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                },
                color: '#2c3e50'
            },
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        family: 'Roboto',
                        size: 12
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    family: 'Roboto',
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    family: 'Roboto',
                    size: 12
                },
                cornerRadius: 8,
                displayColors: true,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.chart.config.type === 'radar') {
                            return label + context.raw.toFixed(1) + '%';
                        }
                        return label + 'R$ ' + context.raw.toLocaleString('pt-BR');
                    }
                }
            }
        },
        layout: {
            padding: {
                top: 10,
                right: 15,
                bottom: 10,
                left: 15
            }
        }
    };
    
    if (chartType === 'horizontalBar') {
        return {
            ...baseOptions,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        };
    }
    
    if (chartType === 'doughnut') {
        return {
            ...baseOptions,
            cutout: '70%',
            plugins: {
                ...baseOptions.plugins,
                tooltip: {
                    ...baseOptions.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
                        }
                    }
                }
            }
        };
    }
    
    if (chartType === 'radar') {
        return {
            ...baseOptions,
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    pointLabels: {
                        font: {
                            family: 'Roboto',
                            size: 11
                        }
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        backdropColor: 'transparent'
                    }
                }
            }
        };
    }
    
    return baseOptions;
}

// Funções de exportação
function setupExportMenu() {
    const exportMenu = document.createElement('div');
    exportMenu.id = 'export-menu';
    exportMenu.className = 'dropdown-menu';
    
    exportMenu.innerHTML = `
        <button id="btn-export-pdf" class="dropdown-item">
            <i class="fas fa-file-pdf"></i> Exportar como PDF
        </button>
        <button id="btn-export-excel" class="dropdown-item">
            <i class="fas fa-file-excel"></i> Exportar como Excel
        </button>
    `;
    
    document.body.appendChild(exportMenu);
    
    btnExport.addEventListener('click', function(e) {
        e.stopPropagation();
        exportMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', function() {
        exportMenu.classList.remove('show');
    });
    
    // Exportar para PDF
    document.getElementById('btn-export-pdf').addEventListener('click', exportToPDF);
    
    // Exportar para Excel
    document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
}

function exportToPDF() {
    Swal.fire({
        title: 'Gerando PDF...',
        html: 'Por favor, aguarde enquanto preparamos seu relatório.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Usando html2pdf.js para gerar o PDF
    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding: 2rem; font-family: 'Roboto', sans-serif;">
            <h1 style="color: #2c3e50; text-align: center; margin-bottom: 1.5rem;">Relatório de Metas</h1>
            <p style="text-align: center; color: #7f8c8d; margin-bottom: 2rem;">
                Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </p>
            
            
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; width: 48%;">
                    <h3 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Resumo Geral</h3>
                    <p><strong>Total de Filiais:</strong> ${metas.length}</p>
                    <p><strong>Meta Total:</strong> ${formatCurrency(metas.reduce((sum, meta) => sum + meta.meta, 0))}</p>
                    <p><strong>Realizado Total:</strong> ${formatCurrency(metas.reduce((sum, meta) => sum + meta.realizado, 0))}</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; width: 48%;">
                    <h3 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Meta Geral</h3>
                    <p><strong>Meta:</strong> ${formatCurrency(parseFloat(localStorage.getItem('metaGeral')) || 0)}</p>
                    <p><strong>Atingimento:</strong> ${(metas.reduce((sum, meta) => sum + meta.realizado, 0) / (parseFloat(localStorage.getItem('metaGeral')) || 1) * 100 || 0).toFixed(2)}%</p>
                </div>
            </div>
            
            <h3 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-top: 2rem;">Metas por Filial</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                <thead>
                    <tr style="background: #4b6cb7; color: white;">
                        <th style="padding: 0.75rem; text-align: left;">Filial</th>
                        <th style="padding: 0.75rem; text-align: left;">Núcleo</th>
                        <th style="padding: 0.75rem; text-align: right;">Meta</th>
                        <th style="padding: 0.75rem; text-align: right;">Realizado</th>
                        <th style="padding: 0.75rem; text-align: right;">Atingimento</th>
                    </tr>
                </thead>
                <tbody>
                    ${metas.map(meta => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 0.75rem;">${meta.filial}</td>
                            <td style="padding: 0.75rem;">${meta.nucleo}</td>
                            <td style="padding: 0.75rem; text-align: right;">${formatCurrency(meta.meta)}</td>
                            <td style="padding: 0.75rem; text-align: right;">${formatCurrency(meta.realizado)}</td>
                            <td style="padding: 0.75rem; text-align: right;">${(meta.realizado / meta.meta * 100 || 0).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 3rem; text-align: center; color: #7f8c8d; font-size: 0.9rem;">
                Relatório gerado pelo Sistema de Gestão de Metas criado por Pabricio Lima.<br>todos os direitos reservados. 
            </div>
        </div>
    `;
    
    // Configurações do PDF
    const opt = {
        margin: 10,
        filename: `relatorio_metas_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Gerar PDF
    setTimeout(() => {
        html2pdf().from(element).set(opt).save().then(() => {
            Swal.fire({
                title: 'PDF Gerado!',
                text: 'O relatório foi exportado com sucesso.',
                icon: 'success',
                confirmButtonColor: '#4b6cb7'
            });
        });
    }, 500);
}

function exportToExcel() {
    // Mostrar loading
    Swal.fire({
        title: 'Gerando Excel...',
        html: 'Por favor, aguarde enquanto preparamos sua planilha.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Dados para a planilha
    const wsData = [
        ['Filial', 'Núcleo', 'Meta (R$)', 'Realizado (R$)', 'Atingimento (%)', 'Data Início', 'Data Fim'],
        ...metas.map(meta => [
            meta.filial,
            meta.nucleo,
            meta.meta,
            meta.realizado,
            (meta.realizado / meta.meta * 100 || 0).toFixed(2),
            formatDate(meta.inicio),
            formatDate(meta.fim)
        ])
    ];
    
    // Adicionar resumo
    wsData.push([], ['Resumo Geral', '', '', '', '']);
    wsData.push(['Total de Filiais', metas.length]);
    wsData.push(['Meta Total', metas.reduce((sum, meta) => sum + meta.meta, 0)]);
    wsData.push(['Realizado Total', metas.reduce((sum, meta) => sum + meta.realizado, 0)]);
    wsData.push(['Atingimento Geral', (metas.reduce((sum, meta) => sum + meta.realizado, 0) / metas.reduce((sum, meta) => sum + meta.meta, 1) * 100 || 0).toFixed(2) + '%']);
    
    // Criar worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Adicionar formatação condicional para atingimento
    ws['!conditionalFormats'] = [
        {
            ref: 'E2:E' + (metas.length + 1),
            rules: [
                {
                    type: 'cellIs',
                    operator: 'greaterThanOrEqual',
                    value: 100,
                    style: { fill: { patternType: 'solid', fgColor: { rgb: 'FF4CAF50' } } } // Verde
                },
                {
                    type: 'cellIs',
                    operator: 'lessThan',
                    value: 100,
                    style: { fill: { patternType: 'solid', fgColor: { rgb: 'FFFFC107' } } } // Amarelo
                },
                {
                    type: 'cellIs',
                    operator: 'lessThan',
                    value: 70,
                    style: { fill: { patternType: 'solid', fgColor: { rgb: 'FFF44336' } } } // Vermelho
                }
            ]
        }
    ];
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Metas');
    
    // Gerar Excel
    setTimeout(() => {
        XLSX.writeFile(wb, `relatorio_metas_${new Date().toISOString().split('T')[0]}.xlsx`);
        Swal.fire({
            title: 'Excel Gerado!',
            text: 'A planilha foi exportada com sucesso.',
            icon: 'success',
            confirmButtonColor: '#4b6cb7'
        });
    }, 500);
}

// Event Listeners
function setupEventListeners() {
    formAddMeta.addEventListener('submit', function(e) {
        e.preventDefault();
        addMeta();
    });
    
    document.getElementById('btn-cancel').addEventListener('click', function() {
        formAddMeta.reset();
        comparativeContainer.style.display = 'none';
    });
    
    btnAddFeriado.addEventListener('click', addFeriado);
    btnSaveEdit.addEventListener('click', editMeta);
    btnSalvarMetaGeral.addEventListener('click', saveMetaGeral);
    
    // Botão do Dashboard
    btnDashboard.addEventListener('click', openDashboard);
    document.getElementById('btn-close-dashboard').addEventListener('click', closeDashboard);
    dashboardOverlay.addEventListener('click', closeDashboard);
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modalEdit) closeModal();
    });
    
    document.getElementById('btn-refresh').addEventListener('click', updateUI);
}
// Theme Mode Functions
function setupThemeToggle() {
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme');
    
    // Load saved theme
    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
            toggleSwitch.checked = true;
        }
    }
    
    // Theme switch event
    toggleSwitch.addEventListener('change', switchTheme, false);
    
    // Apply theme to charts
    applyThemeToCharts();
}

function switchTheme(e) {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', '');
    }
    applyThemeToCharts();
}

function applyThemeToCharts() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkMode ? '#f5f5f5' : '#666';
    
    // Update all charts
    const charts = [chartIndividual, chartGlobal, dashboardChartIndividual, dashboardChartGlobal, dashboardChartAtingimento];
    
    charts.forEach(chart => {
        if (chart) {
            chart.options.scales = {
                ...chart.options.scales,
                x: {
                    ...chart.options.scales?.x,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    ...chart.options.scales?.y,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            };
            
            if (chart.options.plugins?.title) {
                chart.options.plugins.title.color = textColor;
            }
            
            if (chart.options.plugins?.legend?.labels) {
                chart.options.plugins.legend.labels.color = textColor;
            }
            
            chart.update();
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', init);