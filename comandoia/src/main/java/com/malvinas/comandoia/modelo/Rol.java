package com.malvinas.comandoia.modelo;

import com.malvinas.comandoia.modelo.enumeradores.TipoRoles;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Rol")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "tipo", nullable = false)
    private TipoRoles tipo;

    @Column(name = "descripcion")
    private String descripcion;
}
