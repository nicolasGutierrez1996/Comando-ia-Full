import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RolesService, Rol } from '../../services/roles.service';
import { EstadoUsuarioService, Estado } from '../../services/estadoUsuario.service';
import { UsersService,Usuario} from '../../services/users.service';
import { EstadoObrasService,EstadoObra} from '../../services/estadoObras.service';
import { TipoObrasService,TipoObra} from '../../services/tipoObras.service';
import { TipoReclamosService,TipoReclamo} from '../../services/tipoReclamo.service';
import { NivelSatisfaccionService,NivelReclamo} from '../../services/nivelSatisfaccion.service';
import { EstadoReclamoService,EstadoReclamo} from '../../services/estadoReclamo.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-administradorSistemaInit',
  standalone: true,
  imports: [CommonModule,FormsModule, MatSnackBarModule],
  templateUrl: './administradorSistemaInit.component.html',
  styleUrls: ['./administradorSistemaInit.component.scss']
})
export class AdministradorSistemaInitComponent implements OnInit {

  titulo: string = 'Panel de Administración del Sistema';
  mostrarSubBotonReclamos: boolean = false;
  mostrarSubBotonObras: boolean=false;
  mostrarSubBotonUsuario: boolean=false;
  mostrarCargaDeUsuario: boolean=false;
  modoEdicion: boolean = false;
  mostrarDatosEdicion:boolean=false;


  //obras

  tipoObra: string='';
  estadoObra: string='';
  errorObras: string='';
  tipoObrasSugeridos: TipoObra[] = [];
  tipoObraSeleccionado: TipoObra | null = null;
  estadoObrasSugeridos: TipoObra[] = [];
  estadoObraSeleccionado: TipoObra | null = null;
    administrarObra:boolean=false;
    modoEdicionTipoObra:boolean=false;
    modoEliminarTipoObra:boolean=false;

  //RECLAMOS
  administrarReclamo: boolean=false;
  modoEdicionReclamo: boolean=false;
  modoEliminarReclamo:boolean=false;
  nivelReclamo:string='';
  tipoReclamo:string='';
  estadoReclamo:string='';
  errorReclamos:string ='';
  nivelReclamosSugeridos: NivelReclamo[] = [];
  tipoReclamosSugeridos: TipoReclamo[] = [];
  estadoReclamosSugeridos: EstadoReclamo[] = [];
  nivelReclamoSeleccionado: NivelReclamo | null = null;
  tipoReclamoSeleccionado: TipoReclamo | null = null;
  estadoReclamoSeleccionado: EstadoReclamo | null = null;


  roles: Rol[] = [];
  estados: Estado[] = [];
  nombre_usuario: string = '';
  email: string = '';
  rolSeleccionadoId: number | null = null;
  estadoSeleccionadoId: number | null = null;
  error: string='';
  error_nombre: string ='';
  error_mail:string='';
  error_estado:string='';
  error_rol:string=''
usuariosSugeridos: Usuario[] = [];
usuarioSeleccionado: Usuario | null = null;


  constructor(private rolesService: RolesService,private estadoUsuario: EstadoUsuarioService
  ,private usersService:UsersService,private snackBar: MatSnackBar, private estadoObraService:EstadoObrasService,
  private tipoObraService: TipoObrasService,private nivelReclamoService: NivelSatisfaccionService,
  private tipoReclamoService:TipoReclamosService,private estadoReclamoService: EstadoReclamoService
  ,private router: Router) {}

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
    this.modoEdicion=false;
    this.administrarObra=false;
    this.modoEdicionTipoObra=false;
     this.modoEliminarTipoObra=false;
      this.administrarReclamo=false;
        this.modoEdicionReclamo=false;
        this.modoEliminarReclamo=false;
        this.mostrarDatosEdicion=false;

        this.limpiarStrings();


    if(this.mostrarCargaDeUsuario){
      this.cargarDatosAltaCliente();
    }


  }

