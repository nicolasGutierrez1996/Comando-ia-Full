package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.ObraPublica;
import com.malvinas.comandoia.servicios.ObraPublicaService;
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
@RequestMapping("/api/ObrasPublicas")
@CrossOrigin(origins = "*")
public class ObraPublicaController {

    @Autowired
    private ObraPublicaService obraPublicaService;

    @GetMapping
    public Iterable<ObraPublica> listarObrasPublicas() {
        return obraPublicaService.listarObrasPublicas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerObraPublicaPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<ObraPublica> obra = obraPublicaService.obtenerObraPublicaPorId(id);

        if (!obra.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("La obra pública con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("obraPublica", obra.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearObraPublica(@Valid @RequestBody ObraPublica obraPublica, BindingResult result) {
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

        ObraPublica nueva = obraPublicaService.guardarObraPublica(obraPublica);
        response.put("success", true);
        response.put("obraPublica", nueva);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarObraPublica(@PathVariable Integer id, @Valid @RequestBody ObraPublica obraPublica, BindingResult result) {
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

        Optional<ObraPublica> existente = obraPublicaService.obtenerObraPublicaPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("La obra pública con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        obraPublica.setId(id);
        ObraPublica actualizada = obraPublicaService.guardarObraPublica(obraPublica);
        response.put("success", true);
        response.put("obraPublica", actualizada);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarObraPublica(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        Optional<ObraPublica> obra = obraPublicaService.obtenerObraPublicaPorId(id);
        if (!obra.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. La obra pública con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        obraPublicaService.eliminarObraPublica(id);
        response.put("success", true);
        response.put("mensaje", String.format("Obra pública con ID %d eliminada correctamente", id));
        return ResponseEntity.ok(response);
    }
}
