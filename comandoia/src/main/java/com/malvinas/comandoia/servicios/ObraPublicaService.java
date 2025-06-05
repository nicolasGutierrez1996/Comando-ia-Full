package com.malvinas.comandoia.servicios;
import com.malvinas.comandoia.modelo.ObraPublica;
import com.malvinas.comandoia.modelo.Reclamo;
import com.malvinas.comandoia.repositorios.ObraPublicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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

    public boolean existeNombre(String nombre){
        return obraPublicaRepository.existsByNombreIgnoreCase(nombre);
    }

    public List<ObraPublica> buscarObraPorNombre(String nombre) {
        Iterable<ObraPublica> iterableObra = obraPublicaRepository.findByNombreContainingIgnoreCase(nombre);
        List<ObraPublica> listaObra = new ArrayList<>();
        iterableObra.forEach(listaObra::add);
        return listaObra;
    }


    public List<ObraPublica> buscarConFiltros(
            LocalDateTime fechaInicioDesde,
            LocalDateTime fechaInicioHasta,
            LocalDateTime fechaEstimadaFinDesde,
            LocalDateTime fechaEstimadaFinHasta,
            LocalDateTime fechaRealFinDesde,
            LocalDateTime fechaRealFinHasta,
            String tipoObra,
            String estado,
            Double avanceFisicoMayor,
            Double avanceFisicoMenor,
            BigDecimal montoPresupuestadoMayor,
            BigDecimal montoPresupuestadoMenor,
            BigDecimal montoEjecutadoMayor,
            BigDecimal montoEjecutadoMenor,
            String localidad,
            String barrio
    ) {
        Iterable<ObraPublica> iterable = obraPublicaRepository.buscarObrasConFiltros(
                fechaInicioDesde,
                fechaInicioHasta,
                fechaEstimadaFinDesde,
                fechaEstimadaFinHasta,
                fechaRealFinDesde,
                fechaRealFinHasta,
                tipoObra,
                estado,
                avanceFisicoMayor,
                avanceFisicoMenor,
                montoPresupuestadoMayor,
                montoPresupuestadoMenor,
                montoEjecutadoMayor,
                montoEjecutadoMenor,
                localidad,
                barrio
        );

        return StreamSupport.stream(iterable.spliterator(), false)
                .collect(Collectors.toList());
    }

}
