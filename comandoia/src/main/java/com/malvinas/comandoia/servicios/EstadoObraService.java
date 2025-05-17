package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.EstadoObra;
import com.malvinas.comandoia.repositorios.EstadoObraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EstadoObraService {

    @Autowired
    private EstadoObraRepository estadoObraRepository;

    public Iterable<EstadoObra> listarEstadoObra() {

        return estadoObraRepository.findAll();
    }

    public Optional<EstadoObra> obtenerEstadoObraPorId(Integer id) {

        return estadoObraRepository.findById(id);
    }

    public EstadoObra guardarEstadoObra(EstadoObra estadoObra) {
        return estadoObraRepository.save(estadoObra);
    }

    public void eliminarEstadoObra(Integer id) {

        estadoObraRepository.deleteById(id);
    }
}

