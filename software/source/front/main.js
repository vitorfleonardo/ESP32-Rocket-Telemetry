/**
 * Graph data type
 * @typedef {Object} GraphData
 * @property {string=} label - Label for the dataset.
 * @property {Array<{x: number, y: number}>} data - Data points for the graph.
 * @property {string} borderColor - Color of the line.
 * @property {boolean} fill - Whether to fill the area under the line.
 * @property {number} tension - Tension of the line.
 */

/**
 * @typedef {Object} Flight
 * @property {string} id - Unique identifier for the flight (UUID).
 * @property {string} date - Date of the flight in "pt-BR" format.
 * @property {string} name - Name of the flight.
 * @property {number} angle - Angle of the flight.
 * @property {number} distance - Distance of the flight.
 * @property {Array<Object>} data - Parsed CSV data.
 */

/**
 * Queries the DOM for an element matching the given selector and ensures it is of the specified type.
 * @template T
 * @param {string} selector - CSS selector string to find the element
 * @param {new () => T} [type] - Constructor function to check instance against
 * @returns {T} The selected DOM element
 * @throws {Error} If no element matches the selector or if the element is not of the specified type
 */
function query (
	selector,
	type
) {
	const element = document.querySelector(selector);
	if (element === null) {
		throw new Error(`No element found for selector "${selector}".`);
	}
	if (type != null && !(element instanceof type)) {
		throw new Error(`Element with selector "${selector}" is not a ${type.name}.`);
	}
	// @ts-expect-error
	return element;
}

/**
 * @typedef {Object} IMUData
 * @property {number} timestamp - Timestamp of the reading.
 * @property {number} ax - Acceleration in the x-axis.
 * @property {number} ay - Acceleration in the y-axis.
 * @property {number} az - Acceleration in the z-axis.
 * @property {number} gx - Gyroscope reading in the x-axis.
 * @property {number} gy - Gyroscope reading in the y-axis.
 * @property {number} gz - Gyroscope reading in the z-axis.
 */

/**
 * Parses a CSV string into an array of objects, skipping corrupted lines.
 * @param {string} csv - The CSV content to parse (no header): timestamp, ax, ay, az, gx, gy, gz
 * @returns {Array<IMUData>} An array of objects with keys { timestamp, ax, ay, az, gx, gy, gz }
 * @throws {Error} If the CSV is empty or all lines are corrupted.
 */
function parse_csv (csv)
{
	const lines = csv.trim().split('\n');
	if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
		throw new Error("CSV format is invalid or empty.");
	}

	/**
	 * @type {Array<IMUData>}
	 */
	const result = [];

	lines.forEach((line, index) => {
		const parts = line.split(',');
		if (parts.length !== 7) {
			console.warn(`Skipping corrupted CSV line ${index + 1}: expected 7 fields but got ${parts.length}`);
			return;
		}
		const nums = parts.map(Number);
		if (nums.some(Number.isNaN)) {
			console.warn(`Skipping corrupted CSV line ${index + 1}: contains non-numeric values`);
			return;
		}
		const [timestamp, ax, ay, az, gx, gy, gz] = nums;

		result.push({ timestamp, ax, ay, az, gx, gy, gz });
	});

	// Normalize the timestamp by getting the minimum timestamp and subtracting it from all timestamps.
	/// const minTimestamp = Math.min(...full_timestamp);
		
	// Convert timestamps to seconds (assuming they are in nanoseconds).
	/// const timestamp = full_timestamp.map(t => (t - minTimestamp) / 1000000);

	if (result.length === 0) {
		throw new Error("O formato é inválido ou todas as linhas foram corrompidas.");
	}

	return result;
}

/**
 * Retrieves a value from localStorage.
 * @param {string} key - The key of the item to retrieve.
 * @returns {Object} The parsed value from localStorage or null if not found.
 */
function local_storage_get (key)
{
	const value = localStorage.getItem(key);
	if (value === null) {
		return null;
	}
	try {
		return JSON.parse(value);
	} catch (e) {
		console.error(`Error parsing JSON from localStorage for key "${key}":`, e);
		return null;
	}
}

let selected_flights_ids = [];
let graficoGeral;
let graficoVelocidade, graficoAceleracao, graficoAnguloX, graficoAnguloY;
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
let arquivoCsvSelecionado;

