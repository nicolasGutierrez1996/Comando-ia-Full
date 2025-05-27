package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.ObraPublica;
import com.malvinas.comandoia.modelo.Reclamo;
import org.springframework.data.repository.CrudRepository;

public interface ObraPublicaRepository extends CrudRepository<ObraPublica, Integer> {

    boolean existsByNombreIgnoreCase(String nombre);

    Iterable<ObraPublica> findByNombreContainingIgnoreCase(String nombre);

}
