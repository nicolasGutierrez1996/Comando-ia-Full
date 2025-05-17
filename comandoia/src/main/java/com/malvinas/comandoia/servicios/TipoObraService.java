package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.TipoObra;
import com.malvinas.comandoia.repositorios.TipoObraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TipoObraService {

    @Autowired
    private TipoObraRepository tipoObraRepository;

    public Iterable<TipoObra> listarTipoObra() {
        return tipoObraRepository.findAll();
    }


    public Optional<TipoObra> obtenerTipoObraPorId(Integer id) {

        SimpleJpaRepository<TipoObra, Integer> tipoobraRepository;
        return tipoObraRepository.findById(id);
    }

    public TipoObra guardarTipoObra(TipoObra tipoObra) {

        return tipoObraRepository.save(tipoObra);
    }

    public void eliminarTipoObra(Integer id) {

        tipoObraRepository.deleteById(id);
    }
}
