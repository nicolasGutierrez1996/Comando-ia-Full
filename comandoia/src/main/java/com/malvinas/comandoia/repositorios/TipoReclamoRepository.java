package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.TipoObra;
import com.malvinas.comandoia.modelo.TipoReclamo;
import org.springframework.data.repository.CrudRepository;

public interface TipoReclamoRepository extends CrudRepository<TipoReclamo, Integer> {

    boolean existsByDescripcionIgnoreCase(String descripcion);
    Iterable<TipoReclamo> findByDescripcionContainingIgnoreCase(String descripcion);
}
