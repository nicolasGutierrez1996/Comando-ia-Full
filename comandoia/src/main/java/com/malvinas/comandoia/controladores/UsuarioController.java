package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.Usuario;
import com.malvinas.comandoia.requests.LoginRequest;
import com.malvinas.comandoia.servicios.UsuarioService;
import com.malvinas.comandoia.utils.EmailService;
import com.malvinas.comandoia.utils.FuncionesVarias;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public Iterable<Usuario> listarUsuarios() {
        return usuarioService.listarUsuario();
    }

    @GetMapping("/id/{id}")
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

        String claveAutogenerada=FuncionesVarias.generarContrasenaAleatoria();

        emailService.enviarCredenciales(usuario.getEmail(),claveAutogenerada,usuario.getNombre());


        String claveEncriptada = passwordEncoder.encode(claveAutogenerada);

        usuario.setContrasena(claveEncriptada);

        Usuario nuevo = usuarioService.guardarUsuario(usuario);




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
        Map<String, Object> response = new HashMap<>();
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorMail(email);
        if (usuarioOpt.isEmpty()) {
            response.put("success",false);
            response.put("mensaje","No existe un usuario con ese email");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Usuario usuario = usuarioOpt.get();
        String token = FuncionesVarias.generarTokenDeClave();
        emailService.enviarTokenDeRecuperacion(usuario.getEmail(), token);
        String hashedToken = passwordEncoder.encode(token);
        usuario.setToken(hashedToken);


        usuarioService.guardarUsuario(usuario);


        response.put("success",true);
        response.put("mensaje","Se envió un token de recuperación al correo registrado.");
        return ResponseEntity.ok(response);
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
        System.out.println("TOKEN PLANO: " + token);
        System.out.println("TOKEN HASH EN BD: " + usuario.getToken());
        System.out.println("¿MATCH? " + passwordEncoder.matches(token, usuario.getToken()));
        if (!passwordEncoder.matches(token, usuario.getToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token inválido");
        }

        String claveEncriptada = passwordEncoder.encode(nuevaClave);

        usuario.setContrasena(claveEncriptada);
        usuario.setToken(null);
        usuarioService.guardarUsuario(usuario);

        return ResponseEntity.ok("Contraseña actualizada exitosamente.");
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = new HashMap<>();
        Optional<Usuario> usuarioOpt =  usuarioService.buscarPorUser(
                loginRequest.getUsuario());


        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (passwordEncoder.matches(loginRequest.getContrasena(), usuario.getContrasena())) {
                response.put("success", true);
                response.put("usuario", usuario);
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrectos");

    }

    @PostMapping("/validarToken/{mail}/{tokenIngresado}")
    public ResponseEntity<?> validarToken(@PathVariable String mail,@PathVariable String tokenIngresado) {
        Map<String, Object> response = new HashMap<>();
        Optional<String> token = usuarioService.obtenerTokenPorMail(mail);


        System.out.println("TOKEN plano ingresado: " + tokenIngresado);
        System.out.println("TOKEN hash guardado: " + token.get());
        System.out.println("MATCH: " + passwordEncoder.matches(tokenIngresado, token.get()));

        if (!token.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("El mail ingresado no tiene ningun token asignado");


        } else if(passwordEncoder.matches(tokenIngresado, token.get())){
            response.put("success", true);
            response.put("token", token.get());
            return ResponseEntity.ok(response);

        }else{
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("El token ingresado es incorrecto");
        }
    }

  @PutMapping("/actualizarContrasena/{mail}/{contrasena}")
  public ResponseEntity<?> actualizarContrasena(@PathVariable String mail,@PathVariable String contrasena) {
      Map<String, Object> response = new HashMap<>();
      Optional<Usuario> usuario = usuarioService.buscarPorMail(mail);

      if (usuario.isPresent()) {

          String claveEncriptada = passwordEncoder.encode(contrasena);


          usuarioService.actualizarPassword(mail,claveEncriptada);
          response.put("success", true);
          response.put("mensaje", "Se actualizo correctamente la contraseña");
          return ResponseEntity.ok(response);
      } else {
          response.put("success", false);
          response.put("mensaje", "Error al actualizar contraseña");
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                  .body(response);
      }
  }


    @PostMapping("/obtenerRol/{nombre}")
    public ResponseEntity<?> obtenerRolPorNombre(@PathVariable String nombre) {
        Map<String, Object> response = new HashMap<>();
        Optional<String> rol = usuarioService.obtenerRolPorNombre(nombre);

        if (rol.isPresent()) {
            response.put("success", true);
            response.put("rol", rol.get());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                    .body("El nombre ingresado no tiene ningun rol asignado");
        }
    }

    @GetMapping("/existe-nombre/{nombre}")
    public ResponseEntity<Boolean> existeNombre(@PathVariable String nombre) {
        return ResponseEntity.ok(usuarioService.existeNombre(nombre));
    }

    @GetMapping("/buscarUsuariosPorNombre/{nombre}")
    public ResponseEntity<List<Usuario>> buscarUsuariosPorNombre(@PathVariable String nombre) {
        List<Usuario> listaUsuarios = usuarioService.buscarUsuariosPorNombre(nombre);
        return ResponseEntity.ok(listaUsuarios);
    }



}
