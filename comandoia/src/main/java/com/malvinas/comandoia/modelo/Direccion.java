package com.malvinas.comandoia.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "direccion")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Direccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "localidad", nullable = false, length = 50)
    private String localidad;

    @Column(name = "barrio")
    private String barrio;

    @Column(name = "calle")
    private String calle;

    @Column(name = "numero_calle")
    private Integer numero_calle;  // permite null si no se sabe el número
}