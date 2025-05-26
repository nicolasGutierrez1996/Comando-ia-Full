package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.EstadoObra;
import com.malvinas.comandoia.modelo.Reclamo;
import org.springframework.data.repository.CrudRepository;

public interface ReclamoRepository  extends CrudRepository<Reclamo, Integer> {

    boolean existsByNombreIgnoreCase(String nombre);

    Iterable<Reclamo> findByNombreContainingIgnoreCase(String nombre);

}
