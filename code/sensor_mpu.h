#ifndef SENSOR_MPU_H
#define SENSOR_MPU_H

#include <Arduino.h>

int inicializar_mpu(void);
void ler_fifo_e_salvar(void);

extern uint8_t buffer_dados[];
extern size_t buffer_index;

#endif
