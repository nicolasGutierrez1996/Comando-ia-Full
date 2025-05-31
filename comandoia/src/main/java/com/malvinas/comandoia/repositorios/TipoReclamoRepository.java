package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.TipoObra;
import com.malvinas.comandoia.modelo.TipoReclamo;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TipoReclamoRepository extends CrudRepository<TipoReclamo, Integer> {

    boolean existsByDescripcionIgnoreCase(String descripcion);
    Iterable<TipoReclamo> findByDescripcionContainingIgnoreCase(String descripcion);

    @Query("SELECT DISTINCT  t.descripcion FROM TipoReclamo t")
    List<String> obtenerDescripcionesTipos();
}
