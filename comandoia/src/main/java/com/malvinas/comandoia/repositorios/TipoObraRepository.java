package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.TipoObra;
import com.malvinas.comandoia.modelo.Usuario;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TipoObraRepository extends CrudRepository<TipoObra,Integer> {

    boolean existsByDescripcionIgnoreCase(String descripcion);
    Iterable<TipoObra> findByDescripcionContainingIgnoreCase(String descripcion);

    @Query("SELECT DISTINCT  e.descripcion FROM TipoObra e")
    List<String> obtenerDescripcionesTipos();

}
