import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
 import { UsersService } from '../../services/users.service';
import { NgIf } from '@angular/common';  // Importá NgIf
import { RecuperarComponent } from './recuperarContraseña/recuperar.component';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [FormsModule, NgIf, RecuperarComponent],
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css']
})
export class BienvenidaComponent {
  usuario = '';
  contrasena = '';
  error = '';
  mostrarRecuperar: boolean = false;
  constructor(private usersService: UsersService) {}  // inyectar servicio

onLogin(event: Event) {
  event.preventDefault(); // para que no haga submit nativo
  this.usersService.login(this.usuario, this.contrasena).subscribe({
    next: (res) => {
      console.log('Login exitoso:', res);
      this.error = '';
    },
    error: () => {
      this.error = 'Usuario o contraseña incorrectos';
    }
  });
}
}
