import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RecuperarComponent {
  email: string = '';
  mensaje: string = '';
  error: string = '';

  constructor(private usersService: UsersService) {}

  enviarRecuperacion() {
    if (!this.email) {
      this.error = 'El correo electrónico es obligatorio.';
      this.mensaje = '';
      return;
    }

    // Simulación: este método debería estar implementado en tu servicio
    /*this.usersService.enviarRecuperacion(this.email).subscribe({
      next: () => {
        this.mensaje = 'Se ha enviado un correo con instrucciones.';
        this.error = '';
      },
      error: () => {
        this.error = 'No se pudo enviar el correo. Verificá el email.';
        this.mensaje = '';
      }
    });
  }*/
}
 }
