package com.malvinas.comandoia.utils;

import java.util.HashMap;
import java.util.Map;

public class MemoriaIA {

    private static final Map<String, String> memoriaPorUsuario = new HashMap<>();

    public static void guardarContexto(String userId, String contexto) {
        memoriaPorUsuario.put(userId, contexto);
    }

    public static String obtenerContexto(String userId) {
        return memoriaPorUsuario.getOrDefault(userId, "");
    }

    public static void limpiarContexto(String userId) {
        memoriaPorUsuario.remove(userId);
    }
}
