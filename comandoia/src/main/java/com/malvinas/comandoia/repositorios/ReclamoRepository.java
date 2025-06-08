package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReclamoRepository  extends CrudRepository<Reclamo, Integer>,ReclamoRepositoryCustom {

    boolean existsByNombreIgnoreCase(String nombre);

    Iterable<Reclamo> findByNombreContainingIgnoreCase(String nombre);

    @Query("SELECT r.direccion.localidad, COUNT(r) FROM Reclamo r GROUP BY r.direccion.localidad")
    List<Object[]> contarReclamosPorLocalidad();


}
