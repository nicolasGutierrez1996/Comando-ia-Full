package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.EstadoObra;
import com.malvinas.comandoia.modelo.TipoObra;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface EstadoObraRepository extends CrudRepository<EstadoObra, Integer> {

    boolean existsByDescripcionIgnoreCase(String descripcion);

    Iterable<EstadoObra> findByDescripcionContainingIgnoreCase(String descripcion);

    @Query("SELECT DISTINCT  e.descripcion FROM EstadoObra e")
    List<String> obtenerDescripcionesEstados();
}
