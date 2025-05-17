package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.EstadoUsuario;
import com.malvinas.comandoia.repositorios.EstadoUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EstadoUsuarioService {

    @Autowired
    private EstadoUsuarioRepository estadoUsuarioRepository;

    public Iterable<EstadoUsuario> listarEstadoUsuario() {

        return estadoUsuarioRepository.findAll();
    }

    public Optional<EstadoUsuario> obtenerEstadoUsuarioPorId(Integer id) {

        return estadoUsuarioRepository.findById(id);
    }

    public EstadoUsuario guardarEstadoUsuario(EstadoUsuario estadoUsuario) {
        return estadoUsuarioRepository.save(estadoUsuario);
    }

    public void eliminarEstadoUsuario(Integer id) {

        estadoUsuarioRepository.deleteById(id);
    }
}
