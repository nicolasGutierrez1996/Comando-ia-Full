package com.malvinas.comandoia.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "indicador_reclamo")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class IndicadorReclamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String descripcion;

    private String tipo; // "principal" o "suplente"

    private BigDecimal valor;

    private String unidad;

    @Column(name = "fecha_calculo")
    private LocalDateTime fechaCalculo;

    @ManyToOne
    @JoinColumn(name = "id_direccion")
    private Direccion direccion;

}
