package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.DTO.IndicadorComparadoDTO;
import com.malvinas.comandoia.modelo.IndicadorReclamo;
import com.malvinas.comandoia.repositorios.IndicadorReclamoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IndicadorReclamoService {

    private final IndicadorReclamoRepository indicadorReclamoRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void calcularIndicadores() {

        // Indicador principal: % de reclamos cerrados
        BigDecimal cerrados = ejecutarQueryDecimal("""
                    SELECT COUNT(*) FILTER (WHERE er.descripcion ILIKE '%cerrado%') * 100.0 / NULLIF(COUNT(*),0)
                            FROM reclamo r
                            JOIN estado_reclamo er ON r.estado_id = er.id;
                """);

        guardarIndicador("Reclamos cerrados", "Porcentaje de reclamos cerrados sobre el total", "principal", cerrados, "%");

        // Suplente: % en proceso
        BigDecimal enProceso = ejecutarQueryDecimal("""
                    SELECT COUNT(*) FILTER (WHERE er.descripcion ILIKE '%proceso%') * 100.0 / NULLIF(COUNT(*),0)
                            FROM reclamo r
                            JOIN estado_reclamo er ON r.estado_id = er.id;
                """);

        guardarIndicador("Reclamos en proceso", "Porcentaje de reclamos actualmente en estado 'En proceso'", "suplente", enProceso, "%");

        // Suplente: % pendientes
        BigDecimal pendientes = ejecutarQueryDecimal("""
                    SELECT COUNT(*) FILTER (
                              WHERE er.descripcion ILIKE '%abierto%' OR er.descripcion ILIKE '%pendiente%'
                            ) * 100.0 / NULLIF(COUNT(*),0)
                            FROM reclamo r
                            JOIN estado_reclamo er ON r.estado_id = er.id;
                """);

        guardarIndicador("Reclamos pendientes", "Porcentaje de reclamos abiertos o pendientes", "suplente", pendientes, "%");

        // Indicador principal: satisfacción promedio
        BigDecimal satisfaccion = ejecutarQueryDecimal("""
            SELECT AVG(CASE 
              WHEN ns.descripcion ILIKE '%muy satisfecho%' THEN 5
              WHEN ns.descripcion ILIKE '%satisfecho%' THEN 4
              WHEN ns.descripcion ILIKE '%neutral%' THEN 3
              WHEN ns.descripcion ILIKE '%insatisfecho%' THEN 2
              WHEN ns.descripcion ILIKE '%muy insatisfecho%' THEN 1
              ELSE NULL END)
            FROM reclamo r
            JOIN tipo_nivel_satisfaccion ns ON r.nivel_satisfaccion_id = ns.id
            JOIN estado_reclamo er ON r.estado_id = er.id
            WHERE er.descripcion ILIKE '%cerrado%'
        """);

        guardarIndicador("Satisfacción ciudadana", "Promedio ponderado de los niveles de satisfacción", "principal", satisfaccion, "puntos");

        // Suplente: % alta satisfacción
        BigDecimal alta = ejecutarQueryDecimal("""
            SELECT COUNT(*) FILTER (
              WHERE ns.descripcion ILIKE '%satisfecho%' OR ns.descripcion ILIKE '%muy satisfecho%'
            ) * 100.0 / NULLIF(COUNT(*),0)
            FROM reclamo r
            JOIN tipo_nivel_satisfaccion ns ON r.nivel_satisfaccion_id = ns.id
        """);

        guardarIndicador("Alta satisfacción", "Porcentaje de reclamos con nivel alto de satisfacción", "suplente", alta, "%");

        // Suplente: % baja satisfacción
        BigDecimal baja = ejecutarQueryDecimal("""
            SELECT COUNT(*) FILTER (
              WHERE ns.descripcion ILIKE '%insatisfecho%' OR ns.descripcion ILIKE '%muy insatisfecho%'
            ) * 100.0 / NULLIF(COUNT(*),0)
            FROM reclamo r
            JOIN tipo_nivel_satisfaccion ns ON r.nivel_satisfaccion_id = ns.id
        """);

        guardarIndicador("Baja satisfacción", "Porcentaje de reclamos con baja satisfacción", "suplente", baja, "%");
    }

    private BigDecimal ejecutarQueryDecimal(String sql) {
        Object result = entityManager.createNativeQuery(sql).getSingleResult();
        return result != null ? new BigDecimal(result.toString()) : BigDecimal.ZERO;
    }

    private void guardarIndicador(String nombre, String descripcion, String tipo, BigDecimal valor, String unidad) {
        IndicadorReclamo indicador = new IndicadorReclamo(
                null,
                nombre,
                descripcion,
                tipo,
                valor,
                unidad,
                LocalDateTime.now(),
                null
        );
        indicadorReclamoRepository.save(indicador);
    }


     @Scheduled(cron = "0 0 8 * * *") // todos los días a las 8:00 AM
    //@Scheduled(cron = "0 * * * * *") // cada minuto (para pruebas)
    @Transactional
    public void calcularIndicadoresAutomatico() {
         calcularIndicadores();
    }


    public IndicadorComparadoDTO compararConAnterior(String nombreIndicador) {
        List<IndicadorReclamo> ultimos = indicadorReclamoRepository
                .findTop2ByNombreOrderByFechaCalculoDesc(nombreIndicador);

        if (ultimos.isEmpty()) {
            return new IndicadorComparadoDTO(nombreIndicador, BigDecimal.ZERO, "%", BigDecimal.ZERO, "→");
        }

        IndicadorReclamo actual = ultimos.get(0);
        BigDecimal valorActual = actual.getValor();
        String unidad = actual.getUnidad();

        if (ultimos.size() == 1) {
            return new IndicadorComparadoDTO(nombreIndicador, valorActual, unidad, BigDecimal.ZERO, "→");
        }

        BigDecimal anterior = ultimos.get(1).getValor();
        BigDecimal variacion = valorActual.subtract(anterior);
        String direccion = variacion.compareTo(BigDecimal.ZERO) > 0 ? "↑" :
                variacion.compareTo(BigDecimal.ZERO) < 0 ? "↓" : "→";

        return new IndicadorComparadoDTO(nombreIndicador, valorActual, unidad, variacion, direccion);
    }

    public List<IndicadorComparadoDTO> obtenerPrincipalesComparados() {
        List<String> nombres = List.of("Reclamos cerrados", "Satisfacción ciudadana");

        return nombres.stream()
                .map(this::compararConAnterior)
                .toList();
    }

    public List<IndicadorComparadoDTO> obtenerSuplentesComparados() {
        List<String> nombres = List.of(
                "Reclamos en proceso",
                "Reclamos pendientes",
                "Alta satisfacción",
                "Baja satisfacción"
        );

        return nombres.stream()
                .map(this::compararConAnterior)
                .toList();
    }


}
