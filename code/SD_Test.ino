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
volatile bool botao_pressionado = false;
MPU6050 mpu;

void tarefa_coleta(void *arg) {
  /*
    * Tarefa responsável por coletar dados do MPU-6500 e salvar no buffer.
    * Se o estado atual for ESTADO_COLETANDO, chama a função ler_fifo_e_salvar().
    * A tarefa roda continuamente com um delay de 100 ms.
    * Se o estado atual for ESTADO_FINALIZADO, a tarefa não faz nada.
  */
  Serial.println("entrou t_coleta");
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

void IRAM_ATTR isr_botao() {
  static int64_t ultimo_press = 0;
  int64_t agora = micros();

  if ((agora - ultimo_press) > DEBOUNCE_TIME_MS * 1000) {
    ultimo_press = agora;
    botao_pressionado = true; // apenas sinaliza o evento
  }
}

void setup() {
  Serial.begin(115200);
  while (!Serial) {}
  
  // Inicializa i2c e frequencia 100 khz
  Wire.begin(I2C_SDA_IO, I2C_SCL_IO);
  Wire.setClock(I2C_FREQ_HZ);

  // Inicializa SPI e SD
  inicializar_sd();
  
  // Configura botão
  pinMode(BUTTON_GPIO, INPUT); //define o pino como entrada
  attachInterrupt(digitalPinToInterrupt(BUTTON_GPIO), isr_botao, FALLING); //espera a interrupçao, e chama a funçao isr_botao quando o sinal sair de High para low

  // // Cria mutex
  mutex_buffer = xSemaphoreCreateMutex();

  if (mutex_buffer == NULL) {
    Serial.println("[ERRO] Falha ao criar mutex");
    while (true); // para tudo
  }
  Serial.println("[SETUP] Mutex criado.");
}

void loop() {
  if (botao_pressionado) {
    botao_pressionado = false;

    if (estado_atual == ESTADO_IDLE) {
      Serial.println("[BOTAO] Iniciaando coleta e gravacao");
      estado_atual = ESTADO_COLETANDO;

      if (inicializar_mpu()) {
        xTaskCreate(tarefa_coleta, "coleta", 4096, NULL, 2, NULL);
        xTaskCreate(tarefa_gravacao, "gravacao", 4096, NULL, 1, NULL);
      } else {
        Serial.println("Falha ao conectar com MPU6050.");
        estado_atual = ESTADO_IDLE;
      }

    } else if (estado_atual == ESTADO_COLETANDO) {
      Serial.println("[BOTÃO] Finalizar coleta");
      estado_atual = ESTADO_FINALIZADO;

      // Desativa FIFO
      mpu.setFIFOEnabled(false);
      mpu.resetFIFO();
      Serial.println("[MPU] FIFO desativada e limpa.");

      // Salva o que restar no buffer
      if (mutex_buffer != NULL) {
        salvar_sd_card();
        Serial.println("[SD] Dados finais salvos.");
      }
    }
  }
}

