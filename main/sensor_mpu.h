#ifndef SENSOR_MPU_H
#define SENSOR_MPU_H

#include <Arduino.h>
#include <MPU6050.h>
#include <freertos/semphr.h>

extern MPU6050 mpu;

extern uint8_t buffer_dados[];
extern size_t buffer_index;
extern SemaphoreHandle_t mutex_buffer;

int inicializar_mpu(void);
void ler_fifo_e_salvar(void);

#endif
