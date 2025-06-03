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

import * as L from 'leaflet';

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
mostrarMapaReclamos:boolean=false;

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

map: L.Map | null = null;

L: any;

tipoGrafico:boolean=false;
private mapaInicializado = false;
private markerClusterGroup: any;





reclamos: ReclamoConDescripciones[] = [];
obras:Obra [] = [];

chartData: ChartData<any> = {
  labels: [],
  datasets: [
    { data: [], label: 'Cantidad por Estado' }
  ]
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


get chartOptions(): ChartOptions {
  if (this.chartType === 'radar') {
    return {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      scales: {
        r: {
          angleLines: { display: true, color: '#ccc' },
          grid: { display: true, color: '#ccc' },
          pointLabels: { color: '#666' },
          ticks: {
            display: false,  // Oculta los numeritos
            color: '#666',
            backdropColor: 'transparent',
          },
          beginAtZero: true,
        }
      },
      elements: {
        line: { borderWidth: 2 }
      },
    };
  } else if (this.chartType === 'polarArea') {
    return {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      scales: {
        r: {
          ticks: {
            display: false,  // Oculta numeritos en polarArea
          },
          grid: { display: true, color: '#ccc' },
        }
      },
    };
  } else if (this.chartType === 'line') {
    return {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      scales: {
        x: {
          display: true,
          grid: { display: true, color: '#ccc' },
          ticks: { color: '#666', display: true },
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: { display: true, color: '#ccc' },
          ticks: { color: '#666', display: true },
        },
      },
      elements: {
        line: { borderWidth: 2 }
      },
    };
  } else if (this.chartType === 'bar') {
    return {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      scales: {
        x: {
          display: true,
          grid: { display: true, color: '#ccc' },
          ticks: { color: '#666', display: true },
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: { display: true, color: '#ccc' },
          ticks: { color: '#666', display: true },
        },
      },
      // No 'elements.line' para barras
    };
  } else {
    return {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      // Opcional: configura otras cosas para otros tipos
    };
  }
}


  mostrarInicioBoton(){
  this.mostrarInicio=!this.mostrarInicio;
  this.mostrarGraficosReclamos=false;
  this.mostrarMapaReclamos=false;
  this.tipoGrafico=false;

  }
  mostrarGraficosReclamosBoton(){
    this.mostrarGraficosReclamos=!this.mostrarGraficosReclamos;
    this.tipoGrafico=!this.tipoGrafico;
    this.mostrarInicio=false;
  this.mostrarMapaReclamos=false;

    this.cargarFiltrosReclamo();
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
   const coloresVisibles = [
       '#a3c9f1', // celeste claro
       '#b6e3ac', // verde claro
       '#ffd59e', // naranja suave
       '#f7a6b0', // rosa claro
       '#ffe39f', // amarillo claro
       '#c3eaf7', // celeste muy claro
       '#dab6fc', // violeta pastel
       '#ffbfa3'  // coral suave
   ];


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

      const labels = Object.keys(conteo);
      const dataValues = Object.values(conteo);
const backgroundColors = labels.map((_, index) => coloresVisibles[index % coloresVisibles.length]);
const borderColors = backgroundColors.map(color => color); // usa el mismo color que el fondo

   this.chartData = {
     labels: labels,
     datasets: [
       {
         data: dataValues,
         label: 'Cantidad por ' + this.grupoPor,
         backgroundColor: backgroundColors,
         borderColor: borderColors,
         borderWidth: 1 // o 0 si no querés bordes visibles
       }
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
  if(this.mostrarGraficosReclamos){
  this.cargarGraficoAgrupado();
  }
  if(this.mostrarMapaReclamos){
      this.agregarMarcadoresReclamos();

  }

});
}



actualizarAgrupamiento(){
this.cargarGraficoAgrupado();
}

async cargarLeafletYCluster() {
  if (this.mapaInicializado) return;

  // Importás leaflet y el plugin
  await import('leaflet');
  await import('leaflet.markercluster');
  await import('leaflet.heat');

  // Usar el objeto global window.L, porque el plugin extiende ese objeto
  this.L = (window as any).L;

  // Fix para iconos rotos, si querés mantenerlo
  delete (this.L.Icon.Default.prototype as any)._getIconUrl;

  this.L.Icon.Default.mergeOptions({
    iconUrl: 'assets/leaflet/marker-icon.png',
    shadowUrl: 'assets/leaflet/marker-shadow.png',
  });

  this.mapaInicializado = true;
}

async inicializarMapa() {
  if (typeof window === 'undefined') return;

  await this.cargarLeafletYCluster();

  if (this.map) {
    this.map.remove();
    this.map = null;
  }


  const coordenadasIniciales = this.reclamos?.length
    ? [this.reclamos[0].direccion.latitud, this.reclamos[0].direccion.longitud]
    : [-34.505, -58.49];

  // Estilos base
  const osm = this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  });

  const esriSat = this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
  });

  const esriSatLabels = this.L.layerGroup([
    esriSat,
    this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri, HERE, Garmin, OpenStreetMap contributors'
    })
  ]);

  const topo = this.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenTopoMap contributors'
  });

  const cartoLight = this.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB'
  });

  const cartoDark = this.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB'
  });

  // Inicializar mapa con capa base
  this.map = this.L.map('map', {
    center: coordenadasIniciales as [number, number],
    zoom: 13,
    layers: [osm]
  });

  const baseMaps = {
    "🗺️ OpenStreetMap": osm,
    "🛰️ Satélite (ESRI)": esriSat,
    "📷 Satélite + Nombres (ESRI)": esriSatLabels,
    "🏔️ Topográfico (OpenTopoMap)": topo,
    "🔳 Claro (Carto Positron)": cartoLight,
    "🌙 Oscuro (Carto Dark Matter)": cartoDark
  };

  this.L.control.layers(baseMaps).addTo(this.map);

  this.agregarMarcadoresReclamos();




 const heatPoints = this.reclamos
   .filter(r => r.estado.descripcion !== 'Cerrado')
   .map(r => [r.direccion.latitud, r.direccion.longitud]);

 const heatLayer = (this.L as any).heatLayer(heatPoints, {
  radius: 100,
    blur: 0,
    gradient: {
      0.1: '#cc0000',
      0.3: '#cc0000',
      0.5: '#cc0000',
      0.7: '#cc0000',
      1.0: '#cc0000'
   }
 });



