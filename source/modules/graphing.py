import matplotlib.pyplot as plt 
from typess import FlightData, IMUReading
from typing import List, Sequence



# Plota os componentes de velocidade ao longo do tempo
def plot_velocity(flight: FlightData) -> None:
    
    leituras: Sequence[IMUReading] = flight["leituras_imu"]
    times: List[float] = [l["tempo"] for l in leituras]

    # Calcular os componentes de velocidade (integração simples)
    vx: List[float] = [0.0]
    vy: List[float] = [0.0]
    vz: List[float] = [0.0]
    
    for i in range(1, len(leituras)):
        dt: float = times[i] - times[i-1]
        vx.append(vx[-1] + leituras[i-1]["ax"] * dt)
        vy.append(vy[-1] + leituras[i-1]["ay"] * dt)
        vz.append(vz[-1] + leituras[i-1]["az"] * dt)
    
    plt.figure(figsize=(10, 6))
    plt.plot(times, vx, label="Vx")
    plt.plot(times, vy, label="Vy")
    plt.plot(times, vz, label="Vz")
    plt.title(f"Velocidade - Voo {flight['id_voo']}")
    plt.xlabel("Tempo (s)")
    plt.ylabel("Velocidade (m/s)")
    plt.legend()
    plt.grid(True)
    plt.show()


# Plota os componentes de aceleração ao longo do tempo
def plot_acceleration(flight: FlightData) -> None:
    leituras: Sequence[IMUReading] = flight["leituras_imu"]
    times: List[float] = [l["tempo"] for l in leituras]
    ax: List[float] = [l["ax"] for l in leituras]
    ay: List[float] = [l["ay"] for l in leituras]
    az: List[float] = [l["az"] for l in leituras]
    
    plt.figure(figsize=(10, 6))
    plt.plot(times, ax, label="Ax")
    plt.plot(times, ay, label="Ay")
    plt.plot(times, az, label="Az")
    plt.title(f"Aceleração - Voo {flight['id_voo']}")
    plt.xlabel("Tempo (s)")
    plt.ylabel("Aceleração (m/s²)")
    plt.legend()
    plt.grid(True)
    plt.show()


# Plota os componentes de velocidade angular ao longo do tempo
def plot_angular_velocity(flight: FlightData) -> None:
    leituras: Sequence[IMUReading] = flight["leituras_imu"]
    times: List[float] = [l["tempo"] for l in leituras]
    gx: List[float] = [l["gx"] for l in leituras]
    gy: List[float] = [l["gy"] for l in leituras]
    gz: List[float] = [l["gz"] for l in leituras]
    
    plt.figure(figsize=(10, 6))
    plt.plot(times, gx, label="Gx")
    plt.plot(times, gy, label="Gy")
    plt.plot(times, gz, label="Gz")
    plt.title(f"Velocidade Angular - Voo {flight['id_voo']}")
    plt.xlabel("Tempo (s)")
    plt.ylabel("Velocidade Angular (rad/s)")
    plt.legend()
    plt.grid(True)
    plt.show()