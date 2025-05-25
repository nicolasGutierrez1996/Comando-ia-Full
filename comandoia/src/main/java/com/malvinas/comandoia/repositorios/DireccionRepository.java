package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.Direccion;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface DireccionRepository extends CrudRepository<Direccion, Integer> {
    Optional<Direccion> findByCalleIgnoreCaseAndNumeroCalle(String calle, Integer numeroCalle);
}
