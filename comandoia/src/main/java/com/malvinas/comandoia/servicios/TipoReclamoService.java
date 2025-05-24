package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.TipoObra;
import com.malvinas.comandoia.modelo.TipoReclamo;
import com.malvinas.comandoia.repositorios.TipoReclamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
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

    public boolean existeDescripcion(String descripcion){
        return tipoReclamoRepository.existsByDescripcionIgnoreCase(descripcion);
    }

    public List<TipoReclamo> buscarTipoReclamoPorDescripcion(String descripcion) {
        Iterable<TipoReclamo> iterableTipoReclamo = tipoReclamoRepository.findByDescripcionContainingIgnoreCase(descripcion);
        List<TipoReclamo> listaTipoReclamo = new ArrayList<>();
        iterableTipoReclamo.forEach(listaTipoReclamo::add);
        return listaTipoReclamo;
    }

}

