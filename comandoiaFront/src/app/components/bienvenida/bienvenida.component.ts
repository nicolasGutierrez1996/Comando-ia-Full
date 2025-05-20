import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css']
})
export class BienvenidaComponent {
  usuario = '';
  contrasena = '';
  error = '';
  rol='';

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  onLogin(event: Event) {
    event.preventDefault();
    this.usersService.login(this.usuario, this.contrasena).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);
        this.error = '';
        this.navegarPaginaPorRol();

      },
      error: () => {
        this.error = 'Usuario o contraseña incorrectos';
      }
    });
  }

  irARecuperar() {
    this.router.navigate(['/recuperar']);
  }

 navegarPaginaPorRol() {
   this.usersService.obtenerRol(this.usuario).subscribe({
     next: (res) => {
       console.log('Se encontró el rol:', res);
       this.error = '';
        this.rol = res.rol;
       if (this.rol === 'ADMINISTRADOR_DEL_SISTEMA') {
         console.log("Ingrese a redireccionar a administrador del sistema");
         this.router.navigate(['./administradorSistemaInit']);
       }else if(this.rol === 'ADMINISTRATIVO'){
                  this.router.navigate(['./Administrador']);


       }else if(this.rol === 'CONSULTOR_PRINCIPAL'){
                     this.router.navigate(['./Consultor']);

       }else if(this.rol === 'CONSULTOR'){
               this.router.navigate(['./ConsultorPrincipal']);

       }
        else {
         // Si hay otros roles y rutas, podés agregar más condiciones aquí
         console.log("Rol no autorizado o diferente");
       }
     },
     error: () => {
       this.error = 'Rol no encontrado';
     }
   });
 }
}
