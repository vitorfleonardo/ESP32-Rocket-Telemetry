import pandas as pd

# Arquivos de entrada e saída
ARQUIVO_CSV = 'dados.csv'
ARQUIVO_XLSX = 'dados.xlsx'

try:
    # Leitura do CSV (detectando codificação automaticamente, se necessário)
    df = pd.read_csv(ARQUIVO_CSV, encoding='utf-8')  # ou 'ISO-8859-1' se necessário

    # Escrita no formato Excel
    df.to_excel(ARQUIVO_XLSX, index=False)

    print(f"Conversão concluída com sucesso. Arquivo salvo como '{ARQUIVO_XLSX}'.")
except Exception as e:
    print(f"Ocorreu um erro na conversão: {e}")