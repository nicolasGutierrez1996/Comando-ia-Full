package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.IndicadorReclamo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IndicadorReclamoRepository extends JpaRepository<IndicadorReclamo, Long> {

    // Buscar todos los indicadores de un tipo ("principal" o "suplente")
    List<IndicadorReclamo> findByTipo(String tipo);

    // Buscar por nombre (opcional)
    IndicadorReclamo findByNombre(String nombre);

    // Eliminar todos los indicadores de tipo específico (si querés limpiar antes de recalcular)
    void deleteByTipo(String tipo);

    List<IndicadorReclamo> findTop2ByNombreOrderByFechaCalculoDesc(String nombre);

}
