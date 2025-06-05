package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.ObraPublica;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ObraPublicaRepositoryImpl implements ObraPublicaRepositoryCustom {

    @PersistenceContext
    private final EntityManager entityManager;

    @Override
    public List<ObraPublica> buscarObrasConFiltros(
            LocalDateTime fechaInicioDesde,
            LocalDateTime fechaInicioHasta,
            LocalDateTime fechaEstimadaFinDesde,
            LocalDateTime fechaEstimadaFinHasta,
            LocalDateTime fechaRealFinDesde,
            LocalDateTime fechaRealFinHasta,
            String tipoObra,
            String estado,
            Double avanceFisicoMayor,
            Double avanceFisicoMenor,
            BigDecimal montoPresupuestadoMayor,
            BigDecimal montoPresupuestadoMenor,
            BigDecimal montoEjecutadoMayor,
            BigDecimal montoEjecutadoMenor,
            String localidad,
            String barrio
    ) {
        StringBuilder jpql = new StringBuilder("SELECT o FROM ObraPublica o WHERE 1=1");

        if (fechaInicioDesde != null) jpql.append(" AND o.fecha_inicio >= :fechaInicioDesde");
        if (fechaInicioHasta != null) jpql.append(" AND o.fecha_inicio <= :fechaInicioHasta");
        if (fechaEstimadaFinDesde != null) jpql.append(" AND o.fecha_estimada_finalizacion >= :fechaEstimadaFinDesde");
        if (fechaEstimadaFinHasta != null) jpql.append(" AND o.fecha_estimada_finalizacion <= :fechaEstimadaFinHasta");
        if (fechaRealFinDesde != null) jpql.append(" AND o.fecha_real_finalizacion >= :fechaRealFinDesde");
        if (fechaRealFinHasta != null) jpql.append(" AND o.fecha_real_finalizacion <= :fechaRealFinHasta");
        if (tipoObra != null && !tipoObra.isBlank()) jpql.append(" AND o.tipo_obra.descripcion = :tipoObra");
        if (estado != null && !estado.isBlank()) jpql.append(" AND o.estado.descripcion = :estado");
        if (avanceFisicoMayor != null) jpql.append(" AND o.avance_fisico >= :avanceFisicoMayor");
        if (avanceFisicoMenor != null) jpql.append(" AND o.avance_fisico <= :avanceFisicoMenor");
        if (montoPresupuestadoMayor != null) jpql.append(" AND o.monto_presupuestado >= :montoPresupuestadoMayor");
        if (montoPresupuestadoMenor != null) jpql.append(" AND o.monto_presupuestado <= :montoPresupuestadoMenor");
        if (montoEjecutadoMayor != null) jpql.append(" AND o.monto_ejecutado >= :montoEjecutadoMayor");
        if (montoEjecutadoMenor != null) jpql.append(" AND o.monto_ejecutado <= :montoEjecutadoMenor");
        if (localidad != null && !localidad.isBlank()) jpql.append(" AND o.direccion.localidad = :localidad");
        if (barrio != null && !barrio.isBlank()) jpql.append(" AND o.direccion.barrio = :barrio");

        TypedQuery<ObraPublica> query = entityManager.createQuery(jpql.toString(), ObraPublica.class);

        if (fechaInicioDesde != null) query.setParameter("fechaInicioDesde", fechaInicioDesde);
        if (fechaInicioHasta != null) query.setParameter("fechaInicioHasta", fechaInicioHasta);
        if (fechaEstimadaFinDesde != null) query.setParameter("fechaEstimadaFinDesde", fechaEstimadaFinDesde);
        if (fechaEstimadaFinHasta != null) query.setParameter("fechaEstimadaFinHasta", fechaEstimadaFinHasta);
        if (fechaRealFinDesde != null) query.setParameter("fechaRealFinDesde", fechaRealFinDesde);
        if (fechaRealFinHasta != null) query.setParameter("fechaRealFinHasta", fechaRealFinHasta);
        if (tipoObra != null && !tipoObra.isBlank()) query.setParameter("tipoObra", tipoObra);
        if (estado != null && !estado.isBlank()) query.setParameter("estado", estado);
        if (avanceFisicoMayor != null) query.setParameter("avanceFisicoMayor", avanceFisicoMayor);
        if (avanceFisicoMenor != null) query.setParameter("avanceFisicoMenor", avanceFisicoMenor);
        if (montoPresupuestadoMayor != null) query.setParameter("montoPresupuestadoMayor", montoPresupuestadoMayor);
        if (montoPresupuestadoMenor != null) query.setParameter("montoPresupuestadoMenor", montoPresupuestadoMenor);
        if (montoEjecutadoMayor != null) query.setParameter("montoEjecutadoMayor", montoEjecutadoMayor);
        if (montoEjecutadoMenor != null) query.setParameter("montoEjecutadoMenor", montoEjecutadoMenor);
        if (localidad != null && !localidad.isBlank()) query.setParameter("localidad", localidad);
        if (barrio != null && !barrio.isBlank()) query.setParameter("barrio", barrio);

        return query.getResultList();
    }
}
