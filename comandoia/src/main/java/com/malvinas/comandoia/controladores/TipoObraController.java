package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.TipoObra;
import com.malvinas.comandoia.servicios.TipoObraService;
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
@RequestMapping("/api/TipoObra")
@CrossOrigin(origins = "*")
public class TipoObraController {

    @Autowired
    private TipoObraService tipoObraService;

    @GetMapping
    public Iterable<TipoObra> listarTiposObra() {
        return tipoObraService.listarTipoObra();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<TipoObra> tipo = tipoObraService.obtenerTipoObraPorId(id);

        if (!tipo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El tipo de obra con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("tipoObra", tipo.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody TipoObra tipoObra, BindingResult result) {
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

        TipoObra nuevo = tipoObraService.guardarTipoObra(tipoObra);
        response.put("success", true);
        response.put("tipoObra", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @Valid @RequestBody TipoObra tipoObra, BindingResult result) {
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

        Optional<TipoObra> existente = tipoObraService.obtenerTipoObraPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El tipo de obra con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        tipoObra.setId(id);
        TipoObra actualizado = tipoObraService.guardarTipoObra(tipoObra);
        response.put("success", true);
        response.put("tipoObra", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<TipoObra> tipo = tipoObraService.obtenerTipoObraPorId(id);

        if (!tipo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. El tipo de obra con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        tipoObraService.eliminarTipoObra(id);
        response.put("success", true);
        response.put("mensaje", String.format("Tipo de obra con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }
}
