package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.EstadoUsuario;
import com.malvinas.comandoia.servicios.EstadoUsuarioService;
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
@RequestMapping("/api/EstadosUsuario")
@CrossOrigin(origins = "*")
public class EstadoUsuarioController {

    @Autowired
    private EstadoUsuarioService estadoUsuarioService;

    @GetMapping
    public Iterable<EstadoUsuario> listarEstadosUsuario() {
        return estadoUsuarioService.listarEstadoUsuario();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerEstadoUsuarioPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<EstadoUsuario> estado = estadoUsuarioService.obtenerEstadoUsuarioPorId(id);

        if (!estado.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El estado de usuario con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("estadoUsuario", estado.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearEstadoUsuario(@Valid @RequestBody EstadoUsuario estadoUsuario, BindingResult result) {
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

        EstadoUsuario nuevo = estadoUsuarioService.guardarEstadoUsuario(estadoUsuario);
        response.put("success", true);
        response.put("estadoUsuario", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEstadoUsuario(@PathVariable Integer id, @Valid @RequestBody EstadoUsuario estadoUsuario, BindingResult result) {
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

        Optional<EstadoUsuario> existente = estadoUsuarioService.obtenerEstadoUsuarioPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El estado de usuario con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        estadoUsuario.setId(id);
        EstadoUsuario actualizado = estadoUsuarioService.guardarEstadoUsuario(estadoUsuario);
        response.put("success", true);
        response.put("estadoUsuario", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEstadoUsuario(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        Optional<EstadoUsuario> estado = estadoUsuarioService.obtenerEstadoUsuarioPorId(id);
        if (!estado.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. El estado de usuario con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        estadoUsuarioService.eliminarEstadoUsuario(id);
        response.put("success", true);
        response.put("mensaje", String.format("Estado de usuario con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }
}
