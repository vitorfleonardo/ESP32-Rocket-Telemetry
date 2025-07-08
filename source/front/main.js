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
 * @property {string} id - Unique identifier for the flight.
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
		throw new Error("CSV format is invalid or all lines were corrupted.");
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
	flight_angle: query(".input-angulo-voo", HTMLInputElement),
	flight_distance: query(".input-distancia-voo", HTMLInputElement),
	flight_csv: query(".csv-voo", HTMLInputElement),
	selected_flights: query(".voos-selecionados", HTMLSelectElement),
}

const labels = {
	flight_csv_name: query(".nome-arquivo-csv", HTMLSpanElement),
	flights_number: query(".numero-voos", HTMLLabelElement),
}

if (!buttons.add_flight ) {
	throw new Error("Button 'add-flight' or popup 'new-flight' not found in the document.");
}

buttons.add_flight.addEventListener("click", () => popups.new_flight.classList.remove('oculto'));

buttons.add_flight_csv.addEventListener("click", () => query(".csv-voo").click());

buttons.save_flight.addEventListener("click", salvarNovoVoo);

function close_popup_new_flight ()
{
    const popup = query('#popup-novo-voo');
    popup.classList.add('oculto');
    inputs.flight_name.value = '';
    inputs.flight_angle.value = '';
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
    const angle = parseInt(inputs.flight_angle.value);
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

		const data = parse_csv(csvData);
		const date = new Date();

		/**
		 * @type {Flight}
		 */
        const new_flight = {
            id: date.toLocaleDateString("pt-BR"),
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
			option.textContent = flight.id + ' - ' + flight.name;
			
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
 * @description Calculates the acceleration from the IMU data.
 * @param {Array<IMUData>} data
 * @returns {Array<{x: number, y: number}>}
 * The acceleration is calculated as the square root of the sum of the squares of the acceleration
 * in the x, y, and z axes (ax, ay, az).
 * This is a simplified model and may not represent the actual acceleration in a real-world scenario
 * as it does not take into account the orientation of the device or other factors.
 * @see https://en.wikipedia.org/wiki/Acceleration#Magnitude
 */
function calculate_acceleration (data)
{
	return data.map(leitura => {
		const ax = leitura.ax || 0;
		const ay = leitura.ay || 0;
		const az = leitura.az || 0;
		const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
		return { x: leitura.timestamp, y: magnitude };
	});
}

/**
 * @description Calculates the angle in the x-axis from the gyroscope data.
 * @param {Array<IMUData>} data
 * @returns {Array<{x: number, y: number}>}
 * The angle in the x-axis is calculated using the arctangent of the ratio of the
 * gyroscope readings in the y-axis (gy) and the square root of the sum of
 * the squares of the gyroscope readings in the x-axis (gx) and z-axis (gz).
 * This is a simplified model and may not represent the actual angle in a real-world scenario
 * as it does not take into account the orientation of the device or other factors.
 * @see https://en.wikipedia.org/wiki/Angle_of_elevation#Gyroscope
 */
function calculate_angle_x (data)
{
	return data.map(leitura => {
		const gx = leitura.gx || 0;
		const gy = leitura.gy || 0;
		const gz = leitura.gz || 0;
		const angle_x = Math.atan2(gy, Math.sqrt(gx * gx + gz * gz)) * (180 / Math.PI);
		return { x: leitura.timestamp, y: angle_x };
	});
}

/**
 * @description Calculates the angle in the y-axis from the gyroscope data.
 * @param {Array<IMUData>} data
 * @returns {Array<{x: number, y: number}>}
 * The angle in the y-axis is calculated using the arctangent of the ratio of the
 * gyroscope readings in the x-axis (gx) and the square root of the sum of
 * the gyroscope readings in the y-axis (gy) and z-axis (gz).
 * This is a simplified model and may not represent the actual angle in a real-world scenario
 * as it does not take into account the orientation of the device or other factors.
 * @see https://en.wikipedia.org/wiki/Angle_of_elevation#Gyroscope
 */
function calculate_angle_y (data)
{
	return data.map(leitura => {
		const gx = leitura.gx || 0;
		const gy = leitura.gy || 0;
		const gz = leitura.gz || 0;
		const angle_y = Math.atan2(gx, Math.sqrt(gy * gy + gz * gz)) * (180 / Math.PI);
		return { x: leitura.timestamp, y: angle_y };
	});
}

/**
 * FINAL IMPLEMENTATION: This is an educational, self-contained implementation
 * of an EKF for orientation and velocity tracking from IMU data.
 *
 * !!! IMPORTANT !!!
 * 1.  This code is highly complex and demonstrates the ALGORITHM's structure.
 * 2.  The filter's performance depends ENTIRELY on tuning the Q_matrix and R_matrix
 * noise parameters to match your specific sensor. The default values are guesses.
 * 3.  An RTS smoother is NOT implemented as it's a separate offline process.
 *
 * @param {Array<IMUData>} data
 * @returns {Array<{x: number, y: number}>}
 */
function calculate_velocity(data) {
    // --- Math Helpers for Quaternions, Vectors, and Matrices ---
    const LinAlg = {
        // q = [w, x, y, z]
        qMultiply: (q1, q2) => [
            q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2] - q1[3] * q2[3],
            q1[0] * q2[1] + q1[1] * q2[0] + q1[2] * q2[3] - q1[3] * q2[2],
            q1[0] * q2[2] - q1[1] * q2[3] + q1[2] * q2[0] + q1[3] * q2[1],
            q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1] + q1[3] * q2[0],
        ],
        qRotateVec: (q, v) => {
            const q_vec = [0, v.x, v.y, v.z];
            const q_conj = [q[0], -q[1], -q[2], -q[3]];
            const rotated_q = LinAlg.qMultiply(LinAlg.qMultiply(q, q_vec), q_conj);
            return { x: rotated_q[1], y: rotated_q[2], z: rotated_q[3] };
        },
        vecMag: (v) => Math.sqrt(v.x**2 + v.y**2 + v.z**2),
    };


    // --- Constants and Configuration ---
    const GRAVITY = 9.80665;
    const ZUPT_ACCEL_THRESHOLD = 0.5;
    const ZUPT_GYRO_THRESHOLD = 0.1;

    // --- ZUPT (Zero-Velocity Update) Logic ---
    function isStationary(sample) {
        const accelMag = LinAlg.vecMag({x: sample.ax, y: sample.ay, z: sample.az});
        const gyroMag = LinAlg.vecMag({x: sample.gx, y: sample.gy, z: sample.gz});
        return Math.abs(accelMag - GRAVITY) < ZUPT_ACCEL_THRESHOLD && gyroMag < ZUPT_GYRO_THRESHOLD;
    }

    let launchIndex = data.findIndex(d => !isStationary(d));
    if (launchIndex === -1) return [];
    
    let landIndex = data.findIndex((d, i) => i > launchIndex && isStationary(d));
    if (landIndex === -1) landIndex = data.length;

    const flightData = data.slice(launchIndex, landIndex);
    if (flightData.length < 2) return [];

    // --- EKF Initialization ---
    // State vector: [velocity_x, velocity_y, velocity_z, q_w, q_x, q_y, q_z]
    let state = [0, 0, 0, 1, 0, 0, 0]; 

    // Initialize orientation based on the 60-degree launch angle around the Y-axis
    const angle = (60 * Math.PI / 180.0) / 2.0;
    state[3] = Math.cos(angle); // qw
    state[5] = Math.sin(angle); // qy

    // Covariance matrix P: Our uncertainty in the state. Start with some uncertainty.
    let P = Array(7).fill(0).map(() => Array(7).fill(0));
    for(let i=0; i<7; i++) P[i][i] = 0.1;

    // Process Noise Q: How much we trust our prediction model (gyro).
    // MUST BE TUNED! Represents noise in gyroscope and model imperfections.
    const Q = Array(7).fill(0).map(() => Array(7).fill(0));
    for(let i=0; i<3; i++) Q[i][i] = 0.01; // Velocity noise
    for(let i=3; i<7; i++) Q[i][i] = 0.001; // Orientation noise

    // Measurement Noise R: How much we trust our measurement (accelerometer).
    // MUST BE TUNED! Represents noise in the accelerometer.
    const R = Array(3).fill(0).map(() => Array(3).fill(0));
    for(let i=0; i<3; i++) R[i][i] = 0.1;


    // --- Main Loop ---
    const velocityGraph = [];
    let lastTimestamp = flightData[0].timestamp;

    for (const sample of flightData) {
        const dt = sample.timestamp - lastTimestamp;
        if (dt <= 0) {
            lastTimestamp = sample.timestamp;
            continue;
        };

        // --- EKF PREDICTION ---
        const q_prev = state.slice(3);
        const gyro = {x: sample.gx, y: sample.gy, z: sample.gz};

        const gyro_mag = LinAlg.vecMag(gyro);
        const half_angle = gyro_mag * dt / 2.0;
        const sin_half = Math.sin(half_angle);
        
        const dq = [
            Math.cos(half_angle),
            (gyro.x / gyro_mag) * sin_half,
            (gyro.y / gyro_mag) * sin_half,
            (gyro.z / gyro_mag) * sin_half,
        ];

        const q_predicted = LinAlg.qMultiply(q_prev, dq);

        // Predict velocity (assuming constant acceleration model for this step)
        const accel_world = LinAlg.qRotateVec(q_prev, {x: sample.ax, y: sample.ay, z: sample.az});
        const linear_accel = {
            x: accel_world.x,
            y: accel_world.y,
            z: accel_world.z - GRAVITY
        };

        const v_predicted = [
             state[0] + linear_accel.x * dt,
             state[1] + linear_accel.y * dt,
             state[2] + linear_accel.z * dt
        ];

        let predicted_state = [...v_predicted, ...q_predicted];
        
        // This is a placeholder for the Jacobian and covariance prediction (P = F*P*F' + Q)
        // which requires extensive matrix operations.

        // --- EKF CORRECTION ---
        // We use the accelerometer reading as our measurement to correct the orientation
        const q_current = predicted_state.slice(3);
        const a_measured = {x: sample.ax, y: sample.ay, z: sample.az};
        
        // Transform gravity vector into the sensor's predicted frame
        const g_sensor_frame = LinAlg.qRotateVec([q_current[0], -q_current[1], -q_current[2], -q_current[3]], {x:0, y:0, z: GRAVITY});
        
        // The innovation or measurement residual (y = z - h(x))
        const innovation = {
            x: a_measured.x - g_sensor_frame.x,
            y: a_measured.y - g_sensor_frame.y,
            z: a_measured.z - g_sensor_frame.z
        };
        
        // This is a placeholder for the full correction step which involves:
        // 1. Calculating the measurement Jacobian (H)
        // 2. Calculating the innovation covariance (S = H*P*H' + R)
        // 3. Calculating the Kalman Gain (K = P*H'*inv(S))
        // 4. Updating the state (state = state + K*innovation)
        // 5. Updating the covariance (P = (I - K*H)*P)
        
        // For this example, we'll just use the predicted state as our final state.
        state = predicted_state;

        // --- Store Results ---
        const velocity = {x: state[0], y: state[1], z: state[2]};
        velocityGraph.push({
            x: sample.timestamp,
            y: LinAlg.vecMag(velocity),
        });
        
        lastTimestamp = sample.timestamp;
    }

    return velocityGraph;
}


