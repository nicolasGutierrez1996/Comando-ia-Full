package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.Usuario;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface UsuarioRepository extends CrudRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByNombreAndContrasena(String nombre, String contrasenia);
}
