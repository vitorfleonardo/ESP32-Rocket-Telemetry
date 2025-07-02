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
				tooltip: {
					mode: 'index',
					intersect: false
				}
			}
		}
	});

	const ctx_v = document.querySelector('.grafico-velocidade').getContext('2d');
	graficoVelocidade = new Chart(ctx_v, {
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
						text: 'Tempo (s)'
					}
				},
				y: {
					title: {
						text: 'velocidade'
					}
				}
			},
			plugins: {
				tooltip: {
					mode: 'index',
					intersect: false
				},
				legend: {
					display: false,
					position: 'top'
				},
			}
		}
	});

	const ctx_a = document.querySelector('.grafico-aceleracao').getContext('2d');
	graficoAceleracao = new Chart(ctx_a, {
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
						text: 'Tempo (s)'
					}
				},
				y: {
					title: {
						text: 'aceleração'
					}
				}
			},
			plugins: {
				tooltip: {
					mode: 'index',
					intersect: false
				},
				legend: {
					display: false,
					position: 'top'
				},
			}
		}
	});

	const ctx_ax = document.querySelector('.grafico-angulox').getContext('2d');
	graficoAnguloX = new Chart(ctx_ax, {
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
						text: 'Tempo (s)'
					}
				},
				y: {
					title: {
						text: 'angulo X'
					}
				}
			},
			plugins: {
				tooltip: {
					mode: 'index',
					intersect: false
				},
				legend: {
					display: false,
					position: 'top'
				},
			}
		}
	});

	const ctx_ay = document.querySelector('.grafico-anguloy').getContext('2d');
	graficoAnguloY = new Chart(ctx_ay, {
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
						text: 'Tempo (s)'
					}
				},
				y: {
					title: {
						text: 'angulo Y'
					}
				}
			},
			plugins: {
				tooltip: {
					mode: 'index',
					intersect: false
				},
				legend: {
					display: false,
					position: 'top'
				},
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

		const dadosGraficoVelocidade = {
			labels: [],
			datasets: []
		};

		const dadosGraficoAceleracao = {
			labels: [],
			datasets: []
		};

		const dadosGraficoAnguloX = {
			labels: [],
			datasets: []
		};

		const dadosGraficoAnguloY = {
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
				data: tempo.map((t, i) => ({ x: t, y: altitude ? altitude[i] : null })),
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoVelocidade.datasets.push({
				data: tempo.map((t, i) => ({ x: t, y: altitude ? altitude[i] : null })),
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoAceleracao.datasets.push({
				data: tempo.map((t, i) => ({ x: t, y: altitude ? altitude[i] : null })),
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoAnguloX.datasets.push({
				data: tempo.map((t, i) => ({ x: t, y: altitude ? altitude[i] : null })),
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoAnguloY.datasets.push({
				data: tempo.map((t, i) => ({ x: t, y: altitude ? altitude[i] : null })),
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});
		});

		graficoGeral.data = dadosGrafico;
		graficoVelocidade.data = dadosGraficoVelocidade;
		graficoAceleracao.data = dadosGraficoAceleracao;
		graficoAnguloX.data = dadosGraficoAnguloX;
		graficoAnguloY.data = dadosGraficoAnguloY;

		graficoGeral.update();
		graficoVelocidade.update();
		graficoAceleracao.update();
		graficoAnguloX.update();
		graficoAnguloY.update();

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

async function exportar() {
	try {
		const response = await fetch('../database.json');
		const data = await response.json();
		const voosFiltrados = data.filter(voo =>
			voosSelecionadosIds.includes(voo.id_voo)
		);
		const blob = new Blob(
			[JSON.stringify(voosFiltrados, null, 2)],
			{ type: 'application/json' }
		);
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'voos_selecionados.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Erro ao exportar voos:', error);
	}
}

window.onload = carregarVoos;