cargarDatosAltaCliente(): void {
  this.rolesService.obtenerRoles().subscribe({
    next: (data: Rol[]) => {
      this.roles = data;
      console.log('Roles cargados:', this.roles);
    },
    error: (err) => {
      console.error('Error al cargar roles:', err);
    }
  });

  this.estadoUsuario.obtenerEstados().subscribe({
     next: (data: Estado[]) => {
       this.estados = data;
       console.log('Estados cargados:', this.estados);
     },
     error: (err) => {
       console.error('Error al cargar estados:', err);
     }
   });
}
async crearUsuario() {
  this.error_nombre = '';
  this.error_mail = '';
  this.error_rol = '';
  this.error_estado = '';

  if (this.nombre_usuario.trim() === '') {
    this.error_nombre = 'Debe ingresar el nombre de usuario';
    return;
  }
   const existe = await this.validarSiExisteNombre(this.nombre_usuario);

    if (existe) {
      this.error_nombre = 'El nombre de usuario ya existe';
          return;
    }

  if (this.email.trim() === '') {
    this.error_mail = 'Debe ingresar un mail';
    return;
  }

  if (!this.esEmailValido(this.email)) {
    this.error_mail = 'El formato del email no es válido';
    return;
  }

  if (this.estadoSeleccionadoId == null) {
    this.error_estado = 'Debe ingresar un estado';
    return;
  }

  if (this.rolSeleccionadoId == null) {
    this.error_rol = 'Debe seleccionar un rol';
    return;
  }

  const usuario: Usuario = {
    nombre: this.nombre_usuario,
    email: this.email,
    estado: { id: this.estadoSeleccionadoId },
    rol: { id: this.rolSeleccionadoId }
  };

  this.usersService.crearUsuario(usuario).subscribe({
    next: res => {
      console.log('Usuario creado', res);
      this.snackBar.open('El usuario fue creado con éxito', '', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }).afterDismissed().subscribe(() => {
        this.nombre_usuario = '';
        this.email = '';
        this.estadoSeleccionadoId = null;
        this.rolSeleccionadoId = null;
      });
    },
    error: err => {
      console.error('Error', err);
    }
  });
}

esEmailValido(email: string): boolean {
  email = email.trim();

  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const empiezaConCaracterInvalido = /^[^a-zA-Z0-9]/.test(email);
  const terminaConCaracterInvalido = /[^a-zA-Z0-9]$/.test(email);
  const contieneDoblesPuntos = /\.\./.test(email);
  const contieneArrobaInvalida = /@.*@/.test(email);

  return (
    regexEmail.test(email) &&
    !empiezaConCaracterInvalido &&
    !terminaConCaracterInvalido &&
    !contieneDoblesPuntos &&
    !contieneArrobaInvalida
  );
}

validarSiExisteNombre(nombre: string): Promise<boolean> {
  return this.usersService.existeUsuario(nombre).toPromise()
    .then(res => res ?? false)
    .catch(err => {
      console.error('Error validando nombre de usuario:', err);
      return false;
    });
}

//SECCION EDICION


  MostrarModoEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
    this.mostrarCargaDeUsuario=false;
        this.administrarObra=false;
        this.modoEdicionTipoObra=false;
      this.modoEliminarTipoObra=false;
      this.administrarReclamo=false;
        this.modoEdicionReclamo=false;
        this.modoEliminarReclamo=false;

        this.limpiarStrings();
  }



buscarUsuarios(valor: string) {
  console.log("ingrese a buscar usuarios");
  if (this.modoEdicion && this.nombre_usuario.length>1) {
   this.usersService.buscarUsuariosPorNombre(valor).subscribe(
     usuarios => {
       console.log(usuarios); // aquí es un array de Usuario
this.usuariosSugeridos = Array.isArray(usuarios) ? usuarios : [];
console.log(this.usuariosSugeridos.length);
     },
     err => {
       console.error(err);
       this.usuariosSugeridos = [];
     }
   );
  } else {
    console.log("No encontre");
    this.usuariosSugeridos = [];
  }
}

seleccionarUsuario(usuario: Usuario) {
  this.mostrarDatosEdicion = true;


  setTimeout(() => {
    this.usuarioSeleccionado = usuario;
    this.nombre_usuario = usuario.nombre;
    this.email = usuario.email;
    this.usuariosSugeridos = [];
    this.asignarRolyEstadoEditar();
  }, 0);
}

asignarRolyEstadoEditar() {
  if (!this.usuarioSeleccionado) return;


  this.rolesService.obtenerRoles().subscribe({
    next: (roles: Rol[]) => {
      this.roles = roles;
      const rolEncontrado = this.roles.find(r => r.id === this.usuarioSeleccionado!.rol.id);
      this.rolSeleccionadoId = rolEncontrado ? rolEncontrado.id : null;
    },
    error: err => {
      console.error('Error al cargar roles:', err);
    }
  });

  this.estadoUsuario.obtenerEstados().subscribe({
    next: (estados: Estado[]) => {
      this.estados = estados;
      const estadoEncontrado = this.estados.find(e => e.id === this.usuarioSeleccionado!.estado.id);
      this.estadoSeleccionadoId = estadoEncontrado ? estadoEncontrado.id : null;
    },
    error: err => {
      console.error('Error al cargar estados:', err);
    }
  });
}

