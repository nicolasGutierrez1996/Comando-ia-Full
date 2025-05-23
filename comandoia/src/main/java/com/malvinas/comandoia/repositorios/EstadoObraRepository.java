package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.EstadoObra;
import com.malvinas.comandoia.modelo.TipoObra;
import org.springframework.data.repository.CrudRepository;

public interface EstadoObraRepository extends CrudRepository<EstadoObra, Integer> {

    boolean existsByDescripcionIgnoreCase(String descripcion);

    Iterable<EstadoObra> findByDescripcionContainingIgnoreCase(String descripcion);
}
