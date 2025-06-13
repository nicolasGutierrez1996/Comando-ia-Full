package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.IndicadorObra;
import com.malvinas.comandoia.modelo.IndicadorReclamo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IndicadoresObrasRepository extends JpaRepository<IndicadorObra, Long> {

    // Buscar todos los indicadores de un tipo ("principal" o "suplente")
    List<IndicadorObra> findByTipo(String tipo);

    // Buscar por nombre (opcional)
    IndicadorObra findByNombre(String nombre);

    // Eliminar todos los indicadores de tipo específico (si querés limpiar antes de recalcular)
    void deleteByTipo(String tipo);

    List<IndicadorObra> findTop2ByNombreOrderByFechaCalculoDesc(String nombre);
}
