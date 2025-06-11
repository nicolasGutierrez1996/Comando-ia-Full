package com.malvinas.comandoia.modelo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PreguntaIARequest {
    private String prompt;
    private List<MensajeIA> historial;


}
