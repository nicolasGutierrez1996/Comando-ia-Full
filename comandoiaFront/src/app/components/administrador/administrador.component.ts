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
import { ObrasService,Obra} from '../../services/obras.service';






@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule,FormsModule, MatSnackBarModule],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.css'
})
export class AdministradorComponent {

selectedFile: File | null = null;
selectedFileObra: File | null = null;

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
fechaInicioObra:string | null='';
fechaFinEstimada:string | null='';
avanceFisico:number | null = null;
montoPresupuestado:number | null = null;
montoEjecutado:number | null = null;
fechaFinReal:string | null='';
localidadObra:string='';
barrioObra:string='';
calleObra:string='';
nroCalleObra:number | null = null;
descripcionObra:string='';
mensajeErrorObra:string='';
obrasSugeridas: Obra[] = [];
obraSeleccionada:Obra | null = null;;


  constructor(private snackBar: MatSnackBar
  ,private router: Router, private reclamosService:ReclamosService,private nivelReclamoService: NivelSatisfaccionService,
   private tipoReclamoService:TipoReclamosService,private estadoReclamoService: EstadoReclamoService,
   private tipoObrasService:TipoObrasService, private estadoObrasService:EstadoObrasService,
   private obrasService:ObrasService) {}


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
   this.refrescarStrings();

   this.tipoReclamoSeleccionadoId = 1;
   this.estadoReclamoSeleccionadoId = 1;
   this.tiempoResolucion = null;
   this.nivelReclamoSeleccionadoId = 1;

   this.mostrarCrearObra=false;
   this.mostrarEditarObra=false;
   this.mostrarAdjuntarExcelObra=false;

   this.reclamoSeleccionado = null;
 }

  MostrarEditarReclamo(){
    this.mostrarEditarReclamo=!this.mostrarEditarReclamo;
    this.mostrarAdjuntarExcel=false;
    this.mostrarCrearReclamo=false;

             this.refrescarStrings();
            const hoy = new Date();
             this.fechaReclamo = this.convertirFechaAInputDate(hoy);        this.tipoReclamoSeleccionadoId = null;
            this.estadoReclamoSeleccionadoId=null;
            this.tiempoResolucion=null;
            this.nivelReclamoSeleccionadoId=null;
            this.nroCalle=null;


            this.mostrarDatosEdicion = false;
               this.mostrarCrearObra=false;
               this.mostrarEditarObra=false;
               this.mostrarAdjuntarExcelObra=false;
  }
MostrarAdjuntarExcel(){
this.mostrarAdjuntarExcel=!this.mostrarAdjuntarExcel;
this.mostrarEditarReclamo=false;
this.mostrarCrearReclamo=false;
   this.mostrarCrearObra=false;
   this.mostrarEditarObra=false;
   this.mostrarAdjuntarExcelObra=false;



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
      this.snackBar.open('Error al crear reclamo', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'end'
      });
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
this.snackBar.open('Reclamo actualizado con éxito', '', {
  duration: 3000,
  verticalPosition: 'top',
  horizontalPosition: 'end'
});
        this.nombreReclamo = '';
        this.descripcion = '';
        const hoy = new Date();
         this.fechaReclamo = this.convertirFechaAInputDate(hoy);
         this.tipoReclamoSeleccionadoId = null;
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
      this.snackBar.open('Error al actualizar reclamo', '', {
         duration: 3000,
         verticalPosition: 'top',
         horizontalPosition: 'end'
       });
    }
  });
}

//////////////////////////////////////////OBRAS

MostrarCrearObra(){

this.mostrarCrearObra=!this.mostrarCrearObra;

   this.mostrarEditarObra = false;
   this.mostrarAdjuntarExcelObra = false;
   this.mostrarDatosEdicionObra = false;
   this.mostrarCrearReclamo=false;
   this.mostrarEditarReclamo=false;
   this.mostrarAdjuntarExcel=false;
   this.refrescarStrings();
   this.estadoObraSeleccionadoId=1;
   this.tipoObraSeleccionadoId=1;

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
   this.mostrarCrearReclamo=false;
   this.mostrarEditarReclamo=false;
   this.mostrarAdjuntarExcel=false;

}


  onFileSelectedObra(event: any) {
    this.selectedFileObra = event.target.files[0];
  }

