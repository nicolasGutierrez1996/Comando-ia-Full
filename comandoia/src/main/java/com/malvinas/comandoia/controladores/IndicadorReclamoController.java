package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.DTO.IndicadorComparadoDTO;
import com.malvinas.comandoia.modelo.IndicadorReclamo;
import com.malvinas.comandoia.repositorios.IndicadorReclamoRepository;
import com.malvinas.comandoia.servicios.IndicadorReclamoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/indicadores/reclamos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IndicadorReclamoController {

    private final IndicadorReclamoService indicadorReclamoService;
    private final IndicadorReclamoRepository indicadorReclamoRepository;


    @PostMapping("/calcular")
    public ResponseEntity<String> calcularIndicadores() {
        try {
            indicadorReclamoService.calcularIndicadores();
            return ResponseEntity.ok("Indicadores de reclamos calculados correctamente.");
        } catch (Exception e) {
            // Opcional: podés usar Logger en vez de imprimir
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ocurrió un error al calcular los indicadores: " + e.getMessage());
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<IndicadorReclamo>> listarIndicadores() {
        List<IndicadorReclamo> indicadores = indicadorReclamoRepository.findAll();
        return ResponseEntity.ok(indicadores);
    }

    @GetMapping("/comparar-detalle")
    public ResponseEntity<?> compararDetalle(@RequestParam String nombre) {
        try {
            IndicadorComparadoDTO dto = indicadorReclamoService.compararConAnterior(nombre);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace(); // o usar logger
            return ResponseEntity.status(500).body("Error al comparar el indicador: " + e.getMessage());
        }
    }

    @GetMapping("/principales-detalle")
    public ResponseEntity<List<IndicadorComparadoDTO>> obtenerPrincipalesComparados() {
        try {
            List<IndicadorComparadoDTO> lista = indicadorReclamoService.obtenerPrincipalesComparados();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/suplentes-detalle")
    public ResponseEntity<List<IndicadorComparadoDTO>> obtenerSuplentesComparados() {
        try {
            List<IndicadorComparadoDTO> lista = indicadorReclamoService.obtenerSuplentesComparados();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
