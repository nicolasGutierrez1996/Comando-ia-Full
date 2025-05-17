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
}
