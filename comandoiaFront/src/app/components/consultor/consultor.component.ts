import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ObrasService,Obra} from '../../services/obras.service';
import { ReclamosService,ReclamoConDescripciones} from '../../services/reclamos.service';
import { HttpParams } from '@angular/common/http';

import { DireccionesService} from '../../services/direcciones.service';
import { EstadoReclamoService} from '../../services/estadoReclamo.service';
import { NivelSatisfaccionService} from '../../services/nivelSatisfaccion.service';
import { TipoReclamosService} from '../../services/tipoReclamo.service';

import { ChartData, ChartOptions,ChartType  } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-consultor',
  standalone: true,
  imports: [CommonModule,FormsModule, NgChartsModule],
  templateUrl: './consultor.component.html',
  styleUrl: './consultor.component.css'
})
export class ConsultorComponent {

mostrarInicio:boolean=false;
mostrarGraficosReclamos:boolean=false;

//FILTROS
localidadesDisponibles:string []=[];
barriosDisponibles:string []=[];
estadosReclamoDisponibles:string []=[];
tiposReclamoDisponibles:string []=[];
nivelesReclamoDisponibles:string []=[];
tipoGraficoSeleccionado: string = 'bar';
chartType: ChartType = 'bar';
localidadSeleccionada:string='';
barrioSeleccionado:string='';
estadoReclamoSeleccionado:string='';
tipoReclamoSeleccionado:string='';
nivelReclamoSeleccionado:string='';
fechaDesdeReclamo: string | null = null;
fechaHastaReclamo: string | null = null;
tiempResoMayor: number | null =null;
tiempResoMenor:number | null =null;
grupoPor: string = 'estado';








reclamos: ReclamoConDescripciones[] = [];
obras:Obra [] = [];

chartData: ChartData<any> = {
  labels: [],
  datasets: [
    { data: [], label: 'Cantidad por Estado' }
  ]
};

chartOptions: ChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true
    }
  }
};

constructor(
  private router: Router,
  private reclamosService: ReclamosService,
  private obrasService: ObrasService,
  private direccionesService: DireccionesService,
  private estadoReclamoService: EstadoReclamoService,
  private nivelSatisfaccionService: NivelSatisfaccionService,
  private tipoReclamosService: TipoReclamosService
) {}

 ngOnInit(): void {
    this.reclamosService.obtenerReclamos().subscribe((data: ReclamoConDescripciones[]) => {


      this.reclamos = data;
       console.log('Reclamos recibidos:', this.reclamos);
      this.cargarGraficoAgrupado();
    });
  }


  mostrarInicioBoton(){
  this.mostrarInicio=!this.mostrarInicio;
  this.mostrarGraficosReclamos=false;

  }
  mostrarGraficosReclamosBoton(){
    this.mostrarGraficosReclamos=!this.mostrarGraficosReclamos;
    this.mostrarInicio=false;
    this.cargarFiltrosReclamo()
  }

  cargarFiltrosReclamo(){

    this.direccionesService.obtenerLocalidades().subscribe({
         next: (data: string[]) => {
           this.localidadesDisponibles = data;
           console.log('localidades cargadas:', this.localidadesDisponibles);
         },
         error: (err) => {
           console.error('Error al cargar localidades:', err);
         }
       });

          this.direccionesService.obtenerBarrios().subscribe({
                next: (data: string[]) => {
                  this.barriosDisponibles = data;
                  console.log('barrios cargados:', this.barriosDisponibles);
                },
                error: (err) => {
                  console.error('Error al cargar barrios:', err);
                }
              });

                this.nivelSatisfaccionService.obtenerDescripciones().subscribe({
                      next: (data: string[]) => {
                        this.nivelesReclamoDisponibles = data;
                        console.log('niveles cargados:', this.nivelesReclamoDisponibles);
                      },
                      error: (err) => {
                        console.error('Error al cargar niveles:', err);
                      }
                    });

                     this.estadoReclamoService.obtenerDescripciones().subscribe({
                             next: (data: string[]) => {
                               this.estadosReclamoDisponibles = data;
                               console.log('estados cargados:', this.estadosReclamoDisponibles);
                             },
                             error: (err) => {
                               console.error('Error al cargar estados:', err);
                             }
                           });
                     this.tipoReclamosService.obtenerDescripciones().subscribe({
                               next: (data: string[]) => {
                                 this.tiposReclamoDisponibles = data;
                                 console.log('tipos cargados:', this.tiposReclamoDisponibles);
                               },
                               error: (err) => {
                                 console.error('Error al cargar tipos:', err);
                               }
                             });

  }


 cargarGraficoAgrupado(): void {
   const conteo: { [clave: string]: number } = {};

   this.reclamos.forEach(reclamo => {
     let clave = 'Desconocido';

     switch (this.grupoPor) {
       case 'estado':
         clave = reclamo.estado?.descripcion || 'Desconocido';
         break;
       case 'localidad':
         clave = reclamo.direccion.localidad || 'Desconocido';
         break;
       case 'barrio':
         clave = reclamo.direccion.barrio || 'Desconocido';
         break;
       case 'tipo':
         clave = reclamo.tipo_reclamo?.descripcion || 'Desconocido';
         break;
       case 'satisfaccion':
         clave = reclamo.nivel_satisfaccion?.descripcion || 'Desconocido';
         break;
       case 'mes':
         clave = reclamo.fecha_reclamo ? new Date(reclamo.fecha_reclamo).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Sin fecha';
         break;
       case 'rangoResolucion':
         const dias = reclamo.tiempo_resolucion || 0;
         if (dias < 5) clave = 'Menos de 5 días';
         else if (dias <= 10) clave = '5-10 días';
         else clave = 'Más de 10 días';
         break;
       default:
         clave = 'Otro';
     }

     conteo[clave] = (conteo[clave] || 0) + 1;
   });

   this.chartData = {
     labels: Object.keys(conteo),
     datasets: [
       { data: Object.values(conteo), label: 'Cantidad por ' + this.grupoPor }
     ]
   };
 }

 actualizarGrafico(): void {
   console.log('Tipo de gráfico cambiado a:', this.tipoGraficoSeleccionado);
     this.chartType = this.tipoGraficoSeleccionado as ChartType;;

 }

aplicarFiltros() {
let params = new HttpParams();

params = params.set('fechaDesde', this.fechaDesdeReclamo ? this.fechaDesdeReclamo + 'T00:00:00' : '1900-01-01T00:00:00');
params = params.set('fechaHasta', this.fechaHastaReclamo ? this.fechaHastaReclamo + 'T23:59:59' : '2100-12-31T23:59:59');
params = params.set('estado', this.estadoReclamoSeleccionado || '');
params = params.set('localidad', this.localidadSeleccionada || '');
params = params.set('barrio', this.barrioSeleccionado || '');
params = params.set('tipoReclamo', this.tipoReclamoSeleccionado || '');
params = params.set('nivelSatisfaccion', this.nivelReclamoSeleccionado || '');
params = params.set('tiempoResolucionMayor', this.tiempResoMayor != null ? this.tiempResoMayor.toString() : '0');
params = params.set('tiempoResolucionMenor', this.tiempResoMenor != null ? this.tiempResoMenor.toString() : '999999');

this.reclamosService.obtenerReclamosFiltrados(params).subscribe((data: ReclamoConDescripciones[]) => {
  this.reclamos = data;
  console.log("reclamos obtenidos:",this.reclamos);
  this.cargarGraficoAgrupado();
});
}

actualizarAgrupamiento(){
this.cargarGraficoAgrupado();
}

}
