package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.EstadoObra;
import com.malvinas.comandoia.servicios.EstadoObraService;
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
@RequestMapping("/api/EstadosObra")
@CrossOrigin(origins = "*")
public class EstadoObraController {

    @Autowired
    private EstadoObraService estadoObraService;

    @GetMapping
    public Iterable<EstadoObra> listarEstadosObra() {
        return estadoObraService.listarEstadoObra();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerEstadoObraPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<EstadoObra> estado = estadoObraService.obtenerEstadoObraPorId(id);

        if (!estado.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El estado de obra con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("estadoObra", estado.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearEstadoObra(@Valid @RequestBody EstadoObra estadoObra, BindingResult result) {
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

        EstadoObra nuevo = estadoObraService.guardarEstadoObra(estadoObra);
        response.put("success", true);
        response.put("estadoObra", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEstadoObra(@PathVariable Integer id, @Valid @RequestBody EstadoObra estadoObra, BindingResult result) {
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

        Optional<EstadoObra> existente = estadoObraService.obtenerEstadoObraPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El estado de obra con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        estadoObra.setId(id);
        EstadoObra actualizado = estadoObraService.guardarEstadoObra(estadoObra);
        response.put("success", true);
        response.put("estadoObra", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEstadoObra(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        Optional<EstadoObra> estado = estadoObraService.obtenerEstadoObraPorId(id);
        if (!estado.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. El estado de obra con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        estadoObraService.eliminarEstadoObra(id);
        response.put("success", true);
        response.put("mensaje", String.format("Estado de obra con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }
}