// Agregar al control de capas
const overlayMaps = {
  '📍 Reclamos (Cluster)': this.markerClusterGroup,
  '🔥 Mapa de Calor (Reclamos no cerrados)': heatLayer
};

this.L.control.layers(undefined, overlayMaps, { collapsed: false }).addTo(this.map);

  setTimeout(() => {
    this.map?.invalidateSize();
  }, 400);
}

mostrarMapaReclamosBoton() {
  this.mostrarMapaReclamos = !this.mostrarMapaReclamos;
  this.mostrarGraficosReclamos=false;
  this.mostrarInicio=false;
  this.tipoGrafico=false;
  this.cargarFiltrosReclamo();

  if (this.mostrarMapaReclamos) {
    setTimeout(() => {
      this.inicializarMapa();
    }, 300);
  } else {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

private agregarMarcadoresReclamos() {
  if (!this.map || !this.reclamos) return;

  // Remover cluster previo si existe
  if (this.markerClusterGroup) {
    this.markerClusterGroup.clearLayers();
    this.map.removeLayer(this.markerClusterGroup);
    this.markerClusterGroup = null;
  }

  // Crear nuevo grupo cluster
  this.markerClusterGroup = this.L.markerClusterGroup();

  this.reclamos.forEach(reclamo => {
    if (reclamo.direccion.latitud && reclamo.direccion.longitud) {
      const esCerrado = reclamo.estado.descripcion === 'Cerrado';

      const icono = this.L.icon({
        iconUrl: esCerrado
          ? 'assets/leaflet/marker-icon-green.png'
          : 'assets/leaflet/marker-icon-red.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const marker = this.L.marker(
        [reclamo.direccion.latitud, reclamo.direccion.longitud],
        { icon: icono }
      ).bindPopup(`<b>${reclamo.nombre || 'Reclamo'}</b><br>Estado: ${reclamo.estado.descripcion || 'N/D'}`);

      this.markerClusterGroup.addLayer(marker);
    }
  });

  this.markerClusterGroup.addTo(this.map);
}
getChartSizeClass(): string {
  switch (this.chartType) {
    case 'pie':
    case 'doughnut':
      return 'grafico-pequeno';
    case 'radar':
    case 'polarArea':
      return 'grafico-mediano';
    default: // bar, line, etc.
      return 'grafico-grande';
  }
}

}
