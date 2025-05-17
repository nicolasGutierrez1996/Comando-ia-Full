package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.Rol;
import com.malvinas.comandoia.repositorios.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RolService {

    @Autowired
    private RolRepository rolRepository;

    public Iterable<Rol> listarRoles() {

        return rolRepository.findAll();
    }

    public Optional<Rol> obtenerRolPorId(Integer id) {

        return rolRepository.findById(id);
    }

    public Rol guardarRol(Rol rol) {

        return rolRepository.save(rol);
    }

    public void eliminarRol(Integer id) {

        rolRepository.deleteById(id);
    }
}
