package com.malvinas.comandoia.utils;

import java.security.SecureRandom;

public class FuncionesVarias {

    public static String generarContrasenaAleatoria() {
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 6; i++) {
            int index = random.nextInt(caracteres.length());
            sb.append(caracteres.charAt(index));
        }

        return sb.toString();
    }


    public static String generarTokenDeClave(){
        String caracteres="0123456789";
        SecureRandom random=new SecureRandom();
        StringBuilder sb=new StringBuilder();
        for(int i=0;i<7; i++){
            int index = random.nextInt(caracteres.length());
            sb.append(caracteres.charAt(index));
        }
        return sb.toString();

    }


    public boolean esPreguntaPermitida(String prompt) {
        String lower = prompt.toLowerCase();

        return lower.contains("reclamo") ||
                lower.contains("obra") ||
                lower.contains("intendente") ||
                lower.contains("solucionar") ||
                lower.contains("satisfacción") ||
                lower.contains("mapa") ||
                lower.contains("malvinas") ||
                lower.contains("seguridad") ||
                lower.contains("educación") ||
                lower.contains("infraestructura") ||
                lower.contains("municipio");
    }
}
