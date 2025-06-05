package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.Reclamo;
import java.time.LocalDateTime;
import java.util.List;

public interface ReclamoRepositoryCustom {
    List<Reclamo> buscarConFiltros(
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            String estado,
            String localidad,
            String barrio,
            String tipoReclamo,
            String nivelSatisfaccion,
            Integer tiempoResolucionMayor,
            Integer tiempoResolucionMenor
    );
}