editarUsuario() {
  if (!this.usuarioSeleccionado) {
    this.snackBar.open('Debe seleccionar un usuario para editar', '', { duration: 3000 });
    return;
  }

  this.error_nombre = '';
  this.error_mail = '';
  this.error_rol = '';
  this.error_estado = '';

  if (this.nombre_usuario.trim() === '') {
    this.error_nombre = 'Debe ingresar el nombre de usuario';
    return;
  }

  if (this.email.trim() === '') {
    this.error_mail = 'Debe ingresar un mail';
    return;
  }

  if (!this.esEmailValido(this.email)) {
    this.error_mail = 'El formato del email no es válido';
    return;
  }

  if (this.estadoSeleccionadoId == null) {
    this.error_estado = 'Debe ingresar un estado';
    return;
  }

  if (this.rolSeleccionadoId == null) {
    this.error_rol = 'Debe seleccionar un rol';
    return;
  }

  const usuarioActualizado: Usuario = {
    contrasena: this.usuarioSeleccionado.contrasena,
    nombre: this.nombre_usuario,
    email: this.email,
    estado: { id: this.estadoSeleccionadoId },
    rol: { id: this.rolSeleccionadoId }
  };

  this.usersService.actualizarUsuario(this.usuarioSeleccionado.id as number, usuarioActualizado).subscribe({
    next: res => {
      if (res.success) {
        this.snackBar.open('Usuario actualizado con éxito', '', { duration: 3000 });

        this.usuarioSeleccionado = null;
        this.nombre_usuario = '';
        this.email = '';
        this.estadoSeleccionadoId = null;
        this.rolSeleccionadoId = null;
        this.mostrarDatosEdicion = false;
      } else {
        this.snackBar.open('No se pudo actualizar el usuario', '', { duration: 3000 });
      }
    },
    error: err => {
      console.error('Error al actualizar usuario:', err);
      this.snackBar.open('Error al actualizar usuario', '', { duration: 3000 });
    }
  });
}

//OBRAS
MostrarCrearValorObra(): void {

  this.modoEdicionTipoObra = false;
      this.modoEliminarTipoObra=false;
      this.errorObras='';
      this.mostrarCargaDeUsuario=false;
        this.modoEdicion = false;
       this.modoEliminarTipoObra=false;

         this.administrarReclamo=false;
           this.modoEdicionReclamo=false;
           this.modoEliminarReclamo=false;
           this.limpiarStrings();
    setTimeout(() => {
  this.administrarObra = !this.administrarObra;

         },50);

}

async  crearValoresObra(){
console.log("voy a crear valores para obras");

  this.errorObras='';
if(this.tipoObra==='' && this.estadoObra===''){

   this.errorObras='Debe por lo menos ingresar algun valor para crear';
   return;
}
if(this.estadoObra!==''){


   const existe = await this.validarSiExisteEstadoObra(this.estadoObra);

    if (existe) {
      this.errorObras = 'El estado obra ingresado ya existe';
          return;
    }

 const estadoObra: EstadoObra = {
       descripcion: this.estadoObra
     };

     this.estadoObraService.crearEstadoObra(estadoObra).subscribe({
       next: res => {
         console.log('Respuesta del backend:', res);
         this.snackBar.open('Estado de obra creado con éxito', '', { duration: 3000 });

         // Limpiar campos
         this.estadoObra = '';
         this.errorObras = '';
       },
       error: err => {
         console.error('Error al crear estado de obra:', err);
         this.snackBar.open('Error al crear estado de obra', '', { duration: 3000 });
       }
     });
}

if(this.tipoObra!==''){


   const existe = await this.validarSiExisteTipoObra(this.tipoObra);

    if (existe) {
      this.errorObras = 'El tipo obra ingresado ya existe';
          return;
    }


   const tipoObra: TipoObra = {
         descripcion: this.tipoObra
       };

       this.tipoObraService.crearTipoObra(tipoObra).subscribe({
         next: res => {
           console.log('Respuesta del backend:', res);
           this.snackBar.open('Tipo de obra creado con éxito', '', { duration: 6000 });

           // Limpiar campos
           this.tipoObra = '';
           this.errorObras = '';
         },
         error: err => {
           console.error('Error al crear tipo de obra:', err);
           this.snackBar.open('Error al crear tipo de obra', '', { duration: 3000 });
         }
       });

}
 return
}

validarSiExisteEstadoObra(descripcion: string): Promise<boolean> {
  return this.estadoObraService.existeEstadoObra(descripcion).toPromise()
    .then(res => res ?? false)
    .catch(err => {
      console.error('Error validando estado obra:', err);
      return false;
    });
}

validarSiExisteTipoObra(descripcion: string): Promise<boolean> {
  return this.tipoObraService.existeTipoObra(descripcion).toPromise()
    .then(res => res ?? false)
    .catch(err => {
      console.error('Error validando tipo obra:', err);
      return false;
    });
}

