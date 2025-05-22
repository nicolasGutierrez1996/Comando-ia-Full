package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.Usuario;
import com.malvinas.comandoia.repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;



    public Iterable<Usuario> listarUsuario() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    public Usuario guardarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Integer id) {
        usuarioRepository.deleteById(id);
    }

    public Optional<Usuario> buscarPorMail(String mail) {
        return usuarioRepository.findByEmail(mail);
    }

    public Optional<Usuario> buscarPorUserPass(String nombre,String contrasenia) {
        return usuarioRepository.findByNombreAndContrasena(nombre,contrasenia);
    }

    public Optional<String> obtenerTokenPorMail(String mail){
        return usuarioRepository.findTokenByEmail(mail);
    }

    public void actualizarPassword(String email, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setContrasena(nuevaPassword);
        usuarioRepository.save(usuario);
    }

    public Optional<String> obtenerRolPorNombre(String nombre){
        return usuarioRepository.findTipoRolByNombre(nombre);
    }

    public boolean existeNombre(String nombre){
        return usuarioRepository.existsByNombre(nombre);
    }


    public List<Usuario> buscarUsuariosPorNombre(String nombreParcial) {
        Iterable<Usuario> iterableUsuarios = usuarioRepository.findByNombreContainingIgnoreCase(nombreParcial);
        List<Usuario> listaUsuarios = new ArrayList<>();
        iterableUsuarios.forEach(listaUsuarios::add);
        return listaUsuarios;
    }
}

