package com.malvinas.comandoia.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void enviarCredenciales(String destino, String contrasena, String nombreUsuario) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        mensaje.setSubject("Recuperación de clave - COMANDO IA Malvinas");
        mensaje.setText("Hola, tu usuario con el nombre:"+nombreUsuario+" ha sido creado.\n\nTu contraseña es: " + contrasena);

        mailSender.send(mensaje);
    }

    public void enviarTokenDeRecuperacion(String destino, String token) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        mensaje.setSubject("Tu nueva cuenta en COMANDO IA Malvinas");
        mensaje.setText("Hola,\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nTu código de recuperación es: " + token +
                "\n\nSi no realizaste esta solicitud, por favor ignorá este mensaje.");

        mailSender.send(mensaje);
    }
}