const popups = {
	new_flight: query('.popup.new-flight'),
	select_flights: query('.popup.select-flights'),
}

const buttons = {
	add_flight: query("button.add-flight", HTMLButtonElement),
	add_flight_csv: query(".btn-adicionar-csv", HTMLButtonElement),
	save_flight: query(".btn-concluir-voo", HTMLButtonElement),
}

const inputs = {
	flight_name: query(".input-nome-voo", HTMLInputElement),
	// flight_angle: query(".input-angulo-voo", HTMLInputElement),
	flight_distance: query(".input-distancia-voo", HTMLInputElement),
	flight_csv: query(".csv-voo", HTMLInputElement),
	selected_flights: query(".voos-selecionados", HTMLSelectElement),
}

const labels = {
	flight_csv_name: query(".nome-arquivo-csv", HTMLSpanElement),
	flights_number: query(".numero-voos", HTMLLabelElement),
}

buttons.add_flight.addEventListener("click", () => popups.new_flight.classList.remove('oculto'));

buttons.add_flight_csv.addEventListener("click", () => query(".csv-voo").click());

buttons.save_flight.addEventListener("click", salvarNovoVoo);

function close_popup_new_flight ()
{
    const popup = query('#popup-novo-voo');
    popup.classList.add('oculto');
    inputs.flight_name.value = '';
    // inputs.flight_angle.value = '';
    inputs.flight_distance.value = '';
    labels.flight_csv_name.textContent = 'Nenhum arquivo selecionado';
    arquivoCsvSelecionado = null;
}

inputs.flight_csv.addEventListener("change", () => {
    const files = inputs.flight_csv.files;

	if (!files || files.length === 0) {
		console.warn("Nenhum arquivo selecionado.");
		return;
	}

    arquivoCsvSelecionado = files[0]
    labels.flight_csv_name.textContent = files[0].name;
});

function salvarNovoVoo ()
{
	const name = inputs.flight_name.value;
    // const angle = parseInt(inputs.flight_angle.value);
	// Fixed angle to 45 degrees as per the original code.
	const angle = 45;
    const distance = parseInt(inputs.flight_distance.value);

    if (!name || !angle || !distance || !arquivoCsvSelecionado)
	{
        window.alert("Por favor, preencha todos os campos e selecione um arquivo CSV.");
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e)
	{
        const csvData = reader.result?.toString();

		if (!csvData || csvData.trim() === '')
		{
			throw new Error("O arquivo CSV está vazio ou não foi carregado corretamente.");
		}

		/**
		 * @type {Array<IMUData>}
		 */
		let data = [];

		try {
			data = parse_csv(csvData);
		} catch (e) {
			window.alert(`Erro ao processar o arquivo CSV: ${e.message}`);
			return;
		}
		

		const date = new Date();

		/**
		 * @type {Flight}
		 */
        const new_flight = {
            id: crypto.randomUUID(),
			date: date.toLocaleDateString("pt-BR"),
            name,
            angle,
            distance,
            data
        };

        const saved_flights = JSON.parse(localStorage.getItem('flights') ?? '[]');
        
        saved_flights.push(new_flight);

        localStorage.setItem('flights', JSON.stringify(saved_flights));

        window.alert(`Voo "${name}" salvo com sucesso!`);

        close_popup_new_flight(); 
    };

    reader.readAsText(arquivoCsvSelecionado, 'ASCII');
}


async function carregarVoos()
{
	try
	{
		/**
		 * @type {Array<Flight>}
		 */
		let data = [];

		// If there is no local data, then fetch it and save it.
		if (!localStorage.getItem('flights'))
		{
			const response = await fetch('../database.json');
			const data = await response.json();
			localStorage.setItem('flights', JSON.stringify(data));
		}
		else
		{
			data = JSON.parse(localStorage.getItem('flights') ?? '[]');
		}

		inputs.selected_flights.innerHTML = '';

		for (const flight of data)
		{
			if (!flight.data || !Array.isArray(flight.data) || flight.data.length === 0)
			{
				console.warn(`Voo ${flight.name} não possui dados válidos.`);
				continue;
			}

			const option = document.createElement('option');
			option.value = flight.id;
			option.textContent = flight.date + ' - ' + flight.name;
			
			inputs.selected_flights.appendChild(option);
		}

		update_selected_flights();
		criarGraficoVazio();

	}
	catch (error)
	{
		console.error("Erro ao carregar voos:", error);
	}
}

