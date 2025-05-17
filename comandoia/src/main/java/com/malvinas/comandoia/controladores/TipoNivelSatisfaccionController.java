package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.TipoNivelSatisfaccion;
import com.malvinas.comandoia.servicios.TipoNivelSatisfaccionService;
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
@RequestMapping("/api/TipoNivelSatisfaccion")
@CrossOrigin(origins = "*")
public class TipoNivelSatisfaccionController {

    @Autowired
    private TipoNivelSatisfaccionService tipoNivelSatisfaccionService;

    @GetMapping
    public Iterable<TipoNivelSatisfaccion> listarTipoNivelSatisfaccion() {
        return tipoNivelSatisfaccionService.listarTipoNivelSatisfaccion();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<TipoNivelSatisfaccion> tipo = tipoNivelSatisfaccionService.obtenerTipoNivelSatisfaccionPorId(id);

        if (!tipo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El tipo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("tipoNivelSatisfaccion", tipo.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody TipoNivelSatisfaccion tipo, BindingResult result) {
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

        TipoNivelSatisfaccion nuevo = tipoNivelSatisfaccionService.guardarTipoNivelSatisfaccion(tipo);
        response.put("success", true);
        response.put("tipoNivelSatisfaccion", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @Valid @RequestBody TipoNivelSatisfaccion tipo, BindingResult result) {
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

        Optional<TipoNivelSatisfaccion> existente = tipoNivelSatisfaccionService.obtenerTipoNivelSatisfaccionPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El tipo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        tipo.setId(id);
        TipoNivelSatisfaccion actualizado = tipoNivelSatisfaccionService.guardarTipoNivelSatisfaccion(tipo);
        response.put("success", true);
        response.put("tipoNivelSatisfaccion", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<TipoNivelSatisfaccion> tipo = tipoNivelSatisfaccionService.obtenerTipoNivelSatisfaccionPorId(id);

        if (!tipo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. El tipo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        tipoNivelSatisfaccionService.eliminarTipoNivelSatisfaccion(id);
        response.put("success", true);
        response.put("mensaje", String.format("Tipo con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }
}
