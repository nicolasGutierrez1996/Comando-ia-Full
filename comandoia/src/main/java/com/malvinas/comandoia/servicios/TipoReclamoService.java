package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.TipoReclamo;
import com.malvinas.comandoia.repositorios.TipoReclamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TipoReclamoService {

    @Autowired
    private TipoReclamoRepository tipoReclamoRepository;



    public Iterable<TipoReclamo> listarTipoReclamo() {
        return tipoReclamoRepository.findAll();
    }

    public Optional<TipoReclamo> obtenerTipoReclamoPorId(Integer id) {
        return tipoReclamoRepository.findById(id);
    }

    public TipoReclamo guardarTipoReclamo(TipoReclamo tipoReclamo) {
        return tipoReclamoRepository.save(tipoReclamo);
    }

    public void eliminarTipoReclamo(Integer id) {
        tipoReclamoRepository.deleteById(id);
    }
}

