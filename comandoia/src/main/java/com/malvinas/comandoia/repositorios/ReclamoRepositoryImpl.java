package com.malvinas.comandoia.repositorios;

import com.malvinas.comandoia.modelo.Reclamo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ReclamoRepositoryImpl implements ReclamoRepositoryCustom {

    @PersistenceContext
    private final EntityManager entityManager;

    @Override
    public List<Reclamo> buscarConFiltros(
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            String estado,
            String localidad,
            String barrio,
            String tipoReclamo,
            String nivelSatisfaccion,
            Integer tiempoResolucionMayor,
            Integer tiempoResolucionMenor
    ) {
        StringBuilder jpql = new StringBuilder("SELECT r FROM Reclamo r WHERE 1=1");

        if (fechaDesde != null) jpql.append(" AND r.fecha_reclamo >= :fechaDesde");
        if (fechaHasta != null) jpql.append(" AND r.fecha_reclamo <= :fechaHasta");
        if (estado != null && !estado.isBlank()) jpql.append(" AND r.estado.descripcion = :estado");
        if (localidad != null && !localidad.isBlank()) jpql.append(" AND r.direccion.localidad = :localidad");
        if (barrio != null && !barrio.isBlank()) jpql.append(" AND r.direccion.barrio = :barrio");
        if (tipoReclamo != null && !tipoReclamo.isBlank()) jpql.append(" AND r.tipo_reclamo.descripcion = :tipoReclamo");
        if (nivelSatisfaccion != null && !nivelSatisfaccion.isBlank()) jpql.append(" AND r.nivel_satisfaccion.descripcion = :nivelSatisfaccion");
        if (tiempoResolucionMayor != null) jpql.append(" AND r.tiempo_resolucion >= :tiempoResolucionMayor");
        if (tiempoResolucionMenor != null) jpql.append(" AND r.tiempo_resolucion <= :tiempoResolucionMenor");

        TypedQuery<Reclamo> query = entityManager.createQuery(jpql.toString(), Reclamo.class);

        if (fechaDesde != null) query.setParameter("fechaDesde", fechaDesde);
        if (fechaHasta != null) query.setParameter("fechaHasta", fechaHasta);
        if (estado != null && !estado.isBlank()) query.setParameter("estado", estado);
        if (localidad != null && !localidad.isBlank()) query.setParameter("localidad", localidad);
        if (barrio != null && !barrio.isBlank()) query.setParameter("barrio", barrio);
        if (tipoReclamo != null && !tipoReclamo.isBlank()) query.setParameter("tipoReclamo", tipoReclamo);
        if (nivelSatisfaccion != null && !nivelSatisfaccion.isBlank()) query.setParameter("nivelSatisfaccion", nivelSatisfaccion);
        if (tiempoResolucionMayor != null) query.setParameter("tiempoResolucionMayor", tiempoResolucionMayor);
        if (tiempoResolucionMenor != null) query.setParameter("tiempoResolucionMenor", tiempoResolucionMenor);

        return query.getResultList();
    }
}