buscarTipoObras(valor: string) {
  if ((this.modoEdicionTipoObra || this.modoEliminarTipoObra) && this.tipoObra.length>1) {
   this.tipoObraService.buscarTipoObraPorDescripcion(valor).subscribe(
     tipoObras => {
       console.log(tipoObras); // aquí es un array de Usuario
this.tipoObrasSugeridos = Array.isArray(tipoObras) ? tipoObras : [];
console.log(this.tipoObrasSugeridos.length);
     },
     err => {
       console.error(err);
       this.tipoObrasSugeridos = [];
     }
   );
  } else {
    console.log("No encontre");
    this.tipoObrasSugeridos = [];
  }
}



seleccionarTipoObra(tipoObra: TipoObra) {
  setTimeout(() => {
    this.tipoObraSeleccionado = tipoObra;
    this.tipoObra = tipoObra.descripcion;
    this.tipoObrasSugeridos = [];
    console.log(this.tipoObraSeleccionado);
  }, 0);
}

  MostrarEditarTipoObras(): void {
  this.administrarObra=false;
      this.modoEliminarTipoObra=false;
      this.modoEliminarTipoObra=false;
      this.errorObras='';
          this.mostrarCargaDeUsuario=false;
                this.modoEdicion = false;

            this.administrarReclamo=false;
              this.modoEdicionReclamo=false;
              this.modoEliminarReclamo=false;
              this.limpiarStrings();
   setTimeout(() => {

    this.modoEdicionTipoObra = !this.modoEdicionTipoObra;


},100);

  }

  actualizarValoresObras():void{
     if(this.tipoObra==='' && this.estadoObra===''){

        this.errorObras='Debe por lo menos ingresar algun valor para editar';
        return;
     }


     if(this.tipoObra!==''){

           if (!this.tipoObraSeleccionado){
             this.errorObras='Seleccione un tipo de obra';

                return;

           }

          const tipoObraActualizada: TipoObra = {
                descripcion:this.tipoObra
           }
         this.tipoObraService.actualizarTipoObra(this.tipoObraSeleccionado.id as number, tipoObraActualizada).subscribe({
           next: res => {
             if (res.success) {
               this.snackBar.open('valores actualizados con éxito', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });

               this.tipoObraSeleccionado = null;
               this.tipoObra = '';
               this.modoEdicionTipoObra = false;
             } else {
               this.snackBar.open('No se pudo actualizar valores', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });
             }
           },
           error: err => {
             console.error('Error al tipo obra:', err);
             this.snackBar.open('Error al actualizar valores', '', {
               duration: 3000,
               horizontalPosition: 'end',
               verticalPosition: 'top'
             });
           }
         });


  }
  if(this.estadoObra!==''){

        if (!this.estadoObraSeleccionado){
               this.errorObras='Seleccione un estado de obra';

                  return;

             }
     const estadoObraActualizada: EstadoObra = {
                  descripcion:this.estadoObra
             }
          if(this.estadoObraSeleccionado===null){

          }

           this.estadoObraService.actualizarEstadoObra(this.estadoObraSeleccionado.id as number, estadoObraActualizada).subscribe({
             next: res => {
               if (res.success) {
                 this.snackBar.open('valores actualizados con éxito', '', {
                   duration: 3000,
                   horizontalPosition: 'end',
                   verticalPosition: 'top'
                 });

                 this.estadoObraSeleccionado = null;
                 this.estadoObra = '';
                 this.modoEdicionTipoObra = false;
               } else {
                 this.snackBar.open('No se pudo actualizar los valores', '', {
                   duration: 3000,
                   horizontalPosition: 'end',
                   verticalPosition: 'top'
                 });
               }
             },
             error: err => {
               console.error('Error al estado obra:', err);
               this.snackBar.open('Error al actualizar valores', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });
             }
           });


  }
}

buscarEstadoObras(valor: string) {

  if ((this.modoEdicionTipoObra || this.modoEliminarTipoObra) && this.estadoObra.length>1) {
   this.estadoObraService.buscarEstadoObraPorDescripcion(valor).subscribe(
     estadoObras => {
       console.log(estadoObras); // aquí es un array de Usuario
    this.estadoObrasSugeridos = Array.isArray(estadoObras) ? estadoObras : [];
console.log(this.estadoObrasSugeridos.length);
     },
     err => {
       console.error(err);
       this.estadoObrasSugeridos = [];
     }
   );
  } else {
    console.log("No encontre");
    this.estadoObrasSugeridos = [];
  }
}



seleccionarEstadoObra(estadoObra: EstadoObra) {
  setTimeout(() => {
    this.estadoObraSeleccionado = estadoObra;
    this.estadoObra = estadoObra.descripcion;
    this.estadoObrasSugeridos = [];
    console.log(this.estadoObraSeleccionado);
  }, 0);
}

