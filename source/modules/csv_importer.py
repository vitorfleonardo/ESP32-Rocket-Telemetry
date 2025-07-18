import csv
import re
from typing import List, Dict, Any
from datetime import datetime
from typess import FlightData, IMUReading, FlightList


def clean_line(line: str) -> str:
    """Limpa caracteres estranhos da linha."""
    # Remove caracteres não ASCII ou de controle
    return re.sub(r'[^\x20-\x7E,]', '', line)


def import_csv_data(csv_path: str) -> FlightList:
    """
    Importa dados diretamente de um arquivo CSV.
    
    Formato esperado do CSV:
    timestamp,ax,ay,az,gx,gy,gz
    
    Retorna uma lista de voos no formato usado pela aplicação.
    Todos os dados do arquivo são considerados como um único voo.
    """
    try:
        # Abre o arquivo e limpa as linhas
        with open(csv_path, 'r', errors='ignore') as file:
            content = file.read()
            # Remove caracteres estranhos
            content = re.sub(r'[^\x20-\x7E\n,]', '', content)
            lines = content.strip().split('\n')
        
        # Cria um único voo para todos os dados
        single_flight = {
            "id_voo": 1,
            "data_lancamento": datetime.now().strftime("%Y-%m-%d"),
            "descricao": "Análise de voo completo",
            "leituras_imu": []
        }
        
        # Adiciona todas as leituras ao voo único
        leitura_id = 1
        for line in lines:
            if not line.strip():
                continue
                
            values = line.strip().split(',')
            if len(values) != 7:
                continue  # Ignora linhas com formato inválido
            
            try:
                timestamp = int(values[0])
                ax = float(values[1])
                ay = float(values[2])
                az = float(values[3])
                gx = float(values[4])
                gy = float(values[5])
                gz = float(values[6])
                
                # Adiciona a leitura ao voo único
                single_flight["leituras_imu"].append({
                    "id_leitura": leitura_id,
                    "tempo": (leitura_id - 1) * 0.05,  # Incremento de 0.05s
                    "ax": ax,
                    "ay": ay,
                    "az": az,
                    "gx": gx,
                    "gy": gy,
                    "gz": gz
                })
                leitura_id += 1
                
            except (ValueError, IndexError):
                # Ignora linhas com valores inválidos
                continue
        
        # Retorna uma lista com apenas um voo
        return [single_flight]
        
    except Exception as e:
        print(f"Erro ao importar CSV: {e}")
        return []
