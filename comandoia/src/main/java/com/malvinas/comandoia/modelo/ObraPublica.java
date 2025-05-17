package com.malvinas.comandoia.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "obra_publica")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ObraPublica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tipo_id", foreignKey = @ForeignKey(name = "FK_TIPO_ID"))
    private TipoObra tipo_obra;


    @ManyToOne(optional = false)
    @JoinColumn(name = "estado_id", foreignKey = @ForeignKey(name = "FK_ESTADO_ID"))
    private EstadoObra estado;

    @Column(name = "avance_fisico")
    private double avance_fisico;

    @Column(name = "monto_presupuestado")
    private BigDecimal monto_presupuestado;

    @Column(name = "monto_ejecutado")
    private BigDecimal monto_ejecutado;

    @Column(name = "fecha_inicio")
    private LocalDateTime fecha_inicio;

    @Column(name = "fecha_estimada_finalizacion")
    private LocalDateTime fecha_estimada_finalizacion;

    @Column(name = "fecha_real_finalizacion")
    private LocalDateTime fecha_real_finalizacion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fecha_creacion;

    @Column(name = "fecha_ultima_actualizacion")
    private LocalDateTime fecha_ultima_actualizacion;

    @ManyToOne(
            optional = false,
            cascade = { CascadeType.MERGE }
    )
    @JoinColumn(name = "direccion_id", foreignKey = @ForeignKey(name = "FK_DIRECCION_ID"))
    private Direccion direccion;


    @PrePersist
    private void antesDePersistir(){
        this.fecha_creacion=LocalDateTime.now();
    }
    @PreUpdate
    private void antesDeModificar(){
        this.fecha_ultima_actualizacion=LocalDateTime.now();
    }

}