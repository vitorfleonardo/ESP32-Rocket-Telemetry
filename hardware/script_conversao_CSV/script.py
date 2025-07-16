import pandas as pd

# Constantes de conversão
ACCEL_SENSITIVITY = 16384.0  # LSB/g
GYRO_SENSITIVITY = 131.0     # LSB/(°/s)
G_TO_M_S2 = 9.80665          # 1g em m/s²

# Arquivos de entrada e saída
ARQUIVO_ENTRADA = "dados.xlsx"
ARQUIVO_SAIDA = "dados_convertidos.xlsx"

# Leitura do Excel sem cabeçalho (header=None)
try:
    df = pd.read_excel(ARQUIVO_ENTRADA, header=None)
except Exception as e:
    print(f"Erro ao ler o arquivo Excel: {e}")
    exit()

# Atribuir nomes às colunas manualmente
df.columns = ['timestamp', 'ax', 'ay', 'az', 'gx', 'gy', 'gz']

# Função para converter uma linha
def converter_linha(linha):
    try:
        timestamp_s = float(linha['timestamp']) / 1_000_000.0
        ax = float(linha['ax']) / ACCEL_SENSITIVITY * G_TO_M_S2
        ay = float(linha['ay']) / ACCEL_SENSITIVITY * G_TO_M_S2
        az = float(linha['az']) / ACCEL_SENSITIVITY * G_TO_M_S2
        gx = float(linha['gx']) / GYRO_SENSITIVITY
        gy = float(linha['gy']) / GYRO_SENSITIVITY
        gz = float(linha['gz']) / GYRO_SENSITIVITY

        return pd.Series([
            timestamp_s, ax, ay, az, gx, gy, gz
        ], index=[
            'timestamp_s', 'ax_mps2', 'ay_mps2', 'az_mps2',
            'gx_dps', 'gy_dps', 'gz_dps'
        ])
    except:
        return pd.Series([None]*7, index=[
            'timestamp_s', 'ax_mps2', 'ay_mps2', 'az_mps2',
            'gx_dps', 'gy_dps', 'gz_dps'
        ])

# Aplicar conversão
df_convertido = df.apply(converter_linha, axis=1)

# Juntar dados originais com convertidos
df_final = pd.concat([df, df_convertido], axis=1)

# Salvar o resultado em um novo arquivo Excel
df_final.to_excel(ARQUIVO_SAIDA, index=False)

print(f"Conversão concluída com sucesso. Arquivo salvo como '{ARQUIVO_SAIDA}'.")
