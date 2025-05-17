package com.malvinas.comandoia.servicios;
import com.malvinas.comandoia.modelo.ObraPublica;
import com.malvinas.comandoia.repositorios.ObraPublicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class ObraPublicaService {

    @Autowired
    private ObraPublicaRepository obraPublicaRepository;

    public Iterable<ObraPublica> listarObrasPublicas() {
        return obraPublicaRepository.findAll();
    }

    public Optional<ObraPublica> obtenerObraPublicaPorId(Integer id) {
        return obraPublicaRepository.findById(id);
    }

    public ObraPublica guardarObraPublica(ObraPublica obraPublica) {
        return obraPublicaRepository.save(obraPublica);
    }

    public void eliminarObraPublica(Integer id) {
        obraPublicaRepository.deleteById(id);
    }
}
