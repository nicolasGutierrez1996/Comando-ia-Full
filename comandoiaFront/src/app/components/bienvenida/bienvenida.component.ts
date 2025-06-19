import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/authService.service';

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
  mostrarContrasena = false;

  constructor(
    private usersService: UsersService,
    private router: Router,
                            private authService: AuthService
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
      this.error = '';
      this.rol = res.rol;

      // 👉 Guardar en el AuthService
      this.authService.setDatos(this.usuario, this.rol);

      // Redirección según rol
      if (this.rol === 'ADMINISTRADOR_DEL_SISTEMA') {
        this.router.navigate(['./administradorSistemaInit']);
      } else if (this.rol === 'ADMINISTRATIVO') {
        this.router.navigate(['./Administrador']);
      } else if (this.rol === 'CONSULTOR_PRINCIPAL') {
        this.router.navigate(['./ConsultorPrincipal']);
      } else if (this.rol === 'CONSULTOR') {
        this.router.navigate(['./Consultor']);
      } else {
        console.log("Rol no autorizado o diferente");
      }
    },
    error: () => {
      this.error = 'Rol no encontrado';
    }
  });
}

 toggleMostrarContrasena(): void {
   this.mostrarContrasena = !this.mostrarContrasena;
 }

}
