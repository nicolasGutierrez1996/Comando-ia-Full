package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.EstadoReclamo;
import com.malvinas.comandoia.modelo.Reclamo;
import com.malvinas.comandoia.repositorios.ReclamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReclamoService {

    @Autowired
    private ReclamoRepository reclamoRepository;

    public Iterable<Reclamo> listarReclamos() {
        return reclamoRepository.findAll();
    }

    public Optional<Reclamo> obtenerReclamoPorId(Integer id) {
        return reclamoRepository.findById(id);
    }

    public Reclamo guardarReclamo(Reclamo reclamo) {
        return reclamoRepository.save(reclamo);
    }

    public void eliminarReclamo(Integer id) {
        reclamoRepository.deleteById(id);
    }

    public boolean existeNombre(String nombre){
        return reclamoRepository.existsByNombreIgnoreCase(nombre);
    }

    public List<Reclamo> buscarReclamoPorNombre(String nombre) {
        Iterable<Reclamo> iterableReclamo = reclamoRepository.findByNombreContainingIgnoreCase(nombre);
        List<Reclamo> listaReclamo = new ArrayList<>();
        iterableReclamo.forEach(listaReclamo::add);
        return listaReclamo;
    }

}

