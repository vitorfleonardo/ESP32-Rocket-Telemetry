#include "sd_card.h"
#include "config.h"
#include <SPI.h>
#include <SD.h>
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>

extern uint8_t buffer_dados[];
extern size_t buffer_index;
extern SemaphoreHandle_t mutex_buffer;

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
  Serial.println("[SD] Tentando salvar...");
  if (buffer_index == 0) return;
  File f = SD.open("/dados.csv", FILE_APPEND);
  if (f) {
    Serial.print("[SD] Gravando ");
    Serial.print(buffer_index);
    Serial.println(" bytes...");
    xSemaphoreTake(mutex_buffer, portMAX_DELAY);
    f.write(buffer_dados, buffer_index);
    buffer_index = 0;
    xSemaphoreGive(mutex_buffer);
    f.close();
    Serial.println("[SD] Dados gravados.");
  } else {
    Serial.println("[ERRO] Falha ao abrir dados.csv");
  }
}

// void escrever_arquivo(const char* nome, const char* conteudo) {
//   File file = SD.open(nome, FILE_WRITE);
//   if (file) {
//     file.println(conteudo);
//     file.close();
//     Serial.println("Arquivo gravado com sucesso!");
//   } else {
//     Serial.println("Erro ao criar arquivo.");
//   }
// }

// void listar_arquivos() {
//   File root = SD.open("/");
//   if (!root) {
//     Serial.println("Erro ao abrir diretório raiz.");
//     return;
//   }

//   while (true) {
//     File entry = root.openNextFile();
//     if (!entry) break;
//     Serial.print("Arquivo: ");
//     Serial.print(entry.name());
//     Serial.print(" (");
//     Serial.print(entry.size());
//     Serial.println(" bytes)");
//     entry.close();
//   }
// }
