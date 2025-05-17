package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.Direccion;
import com.malvinas.comandoia.servicios.DireccionService;
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
@RequestMapping("/api/direcciones")
@CrossOrigin(origins = "*")
public class DireccionController {

    @Autowired
    private DireccionService direccionService;

    @GetMapping
    public Iterable<Direccion> listarDirecciones() {

        return direccionService.listarDirecciones();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerDireccionPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        Optional<Direccion> direccion = direccionService.obtenerDireccionPorId(id);

        if (!direccion.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("La direccion con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("direccion", direccion.get());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearDireccion(@Valid @RequestBody Direccion direccion, BindingResult result) {
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

        Direccion nuevo = direccionService.guardarDireccion(direccion);
        response.put("success", true);
        response.put("direccion", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarDireccion(@PathVariable Integer id, @Valid @RequestBody Direccion direccion, BindingResult result) {
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

        Optional<Direccion> existente = direccionService.obtenerDireccionPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("La direccion con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        direccion.setId(id);
        Direccion actualizado = direccionService.guardarDireccion(direccion);
        response.put("success", true);
        response.put("direccion", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarDireccion(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        Optional<Direccion> direccion = direccionService.obtenerDireccionPorId(id);

        if (!direccion.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. la direccion con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        direccionService.eliminarDireccion(id);
        response.put("success", true);
        response.put("mensaje", String.format("Direccion con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }


}
