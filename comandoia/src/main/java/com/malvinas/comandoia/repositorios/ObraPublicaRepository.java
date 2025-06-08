package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.ObraPublica;
import com.malvinas.comandoia.modelo.Reclamo;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ObraPublicaRepository extends CrudRepository<ObraPublica, Integer>, ObraPublicaRepositoryCustom {

    boolean existsByNombreIgnoreCase(String nombre);

    Iterable<ObraPublica> findByNombreContainingIgnoreCase(String nombre);


    @Query("SELECT o.direccion.localidad, COUNT(o) FROM ObraPublica o where o.estado.descripcion='Planificada' GROUP BY o.direccion.localidad")
    List<Object[]> contarObrasPendientesPorLocalidad();

    List<ObraPublica> findByEstadoDescripcionContainingIgnoreCase(String descripcion);



}
