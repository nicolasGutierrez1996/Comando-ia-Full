import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService, Rol } from '../../services/roles.service';
import { EstadoUsuarioService, Estado } from '../../services/estadoUsuario.service';
import { UsersService,Usuario} from '../../services/users.service';
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
  ,private usersService:UsersService,private snackBar: MatSnackBar) {}

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
    .then(res => res ?? false) // Si res es undefined, devuelve false
    .catch(err => {
      console.error('Error validando nombre de usuario:', err);
      return false; // Por defecto, asumimos que no existe si hay error
    });
}

//SECCION EDICION


  MostrarModoEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
    this.mostrarCargaDeUsuario=false;
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



}
