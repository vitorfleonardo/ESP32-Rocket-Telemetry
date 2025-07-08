#ifndef CONFIG_H
#define CONFIG_H

// ==== CONFIGURAÇÕES DO SPI (MicroSD) ====
#define PIN_MOSI                23
#define PIN_MISO                19
#define PIN_SCK                 18
#define PIN_CS                  5

// ==== CONFIGURAÇÕES I2C (MPU-6500) ====
#define I2C_SDA_IO             21           // GPIO 21 da ESP32 -> SDA do MPU-6500 (fio de dados)
#define I2C_SCL_IO             22           // GPIO 22 da ESP32 -> SCL do MPU-6500 (fio de clock)
#define I2C_FREQ_HZ            400000       // Frequência de comunicaçao do barramento I2C (200 kHz)
#define MPU_ADDR               0x68         // pino ADO (address select) do MPU-6500 conectado no GND

// ==== CONFIGURAÇÕES BOTÃO ====
#define BUTTON_GPIO            27           // GPIO 27 da ESP32 -> Botão fisico (ativa & desativa coleta de dados)
// #define DEBOUNCE_TIME_MS       50           // Tempo de debounce do botão (50 ms)

// ==== REGISTRADORES MPU-6500 ====
#define MPU_PWR_MGMT_1         0x6B // Função: Controla o estado de energia do chip
#define MPU_SMPLRT_DIV         0x19 // Função: Define o divisor da taxa de amostragem
#define MPU_CONFIG             0x1A // Função: Controla filtros digitais (DLPF) e sincronização
#define MPU_GYRO_CONFIG        0x1B // Função: Configura escala do giroscópio (sensibilidade) e modo self-test
#define MPU_ACCEL_CONFIG       0x1C // Função: Configura escala do acelerômetro e self-test
#define MPU_FIFO_EN            0x23 // Função: Ativa quais dados são enviados à FIFO
#define MPU_USER_CTRL          0x6A // Função: Controla FIFO e I2C
#define MPU_FIFO_COUNTH        0x72 // Função: Indica o número de bytes disponíveis na FIFO - parte alta (bits 15–8)
#define MPU_FIFO_COUNTL        0x73 // Função: Indica o número de bytes disponíveis na FIFO - parte baixa (bits bits 7–0)
#define MPU_FIFO_RW            0x74 // Função: Registrador de leitura e escrita FIFO

// ==== BUFFER ====
#define BUFFER_SIZE_BYTES 1024

#endif