mostrarEliminarValoresObra(){

 this.modoEliminarTipoObra=false;
 this.modoEdicionTipoObra=false;
  this.administrarObra=false;
  this.mostrarCargaDeUsuario=false;
  this.modoEdicion = false;

    this.administrarReclamo=false;
      this.modoEdicionReclamo=false;
      this.modoEliminarReclamo=false;
      this.limpiarStrings();
 setTimeout(() => {
 this.modoEliminarTipoObra=!this.modoEliminarTipoObra;


},100);
}

eliminarValoresObra(){

    if(this.estadoObra==='' && this.tipoObra===''){

        this.errorObras='Debe por lo menos ingresar algun valor para eliminar';
               return;

    }

     if(this.estadoObra!=''){

        if(this.estadoObraSeleccionado==null){
             this.errorObras='Debe seleccionar un estado obra';
                            return;

        }

         this.estadoObraService.eliminarEstadoObra(this.estadoObraSeleccionado.id as number).subscribe({
           next: (res: any) => {
             if (res.success) {
               this.snackBar.open('valores eliminados con éxito', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });

               this.estadoObraSeleccionado = null;
               this.estadoObra = '';
               this.modoEdicionTipoObra = false;
             } else {
               this.snackBar.open('No se pudo eliminar valores', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });
             }
           },
           error: (err: any) => {
             console.error('Error al eliminar estado obra', err);
             this.snackBar.open('Error al eliminar valores', '', {
               duration: 3000,
               horizontalPosition: 'end',
               verticalPosition: 'top'
             });
           }
         });


    }

    if(this.tipoObra!=''){
                 if(this.tipoObraSeleccionado==null){
                          this.errorObras='Debe seleccionar un tipo obra';
                                         return;

                     }

             this.tipoObraService.eliminarTipoObra(this.tipoObraSeleccionado.id as number).subscribe({
               next: (res: any) => {
                 if (res.success) {
                   this.snackBar.open('valores eliminados con éxito', '', {
                     duration: 3000,
                     horizontalPosition: 'end',
                     verticalPosition: 'top'
                   });

                   this.tipoObraSeleccionado = null;
                   this.tipoObra = '';
                   this.modoEdicionTipoObra = false;
                 } else {
                   this.snackBar.open('No se pudo eliminar valores', '', {
                     duration: 3000,
                     horizontalPosition: 'end',
                     verticalPosition: 'top'
                   });
                 }
               },
               error: (err: any) => {
                 console.error('Error al eliminar tipo obra', err);
                 this.snackBar.open('Error al eliminar valores', '', {
                   duration: 3000,
                   horizontalPosition: 'end',
                   verticalPosition: 'top'
                 });
               }
             });
}
}

//RECLAMOS
cambiarAmodoAdministrarReclamo(){

 this.modoEdicionReclamo=false;
 this.modoEliminarReclamo=false;

   this.administrarObra=false;
   this.modoEdicionTipoObra=false;
   this.modoEliminarTipoObra=false;

    this.mostrarCargaDeUsuario=false;
      this.modoEdicion= false;
      this.limpiarStrings();

      setTimeout(() => {
       this.administrarReclamo=!this.administrarReclamo;

               },100);


}
cambiarAmodoEditarReclamo(){
 this.modoEliminarReclamo=false;
 this.administrarReclamo=false;

   this.administrarObra=false;
   this.modoEdicionTipoObra=false;
   this.modoEliminarTipoObra=false;

      this.mostrarCargaDeUsuario=false;
      this.modoEdicion = false;
      this.limpiarStrings();

      setTimeout(() => {
 this.modoEdicionReclamo=!this.modoEdicionReclamo;

                     },100);


}
cambiarAmodoEliminarReclamo(){
 this.administrarReclamo=false;
 this.modoEdicionReclamo=false;

   this.administrarObra=false;
   this.modoEdicionTipoObra=false;
   this.modoEliminarTipoObra=false;

      this.mostrarCargaDeUsuario=false;
      this.modoEdicion = false;
      this.limpiarStrings();
          setTimeout(() => {
 this.modoEliminarReclamo=!this.modoEliminarReclamo;

                           },100);


}


