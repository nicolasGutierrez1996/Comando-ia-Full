package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.TipoReclamo;
import com.malvinas.comandoia.servicios.TipoReclamoService;
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
@RequestMapping("/api/TipoReclamo")
@CrossOrigin(origins = "*")
public class TipoReclamoController {

    @Autowired
    private TipoReclamoService tipoReclamoService;

    @GetMapping
    public Iterable<TipoReclamo> listarTiposReclamo() {
        return tipoReclamoService.listarTipoReclamo();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<TipoReclamo> tipo = tipoReclamoService.obtenerTipoReclamoPorId(id);

        if (!tipo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El tipo de reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("tipoReclamo", tipo.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody TipoReclamo tipoReclamo, BindingResult result) {
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

        TipoReclamo nuevo = tipoReclamoService.guardarTipoReclamo(tipoReclamo);
        response.put("success", true);
        response.put("tipoReclamo", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @Valid @RequestBody TipoReclamo tipoReclamo, BindingResult result) {
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

        Optional<TipoReclamo> existente = tipoReclamoService.obtenerTipoReclamoPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El tipo de reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        tipoReclamo.setId(id);
        TipoReclamo actualizado = tipoReclamoService.guardarTipoReclamo(tipoReclamo);
        response.put("success", true);
        response.put("tipoReclamo", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<TipoReclamo> tipo = tipoReclamoService.obtenerTipoReclamoPorId(id);

        if (!tipo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. El tipo de reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        tipoReclamoService.eliminarTipoReclamo(id);
        response.put("success", true);
        response.put("mensaje", String.format("Tipo de reclamo con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }
}
