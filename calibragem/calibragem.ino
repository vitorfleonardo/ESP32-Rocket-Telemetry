#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  mpu.initialize();

  if (!mpu.testConnection()) {
    Serial.println("MPU6050 não conectado!");
    while (1);
  }

  Serial.println("Calibrando automaticamente...");
  delay(1000);  // Dá tempo para estabilizar

  mpu.CalibrateAccel(10);  // número de loops. Quanto maior, mais lento e mais preciso.
  mpu.CalibrateGyro(10);

  Serial.println("Offsets calibrados:");
  mpu.PrintActiveOffsets();  // imprime os offsets que foram definidos internamente
}

void loop() {}
