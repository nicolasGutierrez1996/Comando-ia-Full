package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.Usuario;
import com.malvinas.comandoia.servicios.UsuarioService;
import com.malvinas.comandoia.utils.EmailService;
import com.malvinas.comandoia.utils.FuncionesVarias;
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
@RequestMapping("/api/Usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public Iterable<Usuario> listarUsuarios() {
        return usuarioService.listarUsuario();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorId(id);

        if (!usuario.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El usuario con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("usuario", usuario.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Usuario usuario, BindingResult result) {
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

        usuario.setContrasena(FuncionesVarias.generarContrasenaAleatoria());

        Usuario nuevo = usuarioService.guardarUsuario(usuario);


        emailService.enviarCredenciales(nuevo.getEmail(),nuevo.getContrasena(),nuevo.getNombre());


        response.put("success", true);
        response.put("usuario", nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @Valid @RequestBody Usuario usuario, BindingResult result) {
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

        Optional<Usuario> existente = usuarioService.obtenerUsuarioPorId(id);
        if (!existente.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("El usuario con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        usuario.setId(id);
        Usuario actualizado = usuarioService.guardarUsuario(usuario);
        response.put("success", true);
        response.put("usuario", actualizado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorId(id);

        if (!usuario.isPresent()) {
            response.put("success", false);
            response.put("mensaje", String.format("No se puede eliminar. El usuario con ID %d no existe", id));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        usuarioService.eliminarUsuario(id);
        response.put("success", true);
        response.put("mensaje", String.format("Usuario con ID %d eliminado correctamente", id));
        return ResponseEntity.ok(response);
    }


    @PutMapping("/recuperar/{email}")
    public ResponseEntity<?> recuperarClave(@PathVariable String email) {
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorMail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No existe un usuario con ese email");
        }

        Usuario usuario = usuarioOpt.get();
        String token = FuncionesVarias.generarTokenDeClave();
        usuario.setToken(token);
        usuarioService.guardarUsuario(usuario);

        emailService.enviarTokenDeRecuperacion(usuario.getEmail(), token);

        return ResponseEntity.ok("Se envió un token de recuperación al correo registrado.");
    }

    @PutMapping("/actualizar-clave/{email}/{token}/{nuevaClave}")
    public ResponseEntity<?> actualizarClave(
            @PathVariable String email,
            @PathVariable String token,
            @PathVariable String nuevaClave) {

        Optional<Usuario> usuarioOpt = usuarioService.buscarPorMail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();
        if (!token.equals(usuario.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido");
        }

        usuario.setContrasena(nuevaClave);
        usuario.setToken(null);
        usuarioService.guardarUsuario(usuario);

        return ResponseEntity.ok("Contraseña actualizada exitosamente.");
    }
}
