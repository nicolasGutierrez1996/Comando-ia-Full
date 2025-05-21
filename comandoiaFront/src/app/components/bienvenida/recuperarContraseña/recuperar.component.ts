import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css'],
  imports: [CommonModule, FormsModule, MatSnackBarModule]
})
export class RecuperarComponent {
  email: string = '';
  token: string='';
  clave: string='';
  repeticion: string='';
  error: string = '';
  errorToken: string='';
  errorClave: string='';
  errorRepeticion: string='';
  cargando: boolean = false;
  ocultarClave:boolean=false;
  ocultarToken:boolean=false;
  mostrarClave: boolean = false;
  mostrarRepeticion: boolean = false;
  constructor(private usersService: UsersService, private router: Router,
                                                                          private snackBar: MatSnackBar) {}

enviarRecuperacion() {

  if (!this.ocultarToken) {
    if (!this.email) {
      this.error = 'El correo electrónico es obligatorio.';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.usersService.recuperarClave(this.email).subscribe({
      next: res => {
        console.log("Ingrese a todo OK");
        this.error = '';
        this.cargando = false;
        this.ocultarToken = true;
      },
      error: err => {
        console.log("err", err.error);
        this.error = 'El email ingresado no corresponde a ningún usuario';
        this.cargando = false;
      }
    });
  } else if (this.ocultarToken && !this.ocultarClave) {
  console.log("Ingrese a validacion de token")
    if (this.token === '') {
      this.errorToken = 'Debe ingresar el token.';
      return;
    }

     this.usersService.obtenerToken(this.email).subscribe({
         next: (res) => {
           this.cargando = false;
           if (res.token === this.token) {
             this.ocultarClave=true;
             this.errorToken = '';
           } else {
             this.errorToken = 'El token ingresado no es valido.';
           }
         },
         error: (err) => {
           this.cargando = false;
           this.errorToken = err.error || 'Error al comunicarse con el servidor.';
         }
       });



  }
  if(this.ocultarClave){
    this.validarClavesIngresadas();

  }
}

validarClavesIngresadas(){
console.log("Ingrese a validar claves");
console.log("clave:",this.clave);
console.log("repe:",this.repeticion);

      if(this.clave===''){
        this.errorClave="Debe ingresar la nueva clave";
      }else if (this.repeticion===''){
      this.errorClave='';
         this.errorRepeticion="Debe repetir la clave ingresada"
      }else if(this.clave!==this.repeticion){
          this.errorClave='';
         this.errorRepeticion="Las claves no coinciden"

      }else{
                     this.errorClave='';

                     this.errorRepeticion='';

                 this.usersService.cambiarContrasena(this.email,this.clave).subscribe({
                 next: (res) => {
                                 this.cargando = false;
                                console.log("Ingrese a todo OK");
                       this.snackBar.open('La contraseña fue cambiada con éxito', '', {
                         duration: 3000,
                         horizontalPosition: 'end',
                         verticalPosition: 'top'
                       }).afterDismissed().subscribe(() => {
                         this.router.navigate(['/bienvenida']);
                       });
                          },
                          error: (err) => {
                            this.cargando = false;
                            this.errorRepeticion ='Error al actualizar clave';
                          }
                        });

      }
}



}
