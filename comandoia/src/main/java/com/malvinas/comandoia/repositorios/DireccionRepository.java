package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.Direccion;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DireccionRepository extends CrudRepository<Direccion, Integer> {
    Optional<Direccion> findByCalleIgnoreCaseAndNumeroCalle(String calle, Integer numeroCalle);

    @Query("SELECT d FROM Direccion d " +
            "WHERE (:localidad IS NULL OR d.localidad = :localidad) " +
            "AND (:barrio IS NULL OR d.barrio = :barrio) " +
            "AND (:calle IS NULL OR d.calle = :calle) " +
            "AND (:numeroCalle IS NULL OR d.numeroCalle = :numeroCalle)")
    List<Direccion> buscarDireccionFlexible(@Param("localidad") String localidad,
                                            @Param("barrio") String barrio,
                                            @Param("calle") String calle,
                                            @Param("numeroCalle") Integer numeroCalle);

}
