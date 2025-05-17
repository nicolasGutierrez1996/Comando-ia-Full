package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.Reclamo;
import com.malvinas.comandoia.repositorios.ReclamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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
}

