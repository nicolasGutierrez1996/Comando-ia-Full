import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReclamosService,Reclamo} from '../../services/reclamos.service';
import { TipoReclamosService,TipoReclamo} from '../../services/tipoReclamo.service';
import { NivelSatisfaccionService,NivelReclamo} from '../../services/nivelSatisfaccion.service';
import { EstadoReclamoService,EstadoReclamo} from '../../services/estadoReclamo.service';
import { TipoObrasService,TipoObra} from '../../services/tipoObras.service';
import { EstadoObrasService,EstadoObra} from '../../services/estadoObras.service';





@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule,FormsModule, MatSnackBarModule],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.css'
})
export class AdministradorComponent {

selectedFile: File | null = null;

//RECLAMOS
  estadosReclamo: EstadoReclamo[] = [];
  tiposReclamo: TipoReclamo[] = [];
  nivelesReclamo: NivelReclamo[] = [];
mostrarSubBotonReclamos: boolean=false;
mostrarSubBotonObras:boolean=false;
mostrarCrearReclamo:boolean=false;
mostrarEditarReclamo:boolean=false;
mostrarAdjuntarExcel:boolean=false;
mostrarDatosEdicion:boolean=false;
nombreReclamo: string='';
tipoReclamo: string='';
fechaReclamo: string = '';
estadoReclamo:string='';
localidad:string='';
barrio:string='';
calle:string='';
nroCalle: number | null = null;
tiempoResolucion: number | null = null;
satisfaccion:string='';
descripcion:string='';
mensajeErrorReclamo:string='';
estadoReclamoSeleccionadoId: number | null = null;
tipoReclamoSeleccionadoId: number | null = null;
nivelReclamoSeleccionadoId: number | null = null;
reclamosSugeridos: Reclamo[] = [];
reclamoSeleccionado:Reclamo | null = null;;

//OBRAS
mostrarCrearObra:boolean=false;
mostrarEditarObra:boolean=false;
mostrarAdjuntarExcelObra:boolean=false;
mostrarDatosEdicionObra:boolean=false;
estadosObra:EstadoObra[]= [];
estadoObraSeleccionadoId:number | null = null;
tiposObra:TipoObra[]= [];
tipoObraSeleccionadoId:number | null = null;
nombreObra:string='';
fechaInicioObra:string='';
fechaFinEstimada:string='';
avanceFisico:number | null = null;
montoPresupuestado:number | null = null;
montoEjecutado:number | null = null;
fechaFinReal:string='';
localidadObra:string='';
barrioObra:string='';
calleObra:string='';
nroCalleObra:number | null = null;
descripcionObra:string='';


  constructor(private snackBar: MatSnackBar
  ,private router: Router, private reclamosService:ReclamosService,private nivelReclamoService: NivelSatisfaccionService,
   private tipoReclamoService:TipoReclamosService,private estadoReclamoService: EstadoReclamoService,
   private tipoObrasService:TipoObrasService, private estadoObrasService:EstadoObrasService) {}


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

onUpload(): void {
  if (!this.selectedFile) return;

  const formData = new FormData();
  formData.append('file', this.selectedFile); // 'file' debe coincidir con @RequestParam("file") en el backend

  this.reclamosService.importarDesdeExcel(formData).subscribe({
    next: (res) => {
      console.log('Archivo subido correctamente:', res);
      this.snackBar.open('Archivo subido correctamente', 'Cerrar', { duration: 3000 });
    },
    error: (err) => {
      console.error('Error al subir el archivo:', err);
      this.snackBar.open('Error al subir el archivo', 'Cerrar', { duration: 3000 });
    }
  });
}

volverAlLogin(){
this.router.navigate(['./login']);

}
  MostrarSubBotonesReclamo(): void {
    this.mostrarSubBotonReclamos = !this.mostrarSubBotonReclamos;
  }

  MostrarSubBotonesObras(): void {
    this.mostrarSubBotonObras = !this.mostrarSubBotonObras;
  }

