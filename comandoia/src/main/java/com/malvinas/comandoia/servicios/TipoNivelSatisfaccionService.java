package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.TipoNivelSatisfaccion;
import com.malvinas.comandoia.modelo.TipoReclamo;
import com.malvinas.comandoia.repositorios.TipoNivelSatisfaccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TipoNivelSatisfaccionService {

    @Autowired
    private TipoNivelSatisfaccionRepository tipoNivelSatisfaccionRepository;



    public Iterable<TipoNivelSatisfaccion> listarTipoNivelSatisfaccion() {
        return tipoNivelSatisfaccionRepository.findAll();
    }

    public Optional<TipoNivelSatisfaccion> obtenerTipoNivelSatisfaccionPorId(Integer id) {
        return tipoNivelSatisfaccionRepository.findById(id);
    }

    public TipoNivelSatisfaccion guardarTipoNivelSatisfaccion(TipoNivelSatisfaccion tipoNivelSatisfaccion) {
        return tipoNivelSatisfaccionRepository.save(tipoNivelSatisfaccion);
    }

    public void eliminarTipoNivelSatisfaccion(Integer id) {
        tipoNivelSatisfaccionRepository.deleteById(id);
    }

    public boolean existeDescripcion(String descripcion){
        return tipoNivelSatisfaccionRepository.existsByDescripcionIgnoreCase(descripcion);
    }

    public List<TipoNivelSatisfaccion> buscarTipoNivelPorDescripcion(String descripcion) {
        Iterable<TipoNivelSatisfaccion> iterableNivelReclamo = tipoNivelSatisfaccionRepository.findByDescripcionContainingIgnoreCase(descripcion);
        List<TipoNivelSatisfaccion> listaNivelReclamo = new ArrayList<>();
        iterableNivelReclamo.forEach(listaNivelReclamo::add);
        return listaNivelReclamo;
    }

}
