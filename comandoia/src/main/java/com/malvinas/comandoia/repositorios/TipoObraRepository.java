package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.TipoObra;
import com.malvinas.comandoia.modelo.Usuario;
import org.springframework.data.repository.CrudRepository;

public interface TipoObraRepository extends CrudRepository<TipoObra,Integer> {

    boolean existsByDescripcionIgnoreCase(String descripcion);
    Iterable<TipoObra> findByDescripcionContainingIgnoreCase(String descripcion);

}
