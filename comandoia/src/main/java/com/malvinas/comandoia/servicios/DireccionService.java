package com.malvinas.comandoia.servicios;


import com.malvinas.comandoia.modelo.Direccion;
import com.malvinas.comandoia.repositorios.DireccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DireccionService {
    @Autowired
    private DireccionRepository direccionRepository;

    public Iterable<Direccion> listarDirecciones() {

        return direccionRepository.findAll();
    }

    public Optional<Direccion> obtenerDireccionPorId(Integer id) {

        return direccionRepository.findById(id);
    }

    public Direccion guardarDireccion(Direccion direccion) {

        return direccionRepository.save(direccion);
    }

    public void eliminarDireccion(Integer id) {

        direccionRepository.deleteById(id);
    }
}
