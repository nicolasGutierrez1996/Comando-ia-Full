package com.malvinas.comandoia.servicios;

import com.malvinas.comandoia.modelo.DTO.IndicadorComparadoDTO;
import com.malvinas.comandoia.modelo.IndicadorObra;
import com.malvinas.comandoia.repositorios.IndicadoresObrasRepository;
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
public class IndicadorObraService {
    private final IndicadoresObrasRepository indicadorObraRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void calcularIndicadores() {

        // Indicador principal: % de obras finalizadas
        BigDecimal porcentajeFinalizadas = ejecutarQueryDecimal("""
        SELECT COUNT(*) FILTER (WHERE fecha_real_finalizacion IS NOT NULL) * 100.0 / NULLIF(COUNT(*), 0)
        FROM obra_publica;
    """);

        guardarIndicador("Obras finalizadas", "Porcentaje de obras finalizadas sobre el total", "principal", porcentajeFinalizadas, "%");

        // Indicador principal: Promedio avance físico
        BigDecimal promedioAvance = ejecutarQueryDecimal("""
        SELECT AVG(avance_fisico)
        FROM obra_publica;
    """);

        guardarIndicador("Avance físico promedio", "Promedio de avance físico de todas las obras", "principal", promedioAvance, "%");

        // Suplente: Cantidad de obras activas (en ejecución)
        BigDecimal obrasActivas = ejecutarQueryDecimal("""
        SELECT COUNT(*)
        FROM obra_publica op
        JOIN estado_obra eo ON op.estado_id = eo.id
        WHERE eo.descripcion ILIKE '%ejecución%';
    """);

        guardarIndicador("Obras activas", "Cantidad de obras actualmente en ejecución", "suplente", obrasActivas, "unidades");

        // Suplente: Obras sin fecha de finalización real
        BigDecimal obrasAbiertas = ejecutarQueryDecimal("""
        SELECT COUNT(*)
        FROM obra_publica
        WHERE fecha_real_finalizacion IS NULL;
    """);

        guardarIndicador("Obras abiertas", "Cantidad de obras sin fecha de finalización real", "suplente", obrasAbiertas, "unidades");

        // Suplente: % ejecutado vs presupuestado
        BigDecimal porcentajeEjecutado = ejecutarQueryDecimal("""
        SELECT SUM(monto_ejecutado) * 100.0 / NULLIF(SUM(monto_presupuestado), 0)
        FROM obra_publica;
    """);

        guardarIndicador("Ejecución presupuestaria", "Monto total ejecutado sobre el presupuestado", "suplente", porcentajeEjecutado, "%");

        // Suplente: Cantidad de obras con avance físico bajo (< 30%)
        BigDecimal obrasBajoAvance = ejecutarQueryDecimal("""
        SELECT COUNT(*)
        FROM obra_publica
        WHERE avance_fisico < 30;
    """);

        guardarIndicador("Avance físico bajo", "Cantidad de obras con avance físico menor al 30%", "suplente", obrasBajoAvance, "unidades");
    }

    private BigDecimal ejecutarQueryDecimal(String sql) {
        Object result = entityManager.createNativeQuery(sql).getSingleResult();
        return result != null ? new BigDecimal(result.toString()) : BigDecimal.ZERO;
    }

    private void guardarIndicador(String nombre, String descripcion, String tipo, BigDecimal valor, String unidad) {
        IndicadorObra indicador = new IndicadorObra(
                null,
                nombre,
                descripcion,
                tipo,
                valor,
                unidad,
                LocalDateTime.now(),
                null
        );
        indicadorObraRepository.save(indicador);
    }


    //@Scheduled(cron = "0 0 8 * * *") // todos los días a las 8:00 AM
    @Scheduled(cron = "0 * * * * *") // cada minuto (para pruebas)
    @Transactional
    public void calcularIndicadoresAutomatico() {
        calcularIndicadores();
    }


    public IndicadorComparadoDTO compararConAnterior(String nombreIndicador) {
        List<IndicadorObra> ultimos = indicadorObraRepository.findTop2ByNombreOrderByFechaCalculoDesc(nombreIndicador);

        if (ultimos.isEmpty()) {
            return new IndicadorComparadoDTO(nombreIndicador, BigDecimal.ZERO, "%", BigDecimal.ZERO, "→");
        }

        IndicadorObra actual = ultimos.get(0);
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
        List<String> nombres = List.of("Obras finalizadas","Avance físico promedio");

        return nombres.stream()
                .map(this::compararConAnterior)
                .toList();
    }

    public List<IndicadorComparadoDTO> obtenerSuplentesComparados() {
        List<String> nombres = List.of(
                "Obras activas",
                "Obras abiertas",
                "Ejecución presupuestaria",
                "Avance físico bajo"
        );

        return nombres.stream()
                .map(this::compararConAnterior)
                .toList();
    }


}
