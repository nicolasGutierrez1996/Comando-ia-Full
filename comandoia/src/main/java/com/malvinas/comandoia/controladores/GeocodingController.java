package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.Coordenada;
import com.malvinas.comandoia.servicios.GeocodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/geo")
public class GeocodingController {

    @Autowired
    private GeocodingService geocodingService;

    @GetMapping("/buscar")
    public ResponseEntity<Coordenada> buscar(@RequestParam String direccion) {
        Coordenada coord = geocodingService.consultarNominatim(direccion);
        System.out.println(coord.getLat()+" "+coord.getLon());
        if (coord != null) {
            return ResponseEntity.ok(coord);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}