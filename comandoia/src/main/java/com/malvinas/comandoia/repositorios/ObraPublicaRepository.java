package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.ObraPublica;
import com.malvinas.comandoia.modelo.Reclamo;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ObraPublicaRepository extends CrudRepository<ObraPublica, Integer> {

    boolean existsByNombreIgnoreCase(String nombre);

    Iterable<ObraPublica> findByNombreContainingIgnoreCase(String nombre);



    @Query("SELECT o FROM ObraPublica o WHERE " +
            "o.fecha_inicio >= :fechaInicioDesde AND " +
            "o.fecha_inicio <= :fechaInicioHasta AND " +
            "o.fecha_estimada_finalizacion >= :fechaEstimadaFinDesde AND " +
            "o.fecha_estimada_finalizacion <= :fechaEstimadaFinHasta AND " +
            "o.fecha_real_finalizacion >= :fechaRealFinDesde AND " +
            "o.fecha_real_finalizacion <= :fechaRealFinHasta AND " +
            "(:tipoObra IS NULL OR :tipoObra = '' OR o.tipo_obra.descripcion = :tipoObra) AND " +
            "(:estado IS NULL OR :estado = '' OR o.estado.descripcion = :estado) AND " +
            "(:avanceFisicoMayor IS NULL OR o.avance_fisico >= :avanceFisicoMayor) AND " +
            "(:avanceFisicoMenor IS NULL OR o.avance_fisico <= :avanceFisicoMenor) AND " +
            "(:montoPresupuestadoMayor IS NULL OR o.monto_presupuestado >= :montoPresupuestadoMayor) AND " +
            "(:montoPresupuestadoMenor IS NULL OR o.monto_presupuestado <= :montoPresupuestadoMenor) AND " +
            "(:montoEjecutadoMayor IS NULL OR o.monto_ejecutado >= :montoEjecutadoMayor) AND " +
            "(:montoEjecutadoMenor IS NULL OR o.monto_ejecutado <= :montoEjecutadoMenor) AND " +
            "(:localidad IS NULL OR :localidad = '' OR o.direccion.localidad = :localidad) AND " +
            "(:barrio IS NULL OR :barrio = '' OR o.direccion.barrio = :barrio)"
    )
    Iterable<ObraPublica> buscarObrasConFiltros(
            @Param("fechaInicioDesde") LocalDateTime fechaInicioDesde,
            @Param("fechaInicioHasta") LocalDateTime fechaInicioHasta,
            @Param("fechaEstimadaFinDesde") LocalDateTime fechaEstimadaFinDesde,
            @Param("fechaEstimadaFinHasta") LocalDateTime fechaEstimadaFinHasta,
            @Param("fechaRealFinDesde") LocalDateTime fechaRealFinDesde,
            @Param("fechaRealFinHasta") LocalDateTime fechaRealFinHasta,
            @Param("tipoObra") String tipoObra,
            @Param("estado") String estado,
            @Param("avanceFisicoMayor") Double avanceFisicoMayor,
            @Param("avanceFisicoMenor") Double avanceFisicoMenor,
            @Param("montoPresupuestadoMayor") BigDecimal montoPresupuestadoMayor,
            @Param("montoPresupuestadoMenor") BigDecimal montoPresupuestadoMenor,
            @Param("montoEjecutadoMayor") BigDecimal montoEjecutadoMayor,
            @Param("montoEjecutadoMenor") BigDecimal montoEjecutadoMenor,
            @Param("localidad") String localidad,
            @Param("barrio") String barrio
    );

}