 MostrarCrearReclamo() {
   this.mostrarCrearReclamo = !this.mostrarCrearReclamo;
   this.mostrarEditarReclamo = false;
   this.mostrarAdjuntarExcel = false;
   this.mostrarDatosEdicion = false;

   // Cargar selects
   this.CargarDatosReclamo();

   // Resetear campos
   const hoy = new Date();
   this.fechaReclamo = this.convertirFechaAInputDate(hoy);

   this.nombreReclamo = '';
   this.descripcion = '';
   this.tipoReclamo = '';
   this.tipoReclamoSeleccionadoId = 1;
   this.estadoReclamoSeleccionadoId = 1;
   this.tiempoResolucion = null;
   this.nivelReclamoSeleccionadoId = 1;
   this.localidad = '';
   this.barrio = '';
   this.calle = '';
   this.nroCalle = null;

   // Importante: limpiar mensaje y objeto seleccionado
   this.mensajeErrorReclamo = '';
   this.reclamoSeleccionado = null;
 }

  MostrarEditarReclamo(){
    this.mostrarEditarReclamo=!this.mostrarEditarReclamo;
    this.mostrarAdjuntarExcel=false;
    this.mostrarCrearReclamo=false;

            this.nombreReclamo = '';
            this.descripcion = '';
            const hoy = new Date();
             this.fechaReclamo = this.convertirFechaAInputDate(hoy);        this.tipoReclamoSeleccionadoId = null;
            this.estadoReclamoSeleccionadoId=null;
            this.tiempoResolucion=null;
            this.nivelReclamoSeleccionadoId=null;
            this.localidad='';
            this.barrio='';
            this.calle='';
            this.nroCalle=null;


            this.mostrarDatosEdicion = false;
  }
MostrarAdjuntarExcel(){
this.mostrarAdjuntarExcel=!this.mostrarAdjuntarExcel;
this.mostrarEditarReclamo=false;
this.mostrarCrearReclamo=false;



}

CargarDatosReclamo(){
  this.estadoReclamoService.obtenerEstadosReclamo().subscribe({
     next: (data: EstadoReclamo[]) => {
       this.estadosReclamo = data;
       console.log('estados reclamos cargados:', this.estadosReclamo);
     },
     error: (err) => {
       console.error('Error al cargar estados reclamos:', err);
     }
   });

     this.tipoReclamoService.obtenerTiposReclamo().subscribe({
        next: (data: TipoReclamo[]) => {
          this.tiposReclamo = data;
          console.log('tipos reclamos cargados:', this.tiposReclamo);
        },
        error: (err) => {
          console.error('Error al cargar tipos reclamos:', err);
        }
      });

           this.nivelReclamoService.obtenerNivelesReclamo().subscribe({
              next: (data: NivelReclamo[]) => {
                this.nivelesReclamo = data;
                console.log('niveles reclamos cargados:', this.nivelesReclamo);
              },
              error: (err) => {
                console.error('Error al cargar niveles reclamos:', err);
              }
            });


}
validarSiExisteNombre(nombre: string): Promise<boolean> {
  return this.reclamosService.existeNombreReclamo(nombre).toPromise()
    .then(res => res ?? false)
    .catch(err => {
      console.error('Error validando nombre de reclamo:', err);
      return false;
    });
}

async crearReclamo(){
console.log("nombreReclamo",this.nombreReclamo);
if(this.nombreReclamo===''){
 this.mensajeErrorReclamo='Debe asignarle un nombre al reclamo';
 return;
}

const existe = await this.validarSiExisteNombre(this.nombreReclamo);
console.log(existe);
    if (existe) {
      this.mensajeErrorReclamo = 'El nombre de reclamo ya existe';
          return;
    }

if(this.tipoReclamoSeleccionadoId===null){
 this.mensajeErrorReclamo='Debe seleccionar un tipo de reclamo';
 return;
}
if(this.estadoReclamoSeleccionadoId===null){
 this.mensajeErrorReclamo='Debe seleccionar un estado del reclamo';
 return;
}
if(this.nivelReclamoSeleccionadoId===null){
 this.mensajeErrorReclamo='Debe seleccionar un nivel de satisfaccion del reclamo';
 return;
}
if(this.fechaReclamo===null){
 this.mensajeErrorReclamo='Debe seleccionar la fecha del reclamo';
 return;
}
if(this.localidad===''){
 this.mensajeErrorReclamo='Debe seleccionar la localidad del reclamo';
 return;
}
if(this.tiempoResolucion===null){
 this.mensajeErrorReclamo='Debe indicar el tiempo de resolucion del reclamo';
 return;
}
console.log("estadoSeleccionado:",this.estadoReclamoSeleccionadoId);
console.log("fechaReclamo:",this.fechaReclamo);
const nuevoReclamo: Reclamo= {
                      nombre: this.nombreReclamo,
                      descripcion: this.descripcion,
                      tipo_reclamo: { id: this.tipoReclamoSeleccionadoId},
                      fecha_reclamo : this.fechaReclamo + 'T00:00:00',
                      estado: { id: this.estadoReclamoSeleccionadoId },
                      tiempo_resolucion: this.tiempoResolucion,
                      nivel_satisfaccion: { id: this.nivelReclamoSeleccionadoId },
                      direccion: {
                        localidad: this.localidad,
                        barrio: this.barrio,
                        calle: this.calle,
                        numeroCalle: this.nroCalle,
                      },
                    };


this.reclamosService.crearReclamo(nuevoReclamo).subscribe({
    next: res => {
      console.log('Reclamo creado', res);
      this.snackBar.open('El reclamo fue creado con éxito', '', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }).afterDismissed().subscribe(() => {
        this.nombreReclamo = '';
        this.descripcion = '';
        this.localidad = '';
        this.barrio = '';
        this.calle = '';
        this.nroCalle = null;
        this.tiempoResolucion =null;
        this.nivelReclamoSeleccionadoId=null;
        this.tipoReclamoSeleccionadoId = null;
        const hoy = new Date();
        this.fechaReclamo = this.convertirFechaAInputDate(hoy);
        this.estadoReclamoSeleccionadoId=null;
      });
    },
    error: err => {
      console.error('Error', err);
    }
  });
}

