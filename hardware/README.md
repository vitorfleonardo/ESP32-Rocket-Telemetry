1. Apague tudo do SD card e depois no computador rode:

```bash
udisksctl unmount -b /dev/sda1
udisksctl power-off -b /dev/sda1
```

- Primeiro desmonta e notifica corretamente o sistema
- Segundo desliga eletricamente o leitor de SD
- Depois disso espere 2 minutos antes de inserir o SD no Micro SD adapter

2. Com o codigo ja embarcado na esp32, aperte o botao "en" para reset
3. Logo apos o SD card tera iniciado e clique no botao para iniciar as coletas e gravaçoes no SD card
4. Quando desejar parar as coletas e gravaçoes aperte novamente o botao
5. Extraia o SD card e analise os dados

# Setagem das taxas de comunicaçao I2C, Amostragem do MPU e delay de Tasks

|        Etapa         |           Valor           |             Comentário              |
| :------------------: | :-----------------------: | :---------------------------------: |
| **Amostragem (MPU)** |  50 Hz (1 a cada 20 ms)   |    Balanceado com o filtro DLPF     |
|   **FIFO acúmulo**   |   600 bytes por segundo   |         Cabe 1.7 s de dados         |
|   **Task coleta**    |       A cada 100 ms       |    Coleta \~60 bytes por chamada    |
|  **I2C a 100 kHz**   | \~1 ms por leitura de 12B | Pode atrasar se FIFO crescer demais |
|  **Task gravação**   |   A cada 200 ms (0,2 s)   |      Grava \~600 bytes por vez      |

# 🧭 Formato do Arquivo CSV

Cada linha contém uma amostra com timestamp e os 6 eixos do MPU6050:

| Campo     | Descrição                    | Unidade  | Conversão (Arduino) |
| --------- | ---------------------------- | -------- | ------------------- |
| timestamp | Tempo desde o boot da esp32  | segundos | `micros() / 1e6`    |
| ax        | Aceleração no eixo X         | g        | `ax / 16384.0`      |
| ay        | Aceleração no eixo Y         | g        | `ay / 16384.0`      |
| az        | Aceleração no eixo Z         | g        | `az / 16384.0`      |
| gx        | Velocidade angular no eixo X | °/s      | `gx / 131.0`        |
| gy        | Velocidade angular no eixo Y | °/s      | `gy / 131.0`        |
| gz        | Velocidade angular no eixo Z | °/s      | `gz / 131.0`        |

> ℹ️ Os valores são `int16_t` brutos. Recomenda-se fazer a conversão no pós-processamento ou no código se desejar unidades físicas diretamente.

# 🛠️ Como interpretar os dados do .csv

## Aceleração (ax, ay, az)

Esses campos representam a aceleração em cada eixo e estão configurados para a faixa ±2g. Isso significa:

- O valor bruto ±32768 representa ±2g, logo 1g = 16384
- Para converter para aceleração (m/s²): (ax / 16384.0) \* 9.81

## Giroscópio (gx, gy, gz)

Esses campos representam a velocidade angular em cada eixo e estão configurados para a faixa ±250°/s. Isso significa:

- O valor bruto ±32768 representa ±250°/s, logo o fator de conversão é 131
- Para converter para velocidade_angular (°/s): gx / 131.0

## Timestamp

O campo timestamp representa o tempo em segundos desde que a placa foi ligada.


https://www.ariat-tech.pt/blog/optimizing-performance-with-mpu-6050-setup,calibration,and-applications.html