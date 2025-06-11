package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.Usuario;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends CrudRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    Iterable<Usuario> findByNombreContainingIgnoreCase(String nombreParcial);

    @Query("SELECT u.token FROM Usuario u WHERE u.email = :email")
    Optional<String> findTokenByEmail(@Param("email") String email);

    @Query("SELECT u.rol.tipo FROM Usuario u WHERE u.nombre = :nombre")
    Optional<String> findTipoRolByNombre(@Param("nombre") String nombre);

}