seleccionarReclamo(reclamo:Reclamo){
  this.nombreReclamo=reclamo.nombre;
  this.mostrarDatosEdicion = true;

  console.log('Fecha recibida del reclamo:', reclamo.fecha_reclamo);
  console.log('Tipo:', typeof reclamo.fecha_reclamo);
  console.log('Instancia Date:', new Date(reclamo.fecha_reclamo));
  setTimeout(() => {
    this.reclamoSeleccionado = reclamo;
    this.fechaReclamo = this.convertirFechaAInputDate(reclamo.fecha_reclamo);
    this.localidad = reclamo.direccion.localidad;
    this.barrio = reclamo.direccion.barrio;
    this.calle = reclamo.direccion.calle;
    this.nroCalle = reclamo.direccion.numeroCalle;
    this.tiempoResolucion=reclamo.tiempo_resolucion;
    this.descripcion=reclamo.descripcion;
    this.reclamosSugeridos = [];
    this.asignarNivelTipoEstadoEditar();
  }, 0);

}
asignarNivelTipoEstadoEditar(){
  if (!this.reclamoSeleccionado) return;

   this.tipoReclamoService.obtenerTiposReclamo().subscribe({
      next: (tipoReclamo: TipoReclamo[]) => {
        this.tiposReclamo = tipoReclamo;
        const tipoReclamoEncontrado = this.tiposReclamo.find(r => r.id === this.reclamoSeleccionado!.tipo_reclamo.id);
        this.tipoReclamoSeleccionadoId = tipoReclamoEncontrado?.id ?? null;
      },
      error: err => {
        console.error('Error al cargar tipoReclamo:', err);
      }
    });

     this.estadoReclamoService.obtenerEstadosReclamo().subscribe({
          next: (estadoReclamo: EstadoReclamo[]) => {
            this.estadosReclamo = estadoReclamo;
            const estadoReclamoEncontrado = this.estadosReclamo.find(r => r.id === this.reclamoSeleccionado!.estado.id);
            this.estadoReclamoSeleccionadoId = estadoReclamoEncontrado?.id ?? null;
          },
          error: err => {
            console.error('Error al cargar estado reclamo:', err);
          }
        });

             this.nivelReclamoService.obtenerNivelesReclamo().subscribe({
                  next: (nivelReclamo: NivelReclamo[]) => {
                    this.nivelesReclamo = nivelReclamo;
                    const nivelReclamoEncontrado = this.nivelesReclamo.find(r => r.id === this.reclamoSeleccionado!.nivel_satisfaccion.id);
                    this.nivelReclamoSeleccionadoId = nivelReclamoEncontrado?.id ?? null;
                  },
                  error: err => {
                    console.error('Error al cargar nivel reclamo:', err);
                  }
                });



}

