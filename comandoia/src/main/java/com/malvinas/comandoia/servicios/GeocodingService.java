package com.malvinas.comandoia.servicios;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.malvinas.comandoia.modelo.Coordenada;
import com.malvinas.comandoia.modelo.Direccion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
@Service
public class GeocodingService {
    @Autowired
    private DireccionService direccionService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Scheduled(fixedRate = 300000)
    public void actualizarCoordenadasPendientes() throws InterruptedException {
        List<Direccion> direcciones = direccionService.obtenerDireccionesSinCoordenadas();
        System.out.println("Total direcciones sin coordenadas: " + direcciones.size());

        for (Direccion dir : direcciones) {
            String direccionCompleta = construirDireccion(dir);
            System.out.println("Dirección construida: [" + direccionCompleta + "]");

            if (direccionCompleta.isBlank()) {
                System.out.println("Dirección vacía, se saltea");
                continue;
            }

            Coordenada coordenada = consultarNominatim(direccionCompleta);
            if (coordenada != null) {
                System.out.println("Coordenadas obtenidas: lat=" + coordenada.getLat() + ", lon=" + coordenada.getLon());
                dir.setLatitud(coordenada.getLat());
                dir.setLongitud(coordenada.getLon());
                direccionService.guardarDireccion(dir);
            } else {
                System.out.println("No se encontraron coordenadas para: " + direccionCompleta);
            }

            Thread.sleep(1000);
        }
    }

    private String construirDireccion(Direccion dir) {
        StringBuilder sb = new StringBuilder();

        if (dir.getCalle() != null && !dir.getCalle().isBlank()) {
            sb.append(dir.getCalle());
            if (dir.getNumeroCalle() != null) {
                sb.append(" ").append(dir.getNumeroCalle());
            }
            sb.append(" ");
        }

        if (dir.getBarrio() != null && !dir.getBarrio().isBlank()) {
            sb.append(dir.getBarrio()).append(" ");
        }

        if (dir.getLocalidad() != null && !dir.getLocalidad().isBlank()) {
            sb.append(dir.getLocalidad()).append(" ");
        }

        sb.append("Buenos Aires Argentina");
        return sb.toString().trim();
    }

    public Coordenada consultarNominatim(String direccionOriginal) {
        try {
            // Normaliza y capitaliza dirección
            String direccion = capitalizarDireccion(direccionOriginal);
            System.out.println("Dirección construida: [" + direccion + "]");

            String url = "https://nominatim.openstreetmap.org/search?q=" +
                    URLEncoder.encode(direccion, StandardCharsets.UTF_8) +
                    "&format=json";

            HttpHeaders headers = new HttpHeaders();
            headers.add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36");
            headers.add("Accept", "application/json");
            headers.add("Accept-Language", "es-ES,es;q=0.9");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            System.out.println("Consultando Nominatim con URL: " + url);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode array = mapper.readTree(response.getBody());

            // Retry en caso de respuesta vacía
            if (array.isEmpty()) {
                System.out.println("⚠️ Primera llamada vacía, intentando retry...");
                Thread.sleep(1000); // breve espera para retry
                response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
                array = mapper.readTree(response.getBody());
            }

            if (array.isArray() && array.size() > 0) {
                JsonNode nodo = array.get(0);
                double lat = nodo.get("lat").asDouble();
                double lon = nodo.get("lon").asDouble();
                System.out.println("✅ Coordenadas encontradas: lat=" + lat + ", lon=" + lon);
                return new Coordenada(lat, lon);
            } else {
                System.out.println("❌ Nominatim no devolvió resultados para: " + direccion);
            }

        } catch (Exception e) {
            System.out.println("🛑 Error geolocalizando: " + direccionOriginal + " - " + e.getMessage());
        }
        System.out.println("No se encontraron coordenadas para: " + direccionOriginal);
        return null;
    }

    private String capitalizarDireccion(String direccion) {
        return Arrays.stream(direccion.split(" "))
                .map(s -> s.isEmpty() ? s :
                        Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}