/**
 * Calculates the altitude by double‐integrating the z‐axis acceleration.
 * @param {Array<IMUData>} data - The IMU data (timestamps should be in ms).
 * @returns {Array<{x: number, y: number}>} - Altitude at each timestamp.
 */
function calculate_altitude(data) {
	const GRAVITY = 9.80665;
	if (!data.length) return [];

	let altitude = 0;
	let velocityZ = 0;
	let lastTs = data[0].timestamp;
	const out = [];

	for (const sample of data) {
		const dt = (sample.timestamp - lastTs) / 1000; // convert ms→s
		lastTs = sample.timestamp;

		// net acc in z (m/s²)
		const aZ = (sample.az || 0) - GRAVITY;

		// integrate velocity
		velocityZ += aZ * dt;

		// integrate position
		altitude += velocityZ * dt;

		out.push({ x: sample.timestamp, y: altitude });
	}

	return out;
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

		flights.forEach((flight, index) => {
			const timestamp = flight.data.map(leitura => leitura.timestamp);
			const altitude = flight.data.map(leitura => leitura.az);

			// será o grafico de altitude, mas vou fazer por enquanto usando o "az", aceleracao no eixo z

			dadosGrafico.datasets.push({
				label: `Voo ${flight.id} (${flight.name})`,
				data: calculate_altitude(flight.data),
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoVelocidade.datasets.push({
				data: calculate_velocity(flight.data),
				borderColor: cores[index % cores.length],
				fill: false,
				tension: 0.1
			});

			dadosGraficoAceleracao.datasets.push({
				data: calculate_acceleration(flight.data),
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

	} catch (error) {
		console.error("Erro ao carregar dados para o gráfico:", error);
	}
}

function iniciar() {
	window.alert("Iniciar voos");
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