package com.malvinas.comandoia.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "estado_obra")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class EstadoObra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fecha_creacion;

    @Column(name = "fecha_ultima_actualizacion")
    private LocalDateTime fecha_ultima_actualizacion;

    @PrePersist
    private void prePersist() {
        this.fecha_creacion = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        this.fecha_ultima_actualizacion = LocalDateTime.now();
    }

}
