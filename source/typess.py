from typing import TypedDict, List

class IMUReading(TypedDict):
    id_leitura: int
    tempo: float
    ax: float
    ay: float
    az: float
    gx: float
    gy: float
    gz: float

class FlightData(TypedDict):
    id_voo: int
    data_lancamento: str
    descricao: str
    leituras_imu: List[IMUReading]

FlightList = List[FlightData]