#include "sd_card.h"
#include "config.h"
#include "sensor_mpu.h"
#include <SPI.h>
#include <SD.h>

void inicializar_sd() {
  Serial.print("[SD] Inicializando... ");
  SPI.begin(PIN_SCK, PIN_MISO, PIN_MOSI, PIN_CS);

  if (!SD.begin(PIN_CS)) {
    Serial.println("Erro ao iniciar SD.");
    return;
  }
  
  Serial.println("OK.");
}

void salvar_sd_card() {
  // Se nao tiver dados no buffer return
  if (buffer_index == 0) return;

  // Abre ou cria o arquivo para escrever
  File f = SD.open("/dados.csv", FILE_APPEND);

  // Se foi aberto com sucesso
  if (f) {
    // bytes gravados do buffer
    Serial.print("[SD] Gravando ");
    Serial.print(buffer_index);
    Serial.println(" bytes...");

    xSemaphoreTake(mutex_buffer, portMAX_DELAY);

    // grava buffer_index bytes 
    f.write(buffer_dados, buffer_index);
    buffer_index = 0;

    xSemaphoreGive(mutex_buffer);
    f.close();

    Serial.println("[SD] Dados gravados.");
  } else {
    Serial.println("[ERRO] Falha ao abrir dados.csv");
  }
}
