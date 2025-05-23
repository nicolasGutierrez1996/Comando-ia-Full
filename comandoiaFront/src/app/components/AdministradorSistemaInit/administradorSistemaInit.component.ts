import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService, Rol } from '../../services/roles.service';
import { EstadoUsuarioService, Estado } from '../../services/estadoUsuario.service';
import { UsersService,Usuario} from '../../services/users.service';
import { EstadoObrasService,EstadoObra} from '../../services/estadoObras.service';
import { TipoObrasService,TipoObra} from '../../services/tipoObras.service';
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
  administrarObra: boolean=false;
  modoEdicionTipoObra: boolean=false;
  modoEliminarTipoObra: boolean=false;
  tipoObra: string='';
  estadoObra: string='';
  errorObras: string='';
  tipoObrasSugeridos: TipoObra[] = [];
  tipoObraSeleccionado: TipoObra | null = null;
  estadoObrasSugeridos: TipoObra[] = [];
  estadoObraSeleccionado: TipoObra | null = null;

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
  private tipoObraService: TipoObrasService) {}

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
  console.log("click administrar obra");
  this.administrarObra = !this.administrarObra;
    this.modoEdicionTipoObra = false;
    this.modoEliminarTipoObra
    this.errorObras='';
    this.mostrarCargaDeUsuario=false;
      this.modoEdicion = false;
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
    this.modoEliminarTipoObra
    this.modoEdicionTipoObra = !this.modoEdicionTipoObra;
    this.errorObras='';
    this.mostrarCargaDeUsuario=false;
          this.modoEdicion = false;

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
 console.log("mostrar valores eliminar");
 this.modoEliminarTipoObra=!this.modoEliminarTipoObra;
 this.modoEdicionTipoObra=false;
 this.administrarObra=false;
 this.mostrarCargaDeUsuario=false;
 this.modoEdicion = false;

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
}
