#include "sensor_mpu.h"
#include <Wire.h>
#include "config.h"
#include <stdio.h>

int inicializar_mpu(void) {
  Serial.println("[MPU] Inicializando...");

  // 1. Inicializa I2C e o sensor
  mpu.initialize();
  
  if (!mpu.testConnection()) {
    Serial.println("Erro: MPU6050 não conectado!");
    while (1); // trava o programa
  }

  // 2. Sai do modo sleep e define o clock (antes de qualquer outra configuração)
  mpu.setSleepEnabled(false);                          // Acorda o sensor
  mpu.setClockSource(MPU6050_CLOCK_PLL_XGYRO);         // Usa PLL do giroscópio X como referência de clock
  vTaskDelay(pdMS_TO_TICKS(10));                       // Espera o clock estabilizar

  // 3. Desliga e reseta FIFO antes de configurar
  mpu.setFIFOEnabled(false);                           // Desliga FIFO
  mpu.resetFIFO();                                     // Limpa conteúdo do FIFO
  vTaskDelay(pdMS_TO_TICKS(10));                       // Curto delay de segurança

  // 4. Configura escalas e filtros
  mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_250);      // ±250 °/s
  mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_2);      // ±2g
  mpu.setDLPFMode(3);                                  // Filtro passa-baixa: ~44 Hz
  mpu.setRate(19);                                     // Sample rate: 50 Hz (1kHz / (1+19))
  vTaskDelay(pdMS_TO_TICKS(10));                       // Dá tempo para os registradores aplicarem as mudanças

  // 5. Seleciona quais sensores vão para o FIFO
  mpu.setAccelFIFOEnabled(true);                       // Aceleração
  mpu.setXGyroFIFOEnabled(true);                       // Giroscópio X
  mpu.setYGyroFIFOEnabled(true);                       // Giroscópio Y
  mpu.setZGyroFIFOEnabled(true);                       // Giroscópio Z

  // 6. Ativa FIFO por último
  mpu.setFIFOEnabled(true);
  vTaskDelay(pdMS_TO_TICKS(100));                      // Aguarda sistema estabilizar antes de coletar

  // 7. Calibraçao
  Serial.println("Calibrando automaticamente...");
  vTaskDelay(pdMS_TO_TICKS(6000));
  mpu.CalibrateAccel(15);  // número de loops. Quanto maior, mais lento e mais preciso.
  mpu.CalibrateGyro(15);
  Serial.println("Offsets calibrados:");
  mpu.PrintActiveOffsets();  // imprime os offsets que foram definidos internamente

  Serial.println("[MPU] Inicialização concluída.");
  return 1;
}


void ler_fifo_e_salvar(void) {
    /*
        * Lê os dados do FIFO do MPU e salva no buffer.
        * Se o FIFO estiver vazio, não faz nada.
        * Se houver dados, lê até 64 leituras (12 bytes cada) e salva no buffer.
        * Cada leitura contém: timestamp, ax, ay, az, gx, gy, gz.
    */

    // número de bytes disponíveis na FIFO
    uint16_t fifo_count = mpu.getFIFOCount();

    if (fifo_count >= 1008) {
        Serial.println("[ALERTA] FIFO quase cheia! Possível risco de overflow.");
    }

    // Se menos que 12 bytes (1 amostra completa), retorna
    if (fifo_count < 12) return;

    // Garante que vamos ler múltiplos de 12 (1 leitura = 6 eixos * 2 bytes)
    fifo_count = (fifo_count / 12) * 12;

    uint8_t fifo_buffer[fifo_count];
    mpu.getFIFOBytes(fifo_buffer, fifo_count); // lê todos os dados disponíveis

    // Timestamp atual
    float timestamp_s = micros() / 1e6;

    // Acessa buffer de forma segura com mutex
    xSemaphoreTake(mutex_buffer, portMAX_DELAY);

    // Loop para processar todos os blocos de 12 bytes (amostras) lidos do FIFO
    for (int i = 0; i < fifo_count; i += 12) {
      int16_t ax = (fifo_buffer[i] << 8) | fifo_buffer[i + 1];
      int16_t ay = (fifo_buffer[i + 2] << 8) | fifo_buffer[i + 3];
      int16_t az = (fifo_buffer[i + 4] << 8) | fifo_buffer[i + 5];
      int16_t gx = (fifo_buffer[i + 6] << 8) | fifo_buffer[i + 7];
      int16_t gy = (fifo_buffer[i + 8] << 8) | fifo_buffer[i + 9];
      int16_t gz = (fifo_buffer[i + 10] << 8) | fifo_buffer[i + 11];

      // Serial.printf("%.4f,%d,%d,%d,%d,%d,%d\n", timestamp_s, ax, ay, az, gx, gy, gz);

      // Calcula o espaço restante
      size_t espaco_restante = BUFFER_SIZE_BYTES - buffer_index;
      //Serial.println(espaco_restante);

      // Estima quantos bytes serão escritos (máximo esperado para esta linha)
      // 4 bytes timestamp + 6*6 bytes (valores e separadores) ≈ 64 no pior caso
      if (espaco_restante < 64) {
          Serial.println("[ERRO] Buffer cheio — descartando leitura");
          break; // evita sobrescrever
      }

      // Escreve no buffer de forma segura
      int escrito = snprintf(
        (char*)&buffer_dados[buffer_index],
        espaco_restante,
        "%.4f,%d,%d,%d,%d,%d,%d\n",
        timestamp_s, ax, ay, az, gx, gy, gz
      );
      
      if (escrito > 0 && (buffer_index + escrito) < BUFFER_SIZE_BYTES) {
          buffer_index += escrito;
      } else {
          Serial.println("[ERRO] Falha ao escrever no buffer (snprintf)");
          break;
      }
      
    }

    xSemaphoreGive(mutex_buffer);
}
