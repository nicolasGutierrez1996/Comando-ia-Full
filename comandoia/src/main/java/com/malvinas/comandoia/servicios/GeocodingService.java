package com.malvinas.comandoia.servicios;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.malvinas.comandoia.modelo.Coordenada;
import com.malvinas.comandoia.modelo.Direccion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeocodingService {

    @Autowired
    private DireccionService direccionService;

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public GeocodingService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "Mozilla/5.0 (IA Malvinas - contacto@ejemplo.com)")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    @Scheduled(fixedRate = 300000)
    public void actualizarCoordenadasPendientes() throws InterruptedException {
        List<Direccion> direcciones = direccionService.obtenerDireccionesSinCoordenadas();
        System.out.println("Total direcciones sin coordenadas: " + direcciones.size());

        for (Direccion dir : direcciones) {
            Coordenada coordenada = consultarNominatimConFallback(dir);
            if (coordenada != null) {
                System.out.println("📌 Coordenadas obtenidas: lat=" + coordenada.getLat() + ", lon=" + coordenada.getLon());
                dir.setLatitud(coordenada.getLat());
                dir.setLongitud(coordenada.getLon());
                direccionService.guardarDireccion(dir);
            } else {
                System.out.println("⚠️ No se encontraron coordenadas para: " + construirDireccionCompleta(dir));
            }

            Thread.sleep(1000); // Delay entre requests
        }
    }

    public Coordenada consultarNominatimConFallback(Direccion dir) {
        List<String> variantes = construirDireccionesFallback(dir);

        for (String direccion : variantes) {
            Coordenada coord = consultarNominatim(direccion);
            if (coord != null) {
                System.out.println("✅ Dirección resuelta con: " + direccion);
                return coord;
            }

            try {
                Thread.sleep(1000);
            } catch (InterruptedException ignored) {}
        }

        System.out.println("❌ No se pudo geolocalizar ninguna variante.");
        return null;
    }

    private List<String> construirDireccionesFallback(Direccion dir) {
        String localidad = dir.getLocalidad() != null ? dir.getLocalidad().trim() : "";
        String calle = dir.getCalle() != null ? dir.getCalle().trim() : "";
        String numero = dir.getNumeroCalle() != null ? dir.getNumeroCalle().toString().trim() : "";

        List<String> direcciones = new ArrayList<>();

        if (!localidad.isBlank() && !calle.isBlank() && !numero.isBlank()) {
            direcciones.add(calle + " " + numero + ", " + localidad + ", Buenos Aires, Argentina");
        }
        if (!localidad.isBlank() && !calle.isBlank()) {
            direcciones.add(calle + ", " + localidad + ", Buenos Aires, Argentina");
        }
        if (!localidad.isBlank()) {
            direcciones.add(localidad + ", Buenos Aires, Argentina");
        }

        return direcciones;
    }

    public Coordenada consultarNominatim(String direccion) {
        try {
            Mono<String> responseMono = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", direccion)
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class);

            String responseBody = responseMono.block();
            JsonNode array = mapper.readTree(responseBody);

            if (array.isArray() && array.size() > 0) {
                JsonNode nodo = array.get(0);
                double lat = nodo.get("lat").asDouble();
                double lon = nodo.get("lon").asDouble();
                return new Coordenada(lat, lon);
            }
        } catch (Exception e) {
            System.out.println("🛑 Error consultando Nominatim con dirección: " + direccion + " - " + e.getMessage());
        }

        return null;
    }

    private String construirDireccionCompleta(Direccion dir) {
        StringBuilder sb = new StringBuilder();

        if (dir.getCalle() != null && !dir.getCalle().isBlank()) {
            sb.append(dir.getCalle().trim());
            if (dir.getNumeroCalle() != null) {
                sb.append(" ").append(dir.getNumeroCalle());
            }
        }

        if (dir.getBarrio() != null && !dir.getBarrio().isBlank()) {
            sb.append(", ").append(dir.getBarrio().trim());
        }

        if (dir.getLocalidad() != null && !dir.getLocalidad().isBlank()) {
            sb.append(", ").append(dir.getLocalidad().trim());
        }

        sb.append(", Malvinas Argentinas, Buenos Aires, Argentina");
        return sb.toString().replaceAll("\\s+", " ").trim();
    }
}