import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-administradorSistemaInit',
  standalone: true,  // <-- Lo haces standalone
  imports: [CommonModule],  // <-- Importas CommonModule para usar *ngIf y otros directivas
  templateUrl: './administradorSistemaInit.component.html',
  styleUrls: ['./administradorSistemaInit.component.scss']
})
export class AdministradorSistemaInitComponent implements OnInit {

  titulo: string = 'Panel de Administración del Sistema';
  mostrarSubBotonReclamos: boolean = false;
  mostrarSubBotonObras: boolean=false;
  mostrarSubBotonUsuario: boolean=false;
  mostrarCargaDeUsuario: boolean=false;
  constructor() {}

  ngOnInit(): void {
    console.log('AdministradorSistemaInitComponent inicializado');
  }

  MostrarSubBotonesReclamo(): void {
    this.mostrarSubBotonReclamos = !this.mostrarSubBotonReclamos;

  }

  MostrarSubBotonesObras(): void {
      this.mostrarSubBotonObras = !this.mostrarSubBotonObras;
    }

  MostrarSubBotonesUsuarios(): void {
          this.mostrarSubBotonUsuario = !this.mostrarSubBotonUsuario;
        }

  MostrarCargarUsuarios(): void {
           this.mostrarCargaDeUsuario = !this.mostrarCargaDeUsuario;
         }

}
