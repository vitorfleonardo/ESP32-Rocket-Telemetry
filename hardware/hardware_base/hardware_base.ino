#include <MD_MAX72xx.h>
#include <SPI.h>

// --- Configuração da Matriz de LED ---
#define HARDWARE_TYPE MD_MAX72XX::FC16_HW
#define MAX_DEVICES   1
#define CLK_PIN       18
#define DATA_PIN      23
#define CS_PIN        19

// --- Configuração dos Pinos ---
const int pinoIN1 = 2; // Ponte H
const int pinoIN2 = 4; // Ponte H
const int pinoENA = 5;  // Ponte H
const int pinoSwitch = 15; // Nosso novo interruptor

// --- Variável para detectar a mudança de estado do interruptor ---
int ultimoEstadoSwitch = HIGH; 

// --- Inicialização do Objeto da Matriz ---
MD_MAX72XX mx = MD_MAX72XX(HARDWARE_TYPE, DATA_PIN, CLK_PIN, CS_PIN, MAX_DEVICES);


// ===== FUNÇÃO COM TODA A LÓGICA DA CONTAGEM E DO MOTOR =====
void executarSequenciaCompleta() {
  Serial.println("Interruptor acionado! Iniciando sequencia...");

  // -- Bloco da contagem regressiva de 9 a 0 --
  for (int i = 9; i >= 0; i--) {
    mx.clear();
    mx.setChar(COL_SIZE - 2, '0' + i);
    delay(1000); 
  }
  
  // -- BLOCO DE CONTROLE DO MOTOR --
  mx.clear();
  mx.setChar(COL_SIZE - 2, '^');
  // 1. Girar em uma direção
  Serial.println("MOTOR: Girando em uma direcao...");
  mx.setChar(COL_SIZE - 2, '^');
  digitalWrite(pinoIN1, HIGH);
  digitalWrite(pinoIN2, LOW);
  digitalWrite(pinoENA, HIGH);
  delay(2000);

 
  digitalWrite(pinoENA, LOW);
  delay(3000);

  Serial.println("MOTOR: Girando na outra direcao...");
  digitalWrite(pinoIN1, LOW);
  digitalWrite(pinoIN2, HIGH);
  digitalWrite(pinoENA, HIGH);
  delay(2000);

  // 3. Parada final
  digitalWrite(pinoENA, LOW);
  Serial.println("Sequencia finalizada. Aguardando proximo acionamento.");
  mx.clear();
}


void setup() {
  Serial.begin(115200);
  Serial.println("--- Projeto com Gatilho por Interruptor ---");
  Serial.println("Aguardando acionamento do interruptor...");

  // --- Configura o pino do interruptor ---
  // INPUT_PULLUP ativa um resistor interno que mantém o pino em HIGH quando não está conectado ao GND.
  pinMode(pinoSwitch, INPUT_PULLUP);

  // --- Inicializa os pinos da Ponte H ---
  pinMode(pinoIN1, OUTPUT);
  pinMode(pinoIN2, OUTPUT);
  pinMode(pinoENA, OUTPUT);
  digitalWrite(pinoENA, LOW); 

  // --- Inicializa a Matriz ---
  mx.begin();
  mx.control(MD_MAX72XX::INTENSITY, 5);
  mx.clear();

  // Lê o estado inicial do switch para evitar um acionamento falso ao ligar
  ultimoEstadoSwitch = digitalRead(pinoSwitch);
}

void loop() {
  // O loop agora é muito simples: ele apenas vigia o interruptor.
  mx.clear();
  mx.setChar(COL_SIZE - 2, '-');
  
  // 1. Lê o estado atual do interruptor
  int estadoAtualSwitch = digitalRead(pinoSwitch);

  // 2. Compara com o último estado conhecido
  if (estadoAtualSwitch != ultimoEstadoSwitch) {
    // Houve uma mudança!
    delay(50); // Um pequeno delay para "debounce", evita múltiplos gatilhos por mau contato.

    // 3. Verifica se a mudança foi para a posição "LIGADO" (conectado ao GND, estado LOW)
    if (estadoAtualSwitch == LOW) {
      // 4. Se sim, executa a nossa função com toda a lógica
      executarSequenciaCompleta();
    }
  }

  // 5. Atualiza o último estado para a próxima verificação no loop
  ultimoEstadoSwitch = estadoAtualSwitch;
}