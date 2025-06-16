let voosSelecionadosIds = [];
let graficoGeral;

async function carregarVoos() {
    try {
        const response = await fetch('../database.json');
        const data = await response.json();

        const select = document.querySelector('.voos-selecionados');
        select.innerHTML = '';

        data.forEach(voo => {
            const option = document.createElement('option');
            option.value = voo.id_voo;
            option.textContent = voo.data_lancamento + ' - ' + voo.id_voo;
            select.appendChild(option);
        });
        atualizarNumeroVoosSelecionados();
        criarGraficoVazio();
    } catch (error) {
        console.error("Erro ao carregar voos:", error);
    }
}

function selecionar_voos() {
    document.getElementById('popup-voos').classList.remove('oculto');
    carregarVoos(); 
}

function confirmarVoos() {
    const select = document.querySelector('.voos-selecionados');
    voosSelecionadosIds = Array.from(select.selectedOptions).map(option => parseInt(option.value));
    atualizarNumeroVoosSelecionados();
    atualizarGraficoGeral();
    document.getElementById('popup-voos').classList.add('oculto');
}

function atualizarNumeroVoosSelecionados() {
    const label = document.querySelector('.numero-voos');
    label.textContent = `${voosSelecionadosIds.length} voos selecionados`;
}

function criarGraficoVazio() {
    const ctx = document.querySelector('.grafico-geral').getContext('2d');
    graficoGeral = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Tempo (s)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Altitude'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Altitude vs Tempo (Selecione os Voos)'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

async function atualizarGraficoGeral() {
    try {
        const response = await fetch('../database.json');
        const todosVoos = await response.json();

        const dadosGrafico = {
            labels: [],
            datasets: []
        };

        const voosFiltrados = todosVoos.filter(voo => voosSelecionadosIds.includes(voo.id_voo));

        const cores = [
            'rgba(54, 162, 235, 1)',  
            'rgba(255, 99, 132, 1)',   
            'rgba(255, 206, 86, 1)',   
            'rgba(75, 192, 192, 1)',  
            'rgba(153, 102, 255, 1)', 
            'rgba(255, 159, 64, 1)',  
            'rgba(128, 0, 128, 1)',   
            'rgba(0, 128, 0, 1)',     
            'rgba(0, 0, 128, 1)',    
            'rgba(139, 69, 19, 1)'   
        ];

        voosFiltrados.forEach((voo, index) => {
            const tempo = voo.leituras_imu.map(leitura => leitura.tempo);
            const altitude = voo.leituras_imu.map(leitura => leitura.az);


            // será o grafico de altitude, mas vou fazer por enquanto usando o "az", aceleracao no eixo z
            dadosGrafico.datasets.push({
                label: `Voo ${voo.id_voo} (${voo.data_lancamento})`,
                data: tempo.map((t, i) => ({ x: t, y: altitude ? altitude [i] : null })),
                borderColor: cores [index % cores.length],
                fill: false,
                tension: 0.1
            });
        });

        graficoGeral.data = dadosGrafico;
        graficoGeral.options.plugins.title.text = 'Altitude vs Tempo (Voos Selecionados)';
        graficoGeral.update();

    } catch (error) {
        console.error("Erro ao carregar dados para o gráfico:", error);
    }
}

function iniciar() {
    console.log("Iniciar voos");
}

function excluir() {
    console.log("Excluir voos");
}

function exportar() {
    console.log("Exportar dados");
}

window.onload = carregarVoos;