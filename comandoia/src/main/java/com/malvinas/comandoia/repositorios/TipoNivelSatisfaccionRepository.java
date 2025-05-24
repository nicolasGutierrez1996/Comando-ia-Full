package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.TipoNivelSatisfaccion;
import com.malvinas.comandoia.modelo.TipoReclamo;
import org.springframework.data.repository.CrudRepository;

public interface TipoNivelSatisfaccionRepository extends CrudRepository<TipoNivelSatisfaccion, Integer> {
    boolean existsByDescripcionIgnoreCase(String descripcion);
    Iterable<TipoNivelSatisfaccion> findByDescripcionContainingIgnoreCase(String descripcion);

}