async  crearValoresReclamo(){
console.log("voy a crear valores para reclamos");

  this.errorReclamos='';
if(this.tipoReclamo==='' && this.estadoReclamo==='' && this.nivelReclamo===''){

   this.errorReclamos='Debe por lo menos ingresar algun valor para crear';
   return;
}
if(this.estadoReclamo!==''){


   const existe = await this.validarSiExisteEstadoReclamo(this.estadoReclamo);

    if (existe) {
      this.errorReclamos = 'El estado reclamo ingresado ya existe';
          return;
    }

 const estadoReclamo: EstadoReclamo = {
       descripcion: this.estadoReclamo
     };

     this.estadoReclamoService.crearEstadoReclamo(estadoReclamo).subscribe({
       next: res => {
         console.log('Respuesta del backend:', res);
         this.snackBar.open('Estado de reclamo creado con éxito', '', { duration: 3000 });

         // Limpiar campos
         this.estadoReclamo = '';
         this.errorReclamos = '';
       },
       error: err => {
         console.error('Error al crear estado de reclamo:', err);
         this.snackBar.open('Error al crear estado de reclamo', '', { duration: 3000 });
       }
     });
}

if(this.tipoReclamo!==''){


   const existe = await this.validarSiExisteTipoReclamo(this.tipoReclamo);

    if (existe) {
      this.errorReclamos = 'El tipo reclamo ingresado ya existe';
          return;
    }


   const tipoReclamo: TipoReclamo = {
         descripcion: this.tipoReclamo
       };

       this.tipoReclamoService.crearTipoReclamo(tipoReclamo).subscribe({
         next: res => {
           console.log('Respuesta del backend:', res);
           this.snackBar.open('Tipo de reclamo creado con éxito', '', { duration: 3000 });

           // Limpiar campos
           this.tipoReclamo = '';
           this.errorReclamos = '';
         },
         error: err => {
           console.error('Error al crear tipo de reclamo:', err);
           this.snackBar.open('Error al crear tipo de reclamo', '', { duration: 3000 });
         }
       });

}

if(this.nivelReclamo!==''){


   const existe = await this.validarSiExisteNivelReclamo(this.nivelReclamo);

    if (existe) {
      this.errorReclamos = 'El tipo nivel de satisfaccion ingresado ya existe';
          return;
    }


   const nivelReclamo: NivelReclamo = {
         descripcion: this.nivelReclamo
       };

       this.nivelReclamoService.crearTipoNivel(nivelReclamo).subscribe({
         next: res => {
           console.log('Respuesta del backend:', res);
           this.snackBar.open('Tipo de nivel de satisfaccion creado con éxito', '', { duration: 3000 });

           // Limpiar campos
           this.nivelReclamo = '';
           this.errorReclamos = '';
         },
         error: err => {
           console.error('Error al crear nivel de satisfaccion de reclamo:', err);
           this.snackBar.open('Error al crear nivel de satisfaccion de reclamo', '', { duration: 3000 });
         }
       });

}

 return
}

validarSiExisteEstadoReclamo(descripcion: string): Promise<boolean> {
  return this.estadoReclamoService.existeEstadoReclamo(descripcion).toPromise()
    .then(res => res ?? false)
    .catch(err => {
      console.error('Error validando estado reclamo:', err);
      return false;
    });
}

validarSiExisteTipoReclamo(descripcion: string): Promise<boolean> {
  return this.tipoReclamoService.existeTipoReclamo(descripcion).toPromise()
    .then(res => res ?? false)
    .catch(err => {
      console.error('Error validando tipo reclamo:', err);
      return false;
    });
}

