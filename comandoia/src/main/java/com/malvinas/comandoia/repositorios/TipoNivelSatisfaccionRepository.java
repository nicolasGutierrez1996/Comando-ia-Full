package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.TipoNivelSatisfaccion;
import com.malvinas.comandoia.modelo.TipoReclamo;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TipoNivelSatisfaccionRepository extends CrudRepository<TipoNivelSatisfaccion, Integer> {
    boolean existsByDescripcionIgnoreCase(String descripcion);
    Iterable<TipoNivelSatisfaccion> findByDescripcionContainingIgnoreCase(String descripcion);

    @Query("SELECT DISTINCT  n.descripcion FROM TipoNivelSatisfaccion n")
    List<String> obtenerDescripcionesNiveles();

}
