package com.malvinas.comandoia.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "contrasena", nullable = false)
    private String contrasena;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_ultima_actualizacion")
    private LocalDateTime fechaUltimaActualizacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "estado_id", foreignKey = @ForeignKey(name = "FK_ESTADO_ID"))
    private EstadoUsuario estado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "rol_id", foreignKey = @ForeignKey(name = "FK_ROL_ID"))
    private Rol rol;

    @PrePersist
    private void antesDePersistir(){
        this.fechaCreacion=LocalDateTime.now();
    }
    @PreUpdate
    private void antesDeModificar(){
        this.fechaUltimaActualizacion=LocalDateTime.now();
    }

}