onUploadObra(): void {
  if (!this.selectedFileObra) return;

  const formData = new FormData();
  formData.append('file', this.selectedFileObra);

  this.obrasService.importarDesdeExcel(formData).subscribe({
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

async crearObra(){

this.mensajeErrorObra='';
console.log("nombreObra",this.nombreObra);
if(this.nombreObra===''){
 this.mensajeErrorObra='Debe asignarle un nombre a la obra';
 return;
}

const existe = await this.validarSiExisteNombreObra(this.nombreObra);

    if (existe) {
      this.mensajeErrorObra = 'El nombre de obra ya existe';
          return;
    }

if(this.tipoObraSeleccionadoId===null){
 this.mensajeErrorObra='Debe seleccionar un tipo de obra';
 return;
}

if(this.estadoObraSeleccionadoId===null){
 this.mensajeErrorObra='Debe seleccionar un estado de la obra';
 return;
}
if(this.localidadObra===''){
 this.mensajeErrorObra='Debe ingresar la localidad de la obra';
 return;
}

console.log("Asdasdasd");
const nuevaObra: Obra= {
                      nombre: this.nombreObra,
                      descripcion: this.descripcionObra,
                      tipo_obra: { id: this.tipoObraSeleccionadoId},
                      estado: { id: this.estadoObraSeleccionadoId },
                      avance_fisico: this.avanceFisico,
                      monto_presupuestado:this.montoPresupuestado,
                      monto_ejecutado: this.montoEjecutado,
                      fecha_inicio: this.fechaInicioObra ? this.fechaInicioObra + 'T00:00:00' : null,
                      fecha_estimada_finalizacion: this.fechaFinEstimada ? this.fechaFinEstimada + 'T00:00:00' : null,
                      fecha_real_finalizacion: this.fechaFinReal ? this.fechaFinReal + 'T00:00:00' : null,
                      direccion: {
                        localidad: this.localidadObra,
                        barrio: this.barrioObra,
                        calle: this.calleObra,
                        numeroCalle: this.nroCalleObra,
                      },
                    };


this.obrasService.crearObra(nuevaObra).subscribe({
    next: res => {
      console.log('Obra creada', res);
      this.snackBar.open('La obra fue creada con éxito', '', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }).afterDismissed().subscribe(() => {
        this.nombreObra = '';
        this.descripcionObra = '';
        this.localidadObra = '';
        this.barrioObra = '';
        this.calleObra = '';
        this.nroCalleObra = null;
        this.avanceFisico =null;
        this.montoPresupuestado=null;
        this.montoEjecutado=null;
        this.tipoObraSeleccionadoId=null;
        this.estadoObraSeleccionadoId = null;
        const hoy = new Date();
        this.fechaInicioObra = this.convertirFechaAInputDate(hoy);
        this.fechaFinEstimada = this.convertirFechaAInputDate(hoy);
        this.fechaFinReal = this.convertirFechaAInputDate(hoy);
      });
    },
    error: err => {
      console.error('Error', err);
      this.snackBar.open('Error al crear obra', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'end'
      });
    }
  });



}

validarSiExisteNombreObra(nombre: string): Promise<boolean> {
  return this.obrasService.existeNombreObra(nombre).toPromise()
    .then(res => res ?? false)
    .catch(err => {
      console.error('Error validando nombre de obra:', err);
      return false;
    });

}


MostrarEditarObra(){

this.mostrarEditarObra=!this.mostrarEditarObra;

   this.mostrarCrearObra = false;
   this.mostrarAdjuntarExcelObra = false;
   this.mostrarDatosEdicionObra = false;
   this.mostrarCrearReclamo=false;
   this.mostrarEditarReclamo=false;
   this.mostrarAdjuntarExcel=false;
   this.refrescarStrings();
   this.estadoObraSeleccionadoId=1;
   this.tipoObraSeleccionadoId=1;

}


seleccionarObra(obra:Obra){
  this.nombreObra=obra.nombre;
  this.mostrarDatosEdicionObra = true;

   console.log("asdasdasd",obra.fecha_inicio);
  setTimeout(() => {
    this.obraSeleccionada = obra;
   this.fechaInicioObra = obra.fecha_inicio ? this.convertirFechaAInputDate(obra.fecha_inicio) : '';
   this.fechaFinEstimada = obra.fecha_estimada_finalizacion ? this.convertirFechaAInputDate(obra.fecha_estimada_finalizacion) : '';
   this.fechaFinReal = obra.fecha_real_finalizacion ? this.convertirFechaAInputDate(obra.fecha_real_finalizacion) : '';
    this.localidadObra = obra.direccion.localidad;
    this.barrioObra = obra.direccion.barrio;
    this.calleObra = obra.direccion.calle;
    this.nroCalleObra = obra.direccion.numeroCalle;
    this.montoPresupuestado=obra.monto_presupuestado;
    this.montoEjecutado=obra.monto_ejecutado;
    this.descripcionObra=obra.descripcion;
    this.avanceFisico=obra.avance_fisico;
    this.nombreObra=obra.nombre;

    this.obrasSugeridas = [];
    this.asignarTipoEstadoEditarObra();
  }, 0);

}
asignarTipoEstadoEditarObra(){

  if (!this.obraSeleccionada) return;

   this.tipoObrasService.obtenerTiposObra().subscribe({
      next: (tiposObra: TipoObra[]) => {
        this.tiposObra = tiposObra;
        const tipoObraEncontrado = this.tiposObra.find(r => r.id === this.obraSeleccionada!.tipo_obra.id);
        this.tipoObraSeleccionadoId = tipoObraEncontrado?.id ?? null;
      },
      error: err => {
        console.error('Error al cargar tipo obra:', err);
      }
    });

     this.estadoObrasService.obtenerEstadosObra().subscribe({
          next: (estadoObra: EstadoObra[]) => {
            this.estadosObra = estadoObra;
            const estadoObraEncontrado = this.estadosObra.find(r => r.id === this.obraSeleccionada!.estado.id);
            this.estadoObraSeleccionadoId = estadoObraEncontrado?.id ?? null;
          },
          error: err => {
            console.error('Error al cargar estado obra:', err);
          }
        });
        }

buscarObras(obra:string){

    if ((this.mostrarEditarObra) && this.nombreObra.length>1) {
      this.obrasService.buscarObrasPorNombre(this.nombreObra).subscribe(
        obras => {
          console.log(obras); // aquí es un array de Usuario
       this.obrasSugeridas = Array.isArray(obras) ? obras : [];
   console.log(this.obrasSugeridas.length);
        },
        err => {
          console.error(err);
          this.obrasSugeridas = [];
        }
      );
     } else {
       console.log("No encontre");
       this.obrasSugeridas = [];
     }
}

editarObra(){
this.mensajeErrorObra='';

if(this.nombreObra===''){
 this.mensajeErrorObra='Debe asignarle un nombre a la obra';
 return;
}

if(this.tipoObraSeleccionadoId===null){
 this.mensajeErrorObra='Debe seleccionar un tipo de obra';
 return;
}

if(this.estadoObraSeleccionadoId===null){
 this.mensajeErrorObra='Debe seleccionar un estado de la obra';
 return;
}
if(this.localidadObra===''){
 this.mensajeErrorObra='Debe ingresar la localidad de la obra';
 return;
}
if(this.obraSeleccionada==null){
 this.mensajeErrorObra='Debe seleccionar la obra a editar';
 return;
}

const nuevaObra: Obra= {
                      nombre: this.nombreObra,
                      descripcion: this.descripcionObra,
                      tipo_obra: { id: this.tipoObraSeleccionadoId},
                      estado: { id: this.estadoObraSeleccionadoId },
                      avance_fisico: this.avanceFisico,
                      monto_presupuestado:this.montoPresupuestado,
                      monto_ejecutado: this.montoEjecutado,

                      fecha_inicio: this.fechaInicioObra ? this.fechaInicioObra + 'T00:00:00' : null,
                      fecha_estimada_finalizacion: this.fechaFinEstimada ? this.fechaFinEstimada + 'T00:00:00' : null,
                      fecha_real_finalizacion: this.fechaFinReal ? this.fechaFinReal + 'T00:00:00' : null,
                      direccion: {
                        localidad: this.localidadObra,
                        barrio: this.barrioObra,
                        calle: this.calleObra,
                        numeroCalle: this.nroCalleObra,
                      },
                    };


this.obrasService.actualizarObra(this.obraSeleccionada?.id as number,nuevaObra).subscribe({
    next: res => {
      console.log('Obra Actualizada', res);
      this.snackBar.open('La obra fue actualizada con éxito', '', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }).afterDismissed().subscribe(() => {
        this.nombreObra = '';
        this.descripcionObra = '';
        this.localidadObra = '';
        this.barrioObra = '';
        this.calleObra = '';
        this.nroCalleObra = null;
        this.avanceFisico =null;
        this.montoPresupuestado=null;
        this.montoEjecutado=null;
        this.tipoObraSeleccionadoId=null;
        this.estadoObraSeleccionadoId = null;
        const hoy = new Date();
        this.fechaInicioObra = this.convertirFechaAInputDate(hoy);
        this.fechaFinEstimada = this.convertirFechaAInputDate(hoy);
        this.fechaFinReal = this.convertirFechaAInputDate(hoy);
        this.mostrarDatosEdicionObra=false;
      });
    },
    error: err => {
      console.error('Error', err);
      this.snackBar.open('Error al actualizar obra', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'end'
      });
    }
  });



}

refrescarStrings(): void {
  // Variables string de reclamos
  this.nombreReclamo = '';
  this.tipoReclamo = '';
  this.fechaReclamo = '';
  this.estadoReclamo = '';
  this.localidad = '';
  this.barrio = '';
  this.calle = '';
  this.satisfaccion = '';
  this.descripcion = '';
  this.mensajeErrorReclamo = '';
  this.nroCalle=null;

  // Variables string de obras
  this.nombreObra = '';
  this.fechaInicioObra = null;  // es string|null, lo seteamos en null
  this.fechaFinEstimada = null;
  this.fechaFinReal = null;
  this.localidadObra = '';
  this.barrioObra = '';
  this.calleObra = '';
  this.montoEjecutado=null;
  this.montoPresupuestado=null;
  this.avanceFisico=null

  this.nroCalleObra=null
  this.descripcionObra = '';
  this.mensajeErrorObra = '';
}

}
