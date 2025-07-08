#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <freertos/semphr.h>

#include "config.h"
#include "sensor_mpu.h"
#include "sd_card.h"
#include <MPU6050.h>

// === Máquina de estados ===
enum estado_t {
  ESTADO_IDLE,
  ESTADO_COLETANDO,
  ESTADO_FINALIZADO
};
estado_t estado_atual = ESTADO_IDLE;

// === Recursos globais ===
uint8_t buffer_dados[BUFFER_SIZE_BYTES];
size_t buffer_index = 0;
SemaphoreHandle_t mutex_buffer = NULL;
TaskHandle_t handleColeta = NULL;
TaskHandle_t handleGravacao = NULL;
MPU6050 mpu;

void tarefa_coleta(void *arg) {
  /*
    * Tarefa responsável por coletar dados do MPU-6500 e salvar no buffer.
    * Se o estado atual for ESTADO_COLETANDO, chama a função ler_fifo_e_salvar().
    * A tarefa roda continuamente com um delay de 100 ms.
    * Se o estado atual for ESTADO_FINALIZADO, a tarefa não faz nada.
  */
  while (true) {
    if (estado_atual == ESTADO_COLETANDO) {
      ler_fifo_e_salvar();
    }
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void tarefa_gravacao(void *arg) {
  /*
    * Tarefa responsável por salvar os dados do buffer de memória RAM no cartão SD.
    * Se o estado atual for ESTADO_COLETANDO, chama a função salvar_sd_card().
    * A tarefa roda continuamente com um delay de 1000 ms (1 segundo).
    * Se o estado atual for ESTADO_FINALIZADO, a tarefa não faz nada.
  */
  while (true) {
    if (estado_atual == ESTADO_COLETANDO) {
      salvar_sd_card();
    }
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

void setup() {
  Serial.begin(115200);
  while (!Serial) {}
  
  // Inicializa i2c e frequencia
  Wire.begin(I2C_SDA_IO, I2C_SCL_IO);
  Wire.setClock(I2C_FREQ_HZ);

  // Inicializa SPI e SD
  inicializar_sd();
  
  // Configura botão
  pinMode(BUTTON_GPIO, INPUT_PULLUP);

  // Cria mutex
  mutex_buffer = xSemaphoreCreateMutex();
}

void loop() {
  int leitura = digitalRead(BUTTON_GPIO);
   
  // Se a chave for ligada e ainda estamos em repouso
  if (leitura == HIGH && estado_atual == ESTADO_IDLE) { 
    Serial.println("[BOTAO] Iniciando coleta e gravacao");
    estado_atual = ESTADO_COLETANDO;

    mpu.setSleepEnabled(true);
    vTaskDelay(pdMS_TO_TICKS(100));

    if (inicializar_mpu()) {
      xTaskCreate(tarefa_coleta, "coleta", 4096, NULL, 3,  &handleColeta);
      xTaskCreate(tarefa_gravacao, "gravacao", 4096, NULL, 2, &handleGravacao);
    } else {
      Serial.println("Falha ao conectar com MPU6050.");
      estado_atual = ESTADO_IDLE;
    }
  
  // Se a chave for desligada e estávamos coletando
  } else if (leitura == LOW && estado_atual == ESTADO_COLETANDO) {
    Serial.println("[BOTAO] Finalizar coleta");
    estado_atual = ESTADO_FINALIZADO;

    mpu.setFIFOEnabled(false);
    mpu.resetFIFO();
    mpu.setSleepEnabled(true);
    vTaskDelay(pdMS_TO_TICKS(100));
    Serial.println("[MPU] FIFO desativada e limpa.");

    if (mutex_buffer != NULL) {
      salvar_sd_card();
      Serial.println("[SD] Dados finais salvos.");
    }
    if (handleColeta != NULL) {
      vTaskDelete(handleColeta);
      handleColeta = NULL;
    }
    if (handleGravacao != NULL) {
      vTaskDelete(handleGravacao);
      handleGravacao = NULL;
    }

    // Volta ao estado inicial aguardando novo acionamento
    estado_atual = ESTADO_IDLE;
  }

  vTaskDelay(pdMS_TO_TICKS(200));
}
  

  





