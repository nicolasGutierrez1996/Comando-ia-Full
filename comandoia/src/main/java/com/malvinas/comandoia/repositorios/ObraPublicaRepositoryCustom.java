package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.ObraPublica;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ObraPublicaRepositoryCustom {

    List<ObraPublica> buscarObrasConFiltros(
            LocalDateTime fechaInicioDesde,
            LocalDateTime fechaInicioHasta,
            LocalDateTime fechaEstimadaFinDesde,
            LocalDateTime fechaEstimadaFinHasta,
            LocalDateTime fechaRealFinDesde,
            LocalDateTime fechaRealFinHasta,
            String tipoObra,
            String estado,
            Double avanceFisicoMayor,
            Double avanceFisicoMenor,
            BigDecimal montoPresupuestadoMayor,
            BigDecimal montoPresupuestadoMenor,
            BigDecimal montoEjecutadoMayor,
            BigDecimal montoEjecutadoMenor,
            String localidad,
            String barrio
    );
}
