package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReclamoRepository  extends CrudRepository<Reclamo, Integer> {

    boolean existsByNombreIgnoreCase(String nombre);

    Iterable<Reclamo> findByNombreContainingIgnoreCase(String nombre);

    @Query("SELECT r FROM Reclamo r WHERE " +
            "r.fecha_reclamo >= :fechaDesde AND " +
            "r.fecha_reclamo <= :fechaHasta AND " +
            "(:estado IS NULL OR :estado = '' OR r.estado.descripcion = :estado) AND " +
            "(:localidad IS NULL OR :localidad = '' OR r.direccion.localidad = :localidad) AND " +
            "(:barrio IS NULL OR :barrio = '' OR r.direccion.barrio = :barrio) AND " +
            "(:tipoReclamo IS NULL OR :tipoReclamo = '' OR r.tipo_reclamo.descripcion = :tipoReclamo) AND " +
            "(:nivelSatisfaccion IS NULL OR :nivelSatisfaccion = '' OR r.nivel_satisfaccion.descripcion = :nivelSatisfaccion) AND " +
            "(:tiempoResolucionMayor IS NULL OR r.tiempo_resolucion >= :tiempoResolucionMayor) AND " +
            "(:tiempoResolucionMenor IS NULL OR r.tiempo_resolucion <= :tiempoResolucionMenor)"
    )
    Iterable<Reclamo> buscarConFiltros(
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta,
            @Param("estado") String estado,
            @Param("localidad") String localidad,
            @Param("barrio") String barrio,
            @Param("tipoReclamo") String tipoReclamo,
            @Param("nivelSatisfaccion") String nivelSatisfaccion,
            @Param("tiempoResolucionMayor") Integer tiempoResolucionMayor,
            @Param("tiempoResolucionMenor") Integer tiempoResolucionMenor
    );

}
