package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.Rol;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolRepository extends CrudRepository<Rol,Integer> {

}
