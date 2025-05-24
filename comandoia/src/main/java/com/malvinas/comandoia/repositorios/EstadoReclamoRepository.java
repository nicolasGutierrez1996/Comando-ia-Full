package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.EstadoObra;
import com.malvinas.comandoia.modelo.EstadoReclamo;
import org.springframework.data.repository.CrudRepository;

public interface EstadoReclamoRepository extends CrudRepository<EstadoReclamo, Integer> {

    boolean existsByDescripcionIgnoreCase(String descripcion);

    Iterable<EstadoReclamo> findByDescripcionContainingIgnoreCase(String descripcion);
}