convertirFechaAInputDate(fecha: string | Date): string {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

buscarReclamos(Reclamo:string){

    if ((this.mostrarEditarReclamo) && this.nombreReclamo.length>1) {
      this.reclamosService.buscarReclamosPorNombre(this.nombreReclamo).subscribe(
        reclamos => {
          console.log(reclamos); // aquí es un array de Usuario
       this.reclamosSugeridos = Array.isArray(reclamos) ? reclamos : [];
   console.log(this.reclamosSugeridos.length);
        },
        err => {
          console.error(err);
          this.reclamosSugeridos = [];
        }
      );
     } else {
       console.log("No encontre");
       this.reclamosSugeridos = [];
     }
}

editarReclamo(){
  if (!this.reclamoSeleccionado) {
    this.snackBar.open('Debe seleccionar un reclamo para editar', '', { duration: 3000 });
    return;
  }

  this.mensajeErrorReclamo='';
if(this.nombreReclamo===''){
 this.mensajeErrorReclamo='Debe asignarle un nombre al reclamo';
 return;
}

if(this.tipoReclamoSeleccionadoId===null){
 this.mensajeErrorReclamo='Debe seleccionar un tipo de reclamo';
 return;
}
if(this.estadoReclamoSeleccionadoId===null){
 this.mensajeErrorReclamo='Debe seleccionar un estado del reclamo';
 return;
}
if(this.nivelReclamoSeleccionadoId===null){
 this.mensajeErrorReclamo='Debe seleccionar un nivel de satisfaccion del reclamo';
 return;
}
if(this.fechaReclamo===null){
 this.mensajeErrorReclamo='Debe seleccionar la fecha del reclamo';
 return;
}
if(this.localidad===''){
 this.mensajeErrorReclamo='Debe seleccionar la localidad del reclamo';
 return;
}
if(this.tiempoResolucion===null){
 this.mensajeErrorReclamo='Debe indicar el tiempo de resolucion del reclamo';
 return;
}

const nuevoReclamo: Reclamo= {

                      nombre: this.nombreReclamo,
                      descripcion: this.descripcion,
                      tipo_reclamo: { id: this.tipoReclamoSeleccionadoId},
                      fecha_reclamo : this.fechaReclamo + 'T00:00:00',
                      estado: { id: this.estadoReclamoSeleccionadoId },
                      tiempo_resolucion: this.tiempoResolucion,
                      nivel_satisfaccion: { id: this.nivelReclamoSeleccionadoId },
                      direccion: {
                        localidad: this.localidad,
                        barrio: this.barrio,
                        calle: this.calle,
                        numeroCalle: this.nroCalle,
                      },
                    };


this.reclamosService.actualizarReclamo(this.reclamoSeleccionado.id as number,nuevoReclamo).subscribe({
    next: res => {
      if (res.success) {
        this.snackBar.open('Reclamo actualizado con éxito', '', { duration: 3000 });

        this.nombreReclamo = '';
        this.descripcion = '';
        const hoy = new Date();
         this.fechaReclamo = this.convertirFechaAInputDate(hoy);        this.tipoReclamoSeleccionadoId = null;
        this.estadoReclamoSeleccionadoId=null;
        this.tiempoResolucion=null;
        this.nivelReclamoSeleccionadoId=null;
        this.localidad='';
        this.barrio='';
        this.calle='';
        this.nroCalle=null;


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

//////////////////////////////////////////OBRAS

MostrarCrearObra(){

this.mostrarCrearObra=!this.mostrarCrearObra;

   this.mostrarEditarObra = false;
   this.mostrarAdjuntarExcelObra = false;
   this.mostrarDatosEdicionObra = false;

   // Cargar selects
   this.CargarDatosObra();





}

CargarDatosObra(){
 this.estadoObrasService.obtenerEstadosObra().subscribe({
     next: (data: EstadoObra[]) => {
       this.estadosObra = data;
       console.log('estados obras cargados:', this.estadosObra);
     },
     error: (err) => {
       console.error('Error al cargar estados obras:', err);
     }
   });

     this.tipoObrasService.obtenerTiposObra().subscribe({
        next: (data: TipoObra[]) => {
          this.tiposObra = data;
          console.log('tipos obras cargados:', this.tiposObra);
        },
        error: (err) => {
          console.error('Error al cargar tipos obras:', err);
        }
      });


}

mostrarAdjuntarExcelObras(){
   this.mostrarAdjuntarExcelObra=!this.mostrarAdjuntarExcelObra;
   this.mostrarEditarObra=false;
   this.mostrarCrearObra=false;

}

}
