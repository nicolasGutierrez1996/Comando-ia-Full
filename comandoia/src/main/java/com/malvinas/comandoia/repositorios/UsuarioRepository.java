package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.Usuario;
import org.springframework.data.repository.CrudRepository;

public interface UsuarioRepository extends CrudRepository<Usuario, Integer> {
}