function fechar_popup() {
	popups.select_flights.classList.add('oculto');
}

function selecionar_voos() {
	popups.select_flights.classList.remove('oculto');
	carregarVoos();
}

function confirmarVoos() {
	selected_flights_ids = Array.from(inputs.selected_flights.selectedOptions).map(option => option.value);

	//console.log("Voos selecionados:", inputs.selected_flights.selectedOptions);

	update_selected_flights();
	atualizarGraficoGeral();
	fechar_popup();
}

function update_selected_flights()
{
	labels.flights_number.textContent = `${selected_flights_ids.length} voos selecionados`;
}

function criarGraficoVazio() {
	const ctx = document.querySelector('.grafico-geral').getContext('2d');

	if (graficoGeral) graficoGeral.destroy();
	if (graficoVelocidade) graficoVelocidade.destroy();
	if (graficoAceleracao) graficoAceleracao.destroy();
	if (graficoAnguloX) graficoAnguloX.destroy();
	if (graficoAnguloY) graficoAnguloY.destroy();
	
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
						display: false,
						text: 'Altitude (m)'
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
			maintainAspectRatio: true,
			scales: {
				x: {
					type: 'linear',
					position: 'bottom',
					title: {
						text: 'Tempo (s)',
						display: true
					}
				},
				y: {
					title: {
						text: 'Velocidade (m/s)',
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
			maintainAspectRatio: true,
			scales: {
				x: {
					type: 'linear',
					position: 'bottom',
					title: {
						text: 'Tempo (s)',
						display: true
					}
				},
				y: {
					title: {
						text: 'Aceleração (m/s²)'
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
			maintainAspectRatio: true,
			scales: {
				x: {
					type: 'linear',
					position: 'bottom',
					title: {
						text: 'Tempo (s)',
						display: true
					}
				},
				y: {
					title: {
						text: 'Ângulo X (°)'
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
			maintainAspectRatio: true,
			scales: {
				x: {
					type: 'linear',
					position: 'bottom',
					title: {
						text: 'Tempo (s)',
						display: true
					}
				},
				y: {
					title: {
						text: 'Ângulo Y (°)'
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


/**
 * @typedef {Array<{x: number, y: number}>} PointArray
 * @typedef {{altitude: PointArray, acceleration: PointArray, speed: PointArray, range: number}} TelemetryData
 */

/**
 * @description Calculates the acceleration from the IMU data with smoothing applied.
 * @param {Array<IMUData>} data
 * @returns {PointArray}
 * The acceleration is calculated as the square root of the sum of the squares of the acceleration
 * in the x, y, and z axes (ax, ay, az).
 * A low-pass filter is applied to smooth the acceleration values and make the graph more realistic.
 * @see https://en.wikipedia.org/wiki/Acceleration#Magnitude
 */
function calculate_acceleration(data)
{
	// Smoothing factor (0-1): lower value means more smoothing
	const alpha = 0.001;
	// Previous smoothed acceleration value
	let prevSmoothedAcc = null;
	
	return data.map(leitura => {
		const ax = leitura.ax;
		const ay = leitura.ay;
		const az = leitura.az;
		
		// Calculate raw acceleration magnitude
		const rawAccMagnitude = Math.sqrt(ax * ax + ay * ay + az * az);
		
		// Apply low-pass filter to smooth the acceleration values
		if (prevSmoothedAcc === null) {
			// First point: use raw value
			prevSmoothedAcc = rawAccMagnitude;
		} else {
			// Low-pass filter formula: y[n] = α * x[n] + (1-α) * y[n-1]
			prevSmoothedAcc = alpha * rawAccMagnitude + (1 - alpha) * prevSmoothedAcc;
		}
		
		return { x: leitura.timestamp, y: prevSmoothedAcc };
	});
}

/**
 * @description Calculates the angle in the x-axis from the gyroscope data with smoothing.
 * @param {Array<IMUData>} data
 * @returns {PointArray}
 * The angle in the x-axis is calculated using the arctangent of the ratio of the
 * gyroscope readings in the y-axis (gy) and the square root of the sum of
 * the squares of the gyroscope readings in the x-axis (gx) and z-axis (gz).
 * A low-pass filter is applied to smooth the angle values.
 * @see https://en.wikipedia.org/wiki/Angle_of_elevation#Gyroscope
 */
function calculate_angle_x(data)
{
	// Smoothing factor (0-1): lower value means more smoothing
	const alpha = 0.005;
	// Previous smoothed angle
	let prevSmoothedAngle = null;
	
	return data.map(leitura => {
		const gx = leitura.gx;
		const gy = leitura.gy;
		const gz = leitura.gz;
		
		// Calculate raw angle
		const rawAngleX = Math.atan2(gy, Math.sqrt(gx * gx + gz * gz)) * (180 / Math.PI);
		
		// Apply low-pass filter to smooth the angle values
		if (prevSmoothedAngle === null) {
			// First point: use raw value
			prevSmoothedAngle = rawAngleX;
		} else {
			// Low-pass filter formula: y[n] = α * x[n] + (1-α) * y[n-1]
			prevSmoothedAngle = alpha * rawAngleX + (1 - alpha) * prevSmoothedAngle;
		}
		
		return { x: leitura.timestamp, y: prevSmoothedAngle };
	});
}

/**
 * @description Calculates the angle in the y-axis from the gyroscope data with smoothing.
 * @param {Array<IMUData>} data
 * @returns {PointArray}
 * The angle in the y-axis is calculated using the arctangent of the ratio of the
 * gyroscope readings in the x-axis (gx) and the square root of the sum of
 * the gyroscope readings in the y-axis (gy) and z-axis (gz).
 * A low-pass filter is applied to smooth the angle values.
 * @see https://en.wikipedia.org/wiki/Angle_of_elevation#Gyroscope
 */
function calculate_angle_y(data) {
	// Smoothing factor (0-1): lower value means more smoothing
	const alpha = 0.005;
	// Previous smoothed angle
	let prevSmoothedAngle = null;
	
	return data.map(leitura => {
		const gx = leitura.gx;
		const gy = leitura.gy;
		const gz = leitura.gz;
		
		// Calculate raw angle
		const rawAngleY = Math.atan2(gx, Math.sqrt(gy * gy + gz * gz)) * (180 / Math.PI);
		
		// Apply low-pass filter to smooth the angle values
		if (prevSmoothedAngle === null) {
			// First point: use raw value
			prevSmoothedAngle = rawAngleY;
		} else {
			// Low-pass filter formula: y[n] = α * x[n] + (1-α) * y[n-1]
			prevSmoothedAngle = alpha * rawAngleY + (1 - alpha) * prevSmoothedAngle;
		}
		
		return { x: leitura.timestamp, y: prevSmoothedAngle };
	});
}

/**
 * @description Calculates the velocity by integrating the acceleration data.
 * @param {Array<IMUData>} data
 * @returns {PointArray}
 */
function calculate_velocity(data)
{
	let velocity = 0;
	let prevTimestamp = null;
	const dragCoefficient = 0.05; // Air resistance coefficient
	
	return data.map(leitura => {
		// For points after the first one, integrate acceleration
		if (prevTimestamp !== null) {
			const dt = leitura.timestamp - prevTimestamp;
			
			if (dt > 0) {
				// Use z-axis acceleration for vertical motion
				// az can be positive or negative to increase/decrease velocity
				const deltaV = leitura.az * dt;
				velocity += deltaV;
				
				// Apply air resistance (drag is proportional to velocity squared)
				const dragForce = Math.sign(velocity) * dragCoefficient * velocity * velocity;
				velocity -= dragForce * dt;
			}
		}
		
		// Update previous timestamp for next iteration
		prevTimestamp = leitura.timestamp;
		
		return { x: leitura.timestamp, y: velocity };
	});
}


/**
 * @description Calculates altitude by integrating acceleration and simulates descent after data ends.
 * @param {Array<{timestamp: number, az: number}>} data - The IMU data (timestamps in ms, az in m/s²).
 * @returns {Array<{x: number, y: number}>} - Altitude (y) at each timestamp (x), forming a complete parabola.
 */
function calculate_altitude(data) {
    let velocity = 0;        // m/s
    let altitude = 0;        // m
    let lastTimestamp = data.length > 0 ? data[0].timestamp : 0;
    const points = [];

    // Part 1: Process the available IMU data
    data.forEach(leitura => {
        const dt_ms = leitura.timestamp - lastTimestamp;
        if (dt_ms > 0) {
            const dt_s = dt_ms; // Convert time delta from ms to seconds
            
            // Integrate z-axis acceleration to get velocity
            velocity += leitura.az * dt_s;
            // Integrate velocity to get altitude
            altitude += velocity * dt_s;
        }
        lastTimestamp = leitura.timestamp;
        // Push the calculated point (time in seconds, altitude in meters)
        points.push({ x: leitura.timestamp, y: altitude * 0.004 });
    });

    // --- Simulation Part ---
    // Part 2: Simulate the descent after the last data point
    const G = -9.8065; // Acceleration due to gravity in m/s²
    
    // Use a small, fixed time step for the simulation for consistency
    const simulation_dt_s = 0.25; // 100ms time step for simulation

    let simTime = lastTimestamp;

    while (altitude > 0) {
        // Update velocity and altitude based on gravity
        velocity += G * simulation_dt_s;
        altitude += velocity * simulation_dt_s;
        simTime += simulation_dt_s;

        // Add the new simulated point, ensuring altitude doesn't go below zero
        points.push({ x: simTime, y: Math.max(0, altitude * 0.004) });
    }

    return points;
}

async function atualizarGraficoGeral() {
	try {
		// const response = await fetch('../database.json');
		// const data = await response.json();

		/**
		 * @type {Array<Flight>}
		 */
		let data = [];

		// If there is no local data, then fetch it and save it.
		if (!localStorage.getItem('flights'))
		{
			const response = await fetch('../database.json');
			const data = await response.json();
			localStorage.setItem('flights', JSON.stringify(data));
		}
		else
		{
			data = JSON.parse(localStorage.getItem('flights') ?? '[]');
		}

		const dadosGrafico = {
			labels: [],
			/**
			 * @type {Array<GraphData>}
			 */
			datasets: []
		};

		const dadosGraficoVelocidade = {
			labels: [],
			/**
			 * @type {Array<GraphData>}
			 */
			datasets: []
		};

		const dadosGraficoAceleracao = {
			labels: [],
			/**
			 * @type {Array<GraphData>}
			 */
			datasets: []
		};

		const dadosGraficoAnguloX = {
			labels: [],
			/**
			 * @type {Array<GraphData>}
			 */
			datasets: []
		};

		const dadosGraficoAnguloY = {
			labels: [],
			/**
			 * @type {Array<GraphData>}
			 */
			datasets: []
		};

		const flights = data.filter(flight => selected_flights_ids.includes(flight.id));

		let telemetry_max = {
			altitude: { value: 0, color: '' },
			acceleration: { value: 0, color: '' },
			speed: { value: 0, color: '' },
			range: { value: 0, color: '' },
		}

		const SENSITIVITY = {
			ACCEL: 16384.0,
			GYRO: 131.0,
			G_TO_M_S2: 9.80665,
			TIMESTAMP: 1_000_000.0
		};

		flights.forEach((flight, index) => {

			// normalize ax, ay, az by multiplying by 1 / 2048.0 * 9.81 to transform into  m/s^2
			flight.data = flight.data.map(leitura => ({
				...leitura,
				ax: leitura.ax / SENSITIVITY.ACCEL * SENSITIVITY.G_TO_M_S2,
				ay: leitura.ay / SENSITIVITY.ACCEL * SENSITIVITY.G_TO_M_S2,
				az: leitura.az / SENSITIVITY.ACCEL * SENSITIVITY.G_TO_M_S2,
			}));

			// normalize gx, gy, gz by multiplying by 1 / 65.5 to transform into degrees/s
			flight.data = flight.data.map(leitura => ({
				...leitura,
				gx: leitura.gx / SENSITIVITY.GYRO,
				gy: leitura.gy / SENSITIVITY.GYRO,
				gz: leitura.gz / SENSITIVITY.GYRO,
			}));

			// normalize timestamp from micromicroseconds to seconds
			flight.data = flight.data.map(leitura => ({
				...leitura,
				timestamp: leitura.timestamp / SENSITIVITY.TIMESTAMP
			}));

			// normalize timestamps to handle overflow
			let lastTimestamp = 0;
			let timestampOffset = 0;
			
			flight.data = flight.data.map(leitura => {
				if (leitura.timestamp < lastTimestamp) {
					// Timestamp overflow detected
					timestampOffset += lastTimestamp;
				}
				lastTimestamp = leitura.timestamp;
				return {
					...leitura,
					timestamp: leitura.timestamp + timestampOffset
				};
			});

			/**
			 * @type {TelemetryData}
			 */
			const telemetry = {
				altitude: calculate_altitude(flight.data),
				acceleration: calculate_acceleration(flight.data),
				speed: calculate_velocity(flight.data),
				range: flight.distance,
			};

			const max_altitude_flight = Math.max(...telemetry.altitude.map(p => p.y));
			if (max_altitude_flight > telemetry_max.altitude.value) {
				telemetry_max.altitude = {
					value: max_altitude_flight,
					color: cores[index % cores.length]
				};
			}

			const max_acceleration_flight = Math.max(...telemetry.acceleration.map(p => p.y));
			if (max_acceleration_flight > telemetry_max.acceleration.value) {
				telemetry_max.acceleration = {
					value: max_acceleration_flight,
					color: cores[index % cores.length]
				};
			}

			const max_speed_flight = Math.max(...telemetry.speed.map(p => p.y));
			if (max_speed_flight > telemetry_max.speed.value) {
				telemetry_max.speed = {
					value: max_speed_flight,
					color: cores[index % cores.length]
				};
			}

			if (flight.distance > telemetry_max.range.value)
			{
				telemetry_max.range = {
					value: flight.distance,
					color: cores[index % cores.length]
				};
			}

			dadosGrafico.datasets.push({
				label: `Voo ${flight.date} (${flight.name})`,
				data: telemetry.altitude,
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoVelocidade.datasets.push({
				data: telemetry.speed,
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoAceleracao.datasets.push({
				data: telemetry.acceleration,
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoAnguloX.datasets.push({
				data: calculate_angle_x(flight.data),
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoAnguloY.datasets.push({
				data: calculate_angle_y(flight.data),
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

		telemetry(telemetry_max, flights);

	} catch (error) {
		console.error("Erro ao carregar dados para o gráfico:", error);
	}
}

function iniciar ()
{
	window.alert("Iniciar voos");
}

/**
 * @param {{
 *  altitude: {value: number, color: string},
 *  acceleration: {value: number, color:string},
 *  speed: {value: number, color: string},
 *  range: {value: number, color: string}
 * }} data
 * @param {Array<Flight>} flights
 * @returns {void}
 * @description This function is a placeholder for telemetry data processing.
 */
function telemetry (data, flights)
{
	const maximum_altitude = query(".maximum.altitude", HTMLElement);
	const maximum_acceleration = query(".maximum.acceleration", HTMLElement);
	const maximum_speed = query(".maximum.speed", HTMLElement);
	const given_range_x = query(".given.range.x", HTMLElement);

	maximum_altitude.textContent = `${data.altitude.value.toFixed(2)}m`;
	maximum_altitude.style.color = data.altitude.color;
	maximum_acceleration.textContent = `${data.acceleration.value.toFixed(2)}m/s²`;
	maximum_acceleration.style.color = data.acceleration.color;
	maximum_speed.textContent = `${data.speed.value.toFixed(2)}m/s`;
	maximum_speed.style.color = data.speed.color;

	if (flights.length > 0)
	{
		given_range_x.textContent = `${data.range.value}m`;
		given_range_x.style.color = data.range.color;
	}
	else
	{
		given_range_x.textContent = 'XXm';
		given_range_x.style.color = '';
	}
}

function excluir()
{
	selected_flights_ids = Array.from(inputs.selected_flights.selectedOptions).map(option => option.value);

	const flights = JSON.parse(localStorage.getItem('flights') ?? '[]');

	if (!flights || !flights.length || !selected_flights_ids.length)
	{
		window.alert("Não há voos selecionados para excluir.");
		return;
	}

	const not_selected_flights = flights.filter(flight => !selected_flights_ids.includes(flight.id));

	localStorage.setItem('flights', JSON.stringify(not_selected_flights));
	carregarVoos();
}

async function exportar ()
{
	try {
		selected_flights_ids = Array.from(inputs.selected_flights.selectedOptions).map(option => option.value);

		const flights = JSON.parse(localStorage.getItem('flights') ?? '[]');

		const selected_flights = flights.filter(flight => selected_flights_ids.includes(flight.id));

		if (!flights || !flights.length || !selected_flights_ids.length)
		{
			window.alert("Nenhum voo selecionado para exportar.");
			return;
		}

		const blob = new Blob(
			[JSON.stringify(selected_flights, null, 2)],
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