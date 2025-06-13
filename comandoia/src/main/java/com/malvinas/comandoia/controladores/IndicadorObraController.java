package com.malvinas.comandoia.controladores;

import com.malvinas.comandoia.modelo.DTO.IndicadorComparadoDTO;
import com.malvinas.comandoia.modelo.IndicadorObra;
import com.malvinas.comandoia.repositorios.IndicadoresObrasRepository;
import com.malvinas.comandoia.servicios.IndicadorObraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/indicadores/obras")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IndicadorObraController {
    private final IndicadorObraService indicadorObraService;
    private final IndicadoresObrasRepository indicadorObraRepository;


    @PostMapping("/calcular")
    public ResponseEntity<String> calcularIndicadores() {
        try {
            indicadorObraService.calcularIndicadores();
            return ResponseEntity.ok("Indicadores de obras calculados correctamente.");
        } catch (Exception e) {
            // Opcional: podés usar Logger en vez de imprimir
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ocurrió un error al calcular los indicadores: " + e.getMessage());
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<IndicadorObra>> listarIndicadores() {
        List<IndicadorObra> indicadores = indicadorObraRepository.findAll();
        return ResponseEntity.ok(indicadores);
    }

    @GetMapping("/comparar-detalle")
    public ResponseEntity<?> compararDetalle(@RequestParam String nombre) {
        try {
            IndicadorComparadoDTO dto = indicadorObraService.compararConAnterior(nombre);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace(); // o usar logger
            return ResponseEntity.status(500).body("Error al comparar el indicador: " + e.getMessage());
        }
    }

    @GetMapping("/principales-detalle")
    public ResponseEntity<List<IndicadorComparadoDTO>> obtenerPrincipalesComparados() {
        try {
            List<IndicadorComparadoDTO> lista = indicadorObraService.obtenerPrincipalesComparados();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/suplentes-detalle")
    public ResponseEntity<List<IndicadorComparadoDTO>> obtenerSuplentesComparados() {
        try {
            List<IndicadorComparadoDTO> lista = indicadorObraService.obtenerSuplentesComparados();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

}
