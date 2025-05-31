package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.EstadoObra;
import com.malvinas.comandoia.modelo.EstadoReclamo;
import com.malvinas.comandoia.repositorios.EstadoReclamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EstadoReclamoService {


    @Autowired
    private EstadoReclamoRepository estadoReclamoRepository;

    public Iterable<EstadoReclamo> listarEstadoReclamo() {

        return estadoReclamoRepository.findAll();
    }

    public Optional<EstadoReclamo> obtenerEstadoReclamoPorId(Integer id) {

        return estadoReclamoRepository.findById(id);
    }

    public EstadoReclamo guardarEstadoReclamo(EstadoReclamo estadoReclamo) {
        return estadoReclamoRepository.save(estadoReclamo);
    }

    public void eliminarEstadoReclamo(Integer id) {

        estadoReclamoRepository.deleteById(id);
    }

    public boolean existeDescripcion(String descripcion){
        return estadoReclamoRepository.existsByDescripcionIgnoreCase(descripcion);
    }

    public List<EstadoReclamo> buscarEstadoReclamoPorDescripcion(String descripcion) {
        Iterable<EstadoReclamo> iterableEstadoReclamo = estadoReclamoRepository.findByDescripcionContainingIgnoreCase(descripcion);
        List<EstadoReclamo> listaEstadoReclamo = new ArrayList<>();
        iterableEstadoReclamo.forEach(listaEstadoReclamo::add);
        return listaEstadoReclamo;
    }

    public List<String> obtenerDescripcionesDeEstados() {
        return estadoReclamoRepository.obtenerDescripcionesEstados();
    }

}
