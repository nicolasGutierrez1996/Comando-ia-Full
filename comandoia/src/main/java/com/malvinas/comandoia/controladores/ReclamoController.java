package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.Reclamo;
import com.malvinas.comandoia.servicios.ReclamoService;
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
@RequestMapping("/api/Reclamos")
@CrossOrigin(origins = "*")
public class ReclamoController {

    @Autowired
    private ReclamoService reclamoService;

    @GetMapping
    public Iterable<Reclamo> listarReclamos() {
        return reclamoService.listarReclamos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerReclamoPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<Reclamo> reclamo = reclamoService.obtenerReclamoPorId(id);

        if (!reclamo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("reclamo", reclamo.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearReclamo(@Valid @RequestBody Reclamo reclamo, BindingResult result) {
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

        Reclamo nuevo = reclamoService.guardarReclamo(reclamo);
        response.put("success", true);
        response.put("reclamo", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarReclamo(@PathVariable Integer id, @Valid @RequestBody Reclamo reclamo, BindingResult result) {
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

        Optional<Reclamo> existente = reclamoService.obtenerReclamoPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        reclamo.setId(id);
        Reclamo actualizado = reclamoService.guardarReclamo(reclamo);
        response.put("success", true);
        response.put("reclamo", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReclamo(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        Optional<Reclamo> reclamo = reclamoService.obtenerReclamoPorId(id);
        if (!reclamo.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. El reclamo con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        reclamoService.eliminarReclamo(id);
        response.put("success", true);
        response.put("mensaje", String.format("Reclamo con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }
}
