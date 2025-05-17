package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.EstadoReclamo;
import com.malvinas.comandoia.servicios.EstadoReclamoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/EstadosReclamo")
@CrossOrigin(origins = "*")
public class EstadoReclamoController {

    @Autowired
    private EstadoReclamoService estadoReclamoService;

    @GetMapping
    public Iterable<EstadoReclamo> listarEstadosReclamo() {
        return estadoReclamoService.listarEstadoReclamo();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerEstadoReclamoPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<EstadoReclamo> estado = estadoReclamoService.obtenerEstadoReclamoPorId(id);

        if (!estado.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El estado de reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("estadoReclamo", estado.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearEstadoReclamo(@Valid @RequestBody EstadoReclamo estadoReclamo, BindingResult result) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errores = new HashMap<>();

        if (result.hasErrors()) {
            result.getFieldErrors().forEach(error ->
                    errores.put(error.getField(), error.getDefaultMessage())
            );
            response.put("success", false);
            response.put("errores", errores);
            return ResponseEntity.badRequest().body(response);
        }

        EstadoReclamo nuevo = estadoReclamoService.guardarEstadoReclamo(estadoReclamo);
        response.put("success", true);
        response.put("estadoReclamo", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEstadoReclamo(@PathVariable Integer id, @Valid @RequestBody EstadoReclamo estadoReclamo, BindingResult result) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errores = new HashMap<>();

        if (result.hasErrors()) {
            result.getFieldErrors().forEach(error ->
                    errores.put(error.getField(), error.getDefaultMessage())
            );
            response.put("success", false);
            response.put("errores", errores);
            return ResponseEntity.badRequest().body(response);
        }

        Optional<EstadoReclamo> existente = estadoReclamoService.obtenerEstadoReclamoPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El estado de reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        estadoReclamo.setId(id);
        EstadoReclamo actualizado = estadoReclamoService.guardarEstadoReclamo(estadoReclamo);
        response.put("success", true);
        response.put("estadoReclamo", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEstadoReclamo(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        Optional<EstadoReclamo> estado = estadoReclamoService.obtenerEstadoReclamoPorId(id);
        if (!estado.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. El estado de reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        estadoReclamoService.eliminarEstadoReclamo(id);
        response.put("success", true);
        response.put("mensaje", String.format("Estado de reclamo con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }
}