validarSiExisteNivelReclamo(descripcion: string): Promise<boolean> {
  return this.nivelReclamoService.existeTipoNivel(descripcion).toPromise()
    .then(res => res ?? false)
    .catch(err => {
      console.error('Error validando nivel reclamo:', err);
      return false;
    });
}


  actualizarValoresReclamo():void{
     if(this.tipoReclamo==='' && this.estadoReclamo==='' && this.nivelReclamo===''){

        this.errorReclamos='Debe por lo menos ingresar algun valor para editar';
        return;
     }


     if(this.tipoReclamo!==''){

           if (!this.tipoReclamoSeleccionado){
             this.errorObras='Seleccione un tipo de reclamo';

                return;

           }

          const tipoReclamoActualizado: TipoReclamo = {
                descripcion:this.tipoReclamo
           }
         this.tipoReclamoService.actualizarTipoReclamo(this.tipoReclamoSeleccionado.id as number, tipoReclamoActualizado).subscribe({
           next: res => {
             if (res.success) {
               this.snackBar.open('valores actualizados con éxito', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });

               this.tipoReclamoSeleccionado = null;
               this.tipoReclamo = '';
             } else {
               this.snackBar.open('No se pudo actualizar valores', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });
             }
           },
           error: err => {
             this.snackBar.open('Error al actualizar valores', '', {
               duration: 3000,
               horizontalPosition: 'end',
               verticalPosition: 'top'
             });
           }
         });


  }
  if(this.estadoReclamo!==''){

        if (!this.estadoReclamoSeleccionado){
               this.errorReclamos='Seleccione un estado de reclamo';

                  return;

             }
     const estadoReclamoActualizado: EstadoReclamo = {
                  descripcion:this.estadoReclamo
             }


           this.estadoReclamoService.actualizarEstadoReclamo(this.estadoReclamoSeleccionado.id as number, estadoReclamoActualizado).subscribe({
             next: res => {
               if (res.success) {
                 this.snackBar.open('valores actualizados con éxito', '', {
                   duration: 3000,
                   horizontalPosition: 'end',
                   verticalPosition: 'top'
                 });

                 this.estadoReclamoSeleccionado = null;
                 this.estadoReclamo = '';
               } else {
                 this.snackBar.open('No se pudo actualizar los valores', '', {
                   duration: 3000,
                   horizontalPosition: 'end',
                   verticalPosition: 'top'
                 });
               }
             },
             error: err => {
               this.snackBar.open('Error al actualizar valores', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });
             }
           });


  }

    if(this.nivelReclamo!==''){

          if (!this.nivelReclamoSeleccionado){
                 this.errorReclamos='Seleccione un nivel de satisfaccion de reclamo';

                    return;

               }
       const nivelReclamoActualizado: NivelReclamo = {
                    descripcion:this.nivelReclamo
               }


             this.nivelReclamoService.actualizarNivelReclamo(this.nivelReclamoSeleccionado.id as number, nivelReclamoActualizado).subscribe({
               next: res => {
                 if (res.success) {
                   this.snackBar.open('valores actualizados con éxito', '', {
                     duration: 3000,
                     horizontalPosition: 'end',
                     verticalPosition: 'top'
                   });

                   this.nivelReclamoSeleccionado = null;
                   this.nivelReclamo = '';
                 } else {
                   this.snackBar.open('No se pudo actualizar los valores', '', {
                     duration: 3000,
                     horizontalPosition: 'end',
                     verticalPosition: 'top'
                   });
                 }
               },
               error: err => {
                 this.snackBar.open('Error al actualizar valores', '', {
                   duration: 3000,
                   horizontalPosition: 'end',
                   verticalPosition: 'top'
                 });
               }
             });


    }
}



seleccionarNivelReclamo(nivelReclamo: NivelReclamo) {
  setTimeout(() => {
      this.nivelReclamoSeleccionado = nivelReclamo;
      this.nivelReclamo = nivelReclamo.descripcion;
      this.nivelReclamosSugeridos = [];
      console.log(this.nivelReclamoSeleccionado);
    }, 0);
}
seleccionarTipoReclamo(tipoReclamo: TipoReclamo){
 setTimeout(() => {
     this.tipoReclamoSeleccionado = tipoReclamo;
     this.tipoReclamo = tipoReclamo.descripcion;
     this.tipoReclamosSugeridos = [];
     console.log(this.tipoReclamoSeleccionado);
   }, 0);
}

seleccionarEstadoReclamo(estadoReclamo:EstadoReclamo){
  setTimeout(() => {
      this.estadoReclamoSeleccionado = estadoReclamo;
      this.estadoReclamo = estadoReclamo.descripcion;
      this.estadoReclamosSugeridos = [];
      console.log(this.estadoReclamoSeleccionado);
    }, 0);
}

buscarNivelReclamos(nivelReclamo:string){
    if ((this.modoEdicionReclamo || this.modoEliminarReclamo) && this.nivelReclamo.length>1) {
      this.nivelReclamoService.buscarNivelReclamoPorDescripcion(nivelReclamo).subscribe(
        nivelReclamos => {
          console.log(nivelReclamos); // aquí es un array de Usuario
       this.nivelReclamosSugeridos = Array.isArray(nivelReclamos) ? nivelReclamos : [];
   console.log(this.nivelReclamosSugeridos.length);
        },
        err => {
          console.error(err);
          this.nivelReclamosSugeridos = [];
        }
      );
     } else {
       console.log("No encontre");
       this.nivelReclamosSugeridos = [];
     }
}
buscarTipoReclamos(tipoReclamo:string){
   if ((this.modoEdicionReclamo || this.modoEliminarReclamo) && this.tipoReclamo.length>1) {
     this.tipoReclamoService.buscarTipoReclamoPorDescripcion(tipoReclamo).subscribe(
       tipoReclamos => {
         console.log(tipoReclamos); // aquí es un array de Usuario
      this.tipoReclamosSugeridos = Array.isArray(tipoReclamos) ? tipoReclamos : [];
  console.log(this.tipoReclamosSugeridos.length);
       },
       err => {
         console.error(err);
         this.tipoReclamosSugeridos = [];
       }
     );
    } else {
      console.log("No encontre");
      this.tipoReclamosSugeridos = [];
    }
}
buscarEstadoReclamos(estadoReclamo:string){
   if ((this.modoEdicionReclamo || this.modoEliminarReclamo) && this.estadoReclamo.length>1) {
     this.estadoReclamoService.buscarEstadoReclamoPorDescripcion(estadoReclamo).subscribe(
       estadoReclamos => {
         console.log(estadoReclamos); // aquí es un array de Usuario
      this.estadoReclamosSugeridos = Array.isArray(estadoReclamos) ? estadoReclamos : [];
  console.log(this.estadoReclamosSugeridos.length);
       },
       err => {
         console.error(err);
         this.estadoReclamosSugeridos = [];
       }
     );
    } else {
      console.log("No encontre");
      this.estadoReclamosSugeridos = [];
    }
}


