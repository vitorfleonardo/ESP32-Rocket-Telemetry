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
#define I2C_FREQ_HZ            200000       // Frequência de comunicaçao do barramento I2C (200 kHz)
#define MPU_ADDR               0x68         // pino ADO (address select) do MPU-6500 conectado no GND

// ==== CONFIGURAÇÕES BOTÃO ====
#define BUTTON_GPIO            27           // GPIO 27 da ESP32 -> Botão fisico (ativa & desativa coleta de dados)

// ==== BUFFER ====
#define BUFFER_SIZE_BYTES 1024

// ==== CONFIGURAÇÕES LED & CALIBRACAO ====
#define TEMPO_PRE_CALIBRACAO_SEG 60 // Tempo de espera antes da calibração (em segundos)
#define LED_BUILTIN 2                 // GPIO 2 geralmente é o LED embutido da ESP32

#endif
