package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.EstadoObra;
import com.malvinas.comandoia.modelo.EstadoReclamo;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface EstadoReclamoRepository extends CrudRepository<EstadoReclamo, Integer> {

    boolean existsByDescripcionIgnoreCase(String descripcion);

    Iterable<EstadoReclamo> findByDescripcionContainingIgnoreCase(String descripcion);

    @Query("SELECT DISTINCT  e.descripcion FROM EstadoReclamo e")
    List<String> obtenerDescripcionesEstados();
}
