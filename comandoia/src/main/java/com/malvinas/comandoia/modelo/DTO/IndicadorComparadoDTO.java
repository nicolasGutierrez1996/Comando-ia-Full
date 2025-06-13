package com.malvinas.comandoia.modelo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class IndicadorComparadoDTO {
    private String nombre;
    private BigDecimal valorActual;
    private String unidad;
    private BigDecimal variacion;
    private String direccion;
}