eliminarValoresReclamo(){

    if(this.estadoReclamo==='' && this.tipoReclamo==='' && this.nivelReclamo===''){

        this.errorReclamos='Debe por lo menos ingresar algun valor para eliminar';
               return;

    }

     if(this.estadoReclamo!=''){

        if(this.estadoReclamoSeleccionado==null){
             this.errorReclamos='Debe seleccionar un estado reclamo';
                            return;

        }

         this.estadoReclamoService.eliminarEstadoReclamo(this.estadoReclamoSeleccionado.id as number).subscribe({
           next: (res: any) => {
             if (res.success) {
               this.snackBar.open('valores eliminados con éxito', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });

               this.estadoReclamoSeleccionado = null;
               this.estadoReclamo = '';
             } else {
               this.snackBar.open('No se pudo eliminar valores', '', {
                 duration: 3000,
                 horizontalPosition: 'end',
                 verticalPosition: 'top'
               });
             }
           },
           error: (err: any) => {
             this.snackBar.open('Error al eliminar valores', '', {
               duration: 3000,
               horizontalPosition: 'end',
               verticalPosition: 'top'
             });
           }
         });


    }

     if(this.tipoReclamo!=''){

            if(this.tipoReclamoSeleccionado==null){
                 this.errorReclamos='Debe seleccionar un tipo reclamo';
                                return;

            }

             this.tipoReclamoService.eliminarTipoReclamo(this.tipoReclamoSeleccionado.id as number).subscribe({
               next: (res: any) => {
                 if (res.success) {
                   this.snackBar.open('valores eliminados con éxito', '', {
                     duration: 3000,
                     horizontalPosition: 'end',
                     verticalPosition: 'top'
                   });

                   this.tipoReclamoSeleccionado = null;
                   this.tipoReclamo = '';
                 } else {
                   this.snackBar.open('No se pudo eliminar valores', '', {
                     duration: 3000,
                     horizontalPosition: 'end',
                     verticalPosition: 'top'
                   });
                 }
               },
               error: (err: any) => {
                 this.snackBar.open('Error al eliminar valores', '', {
                   duration: 3000,
                   horizontalPosition: 'end',
                   verticalPosition: 'top'
                 });
               }
             });


        }

             if(this.nivelReclamo!=''){

                    if(this.nivelReclamoSeleccionado==null){
                         this.errorReclamos='Debe seleccionar un nivel de satisfaccion reclamo';
                                        return;

                    }

                     this.nivelReclamoService.eliminarNivelReclamo(this.nivelReclamoSeleccionado.id as number).subscribe({
                       next: (res: any) => {
                         if (res.success) {
                           this.snackBar.open('valores eliminados con éxito', '', {
                             duration: 3000,
                             horizontalPosition: 'end',
                             verticalPosition: 'top'
                           });

                           this.nivelReclamoSeleccionado = null;
                           this.nivelReclamo = '';
                         } else {
                           this.snackBar.open('No se pudo eliminar valores', '', {
                             duration: 3000,
                             horizontalPosition: 'end',
                             verticalPosition: 'top'
                           });
                         }
                       },
                       error: (err: any) => {
                         this.snackBar.open('Error al eliminar valores', '', {
                           duration: 3000,
                           horizontalPosition: 'end',
                           verticalPosition: 'top'
                         });
                       }
                     });


                }

}

limpiarStrings(): void {
  this.titulo = '';
  this.tipoObra = '';
  this.estadoObra = '';
  this.errorObras = '';
  this.nivelReclamo = '';
  this.tipoReclamo = '';
  this.estadoReclamo = '';
  this.errorReclamos = '';
  this.nombre_usuario = '';
  this.email = '';
  this.error = '';
  this.error_nombre = '';
  this.error_mail = '';
  this.error_estado = '';
  this.error_rol = '';


}

volverAlLogin(){
this.router.navigate(['./login']);

}

}
