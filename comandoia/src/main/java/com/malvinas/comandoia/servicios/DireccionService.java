package com.malvinas.comandoia.servicios;


import com.malvinas.comandoia.modelo.Direccion;
import com.malvinas.comandoia.repositorios.DireccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

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
    public Optional<Direccion> buscarDireccionPorCalleNumero(String calle, Integer numero_calle){
        return direccionRepository.findByCalleIgnoreCaseAndNumeroCalle(calle,numero_calle);

    }

    public Optional<Direccion> buscarDireccionFlexible(String localidad, String barrio, String calle, Integer numeroCalle) {
        List<Direccion> coincidencias = direccionRepository
                .buscarDireccionFlexible(localidad, barrio, calle, numeroCalle);

        // Si hay al menos una coincidencia, devolver la primera
        return coincidencias.isEmpty() ? Optional.empty() : Optional.of(coincidencias.get(0));
    }

    public List<String> obtenerLocalidades() {

        return direccionRepository.obtenerLocalidades().stream()
                .filter(Objects::nonNull)
                .map(s -> Arrays.stream(s.split(" "))
                        .map(w -> w.isBlank() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase())
                        .collect(Collectors.joining(" ")))
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> obtenerBarrios() {


        return direccionRepository.obtenerBarrios().stream()
                .filter(Objects::nonNull)
                .map(s -> Arrays.stream(s.split(" "))
                        .map(w -> w.isBlank() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase())
                        .collect(Collectors.joining(" ")))
                .distinct()
                .sorted()
                .collect(Collectors.toList());    }

    public List<Direccion> obtenerDireccionesSinCoordenadas(){
        return direccionRepository.findDireccionesSinCoordenadas();
    }
}
