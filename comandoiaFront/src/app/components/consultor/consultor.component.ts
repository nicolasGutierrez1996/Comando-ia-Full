import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ObrasService,ObraConDescripciones} from '../../services/obras.service';
import { ReclamosService,ReclamoConDescripciones} from '../../services/reclamos.service';
import { MarkdownModule } from 'ngx-markdown';

import { HttpParams } from '@angular/common/http';

import { DireccionesService} from '../../services/direcciones.service';

import { NivelSatisfaccionService} from '../../services/nivelSatisfaccion.service';
import { TipoReclamosService} from '../../services/tipoReclamo.service';
import { EstadoReclamoService} from '../../services/estadoReclamo.service';
import { TipoObrasService} from '../../services/tipoObras.service';
import { EstadoObrasService} from '../../services/estadoObras.service';
import { GptService } from '../../services/gpt.service';

import { ChartData, ChartOptions,ChartType  } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ChatIaComponent } from './chat-ia/chat-ia.component';
import { InicioComponent } from './inicio/inicio.component';

import * as L from 'leaflet';

interface MensajeIA {
  autor: 'usuario' | 'ia';
  texto: string;
}


@Component({
  selector: 'app-consultor',
  standalone: true,
  imports: [CommonModule,FormsModule, NgChartsModule,MarkdownModule,ChatIaComponent,InicioComponent],
  templateUrl: './consultor.component.html',
  styleUrls: ['./consultor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ConsultorComponent {

//GPT
mensajeUsuario = '';
respuestaIA = '';

mostrarInicio:boolean=true;
mostrarGraficosReclamos:boolean=false;
mostrarMapaReclamos:boolean=false;
mostrarSubBotonReclamos:boolean=false;
mostrarSubBotonObras:boolean=false;

//FILTROS
mostrarFiltros=false;


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
grupoPorCalor:string='estado';
tipoGraficoObra:boolean=false;
map: L.Map | null = null;
heatLayer: any;
L: any;
leyendaVisible:boolean = true;
private legend: any;
tipoGrafico:boolean=false;
private mapaInicializado = false;
private markerClusterGroup: any;
private layersControl: any = null;
grupoPorCalorObra:string='estado';

mensajes: MensajeIA[] = [];

reclamos: ReclamoConDescripciones[] = [];
obras:ObraConDescripciones [] = [];

chartData: ChartData<any> = {
  labels: [],
  datasets: [
    { data: [], label: 'Cantidad por Estado' }
  ]
};

chartDataObras: ChartData<any> = {
  labels: [],
  datasets: [
    { data: [], label: 'Cantidad por Estado' }
  ]
};


//OBRAS
mostrarGraficosObras:boolean=false;
mostrarMapaObras:boolean=false;

fechaDesdeInicioObra: string | null = null;
fechaHastaInicioObra: string | null = null;
tipoObraSeleccionado:string='';
tiposObraDisponibles:string []=[];
estadoObraSeleccionado:string='';
estadosObraDisponibles:string []=[];
tiempAvanceMayor:number | null=null;
tiempAvanceMenor:number | null=null;
montoPresuMayor:number| null=null;
montoPresuMenor:number| null=null;
montoEjeMayor:number| null=null;
montoEjeMenor:number| null=null;
fechaDesdeEstiObra: string | null = null;
fechaHastaEstiObra: string | null = null;
fechaDesdeRealObra: string | null = null;
fechaHastaRealObra: string | null = null;
grupoPorObra: string = 'estado';


//IA CHAT
chatGpt:boolean=false;

fechaHoraActual: string = '';







constructor(
  private router: Router,
  private reclamosService: ReclamosService,
  private obrasService:ObrasService,
  private direccionesService: DireccionesService,
  private estadoReclamoService: EstadoReclamoService,
  private estadoObrasService: EstadoObrasService,
  private tipoObrasSservice:TipoObrasService,
  private nivelSatisfaccionService: NivelSatisfaccionService,
  private tipoReclamosService: TipoReclamosService,
  private gptService: GptService
) {}

 ngOnInit(): void {

      if (typeof window !== 'undefined') {
        this.actualizarFecha();
        setInterval(() => this.actualizarFecha(), 60000);
      }

    this.reclamosService.obtenerReclamos().subscribe((data: ReclamoConDescripciones[]) => {


      this.reclamos = data;
       console.log('Reclamos recibidos:', this.reclamos);
        });
       this.obrasService.obtenerObras().subscribe((data: ObraConDescripciones[]) => {


        this.obras = data;
              console.log('Obras recibidas:', this.obras);


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

actualizarFecha() {
  const ahora = new Date();

  const opcionesFecha: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  };

  const opcionesHora: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  const fecha = ahora.toLocaleDateString('es-AR', opcionesFecha);
  let hora = ahora.toLocaleTimeString('es-AR', opcionesHora);

  hora = hora.replace(':', '.')
             .replace('a. m.', 'AM')
             .replace('p. m.', 'PM')
             .toUpperCase();

  this.fechaHoraActual = `${fecha}\n${hora}`;
}


  mostrarInicioBoton(){
  this.mostrarInicio=!this.mostrarInicio;
  this.mostrarGraficosReclamos=false;
  this.mostrarMapaReclamos=false;
  this.mostrarMapaObras=false;
  this.mostrarGraficosObras=false;
  this.tipoGrafico=false;
  this.tipoGraficoObra=false;
  this.chatGpt=false;

  }
  mostrarGraficosReclamosBoton(){
    this.mostrarGraficosReclamos=!this.mostrarGraficosReclamos;
    this.tipoGrafico=!this.tipoGrafico;
    this.mostrarInicio=false;
  this.mostrarMapaReclamos=false;
  this.mostrarGraficosObras=false;
  this.mostrarMapaObras=false;
  this.tipoGraficoObra=false;
  this.chatGpt=false;

    this.cargarFiltrosReclamo();
    this.cargarGraficoAgrupado();
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

let labels: string[] = [];
let dataValues: number[] = [];

if (
  this.grupoPor === 'mes'
) {
  const auxiliar: { label: string, date: Date, cantidad: number }[] = [];

  for (const label in conteo) {
    // Reconvertimos el label a fecha robusta (año y mes)
    const partes = label.split(' de ');
    if (partes.length === 2) {
      const mes = partes[0];
      const anio = partes[1];
      const fecha = new Date(`${anio}-${this.nombreMesAMesNumero(mes)}-01`);
      auxiliar.push({ label, date: fecha, cantidad: conteo[label] });
    } else {
      auxiliar.push({ label, date: new Date(0), cantidad: conteo[label] }); // fallback para "Sin fecha"
    }
  }

  auxiliar.sort((a, b) => a.date.getTime() - b.date.getTime());

  labels = auxiliar.map(item => item.label);
  dataValues = auxiliar.map(item => item.cantidad);
} else {
  labels = Object.keys(conteo);
  dataValues = Object.values(conteo);
}
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

  params = params.set('fechaInicioDesde', this.fechaDesdeInicioObra != null ? this.fechaDesdeInicioObra + 'T00:00:00' : 'null');
  params = params.set('fechaDesde', this.fechaDesdeReclamo != null && this.fechaDesdeReclamo !== '' ? this.fechaDesdeReclamo + 'T00:00:00' : 'null');
  params = params.set('fechaHasta', this.fechaHastaReclamo != null && this.fechaHastaReclamo !== '' ? this.fechaHastaReclamo + 'T00:00:00' : 'null');
  params = params.set('estado', this.estadoReclamoSeleccionado || '');
  params = params.set('localidad', this.localidadSeleccionada || '');
  params = params.set('barrio', this.barrioSeleccionado || '');
  params = params.set('tipoReclamo', this.tipoReclamoSeleccionado || '');
  params = params.set('nivelSatisfaccion', this.nivelReclamoSeleccionado || '');
  params = params.set('tiempoResolucionMayor', this.tiempResoMayor != null ? this.tiempResoMayor.toString() : '0');
  params = params.set('tiempoResolucionMenor', this.tiempResoMenor != null ? this.tiempResoMenor.toString() : '999999');

  this.reclamosService.obtenerReclamosFiltrados(params).subscribe((data: ReclamoConDescripciones[]) => {
    this.reclamos = data;
    console.log("Reclamos obtenidos:", this.reclamos);

    // Si hay gráfico activo
    if (this.mostrarGraficosReclamos) {
      this.cargarGraficoAgrupado();
    }

    // Si hay mapa activo
    if (this.mostrarMapaReclamos) {
      // 1. Remover capas anteriores del mapa si existen
      if (this.markerClusterGroup && this.map?.hasLayer(this.markerClusterGroup)) {
        this.map.removeLayer(this.markerClusterGroup);
      }
      if (this.heatLayer && this.map?.hasLayer(this.heatLayer)) {
        this.map.removeLayer(this.heatLayer);
      }

      // 2. Recrear clusters con nuevos datos
      this.agregarMarcadoresReclamos();

      // 3. Crear mapa de calor nuevo con los datos actualizados
      this.actualizarMapaCalor();

      // 4. Agregar al mapa según el estado de los checkboxes
      const mostrarPuntos = (document.getElementById('checkboxTogglePuntos') as HTMLInputElement)?.checked ?? true;
      const mostrarCalor = (document.getElementById('checkboxToggleCalor') as HTMLInputElement)?.checked ?? true;

      if (mostrarPuntos && this.markerClusterGroup) {
        this.map!.addLayer(this.markerClusterGroup);
      }

      if (mostrarCalor && this.heatLayer) {
        this.map!.addLayer(this.heatLayer);
      }

      // 5. Actualizar el control de capas con las nuevas instancias
      this.actualizarOverlayMaps();
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
  await import('leaflet.fullscreen');




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
  let coordenadasIniciales: [number, number] = [-34.505, -58.49]; // valor por defecto

  if (this.mostrarMapaReclamos && this.reclamos?.length) {
    const lat = this.reclamos[0].direccion.latitud;
    const lon = this.reclamos[0].direccion.longitud;
    if (lat != null && lon != null) {
      coordenadasIniciales = [lat, lon];
    }
  } else if (this.mostrarMapaObras && this.obras?.length) {
    const lat = this.obras[0].direccion.latitud;
    const lon = this.obras[0].direccion.longitud;
    if (lat != null && lon != null) {
      coordenadasIniciales = [lat, lon];
    }
  }
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

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const customFullscreenControl = this.L.control({ position: 'topleft' });

  customFullscreenControl.onAdd = () => {
    const container = this.L.DomUtil.create('div', 'leaflet-bar');

    const boton = document.createElement('button');
    boton.title = 'Pantalla completa';
    boton.style.backgroundImage = 'url("assets/leaflet/agrandar-mapa.png")';
    boton.style.backgroundSize = '26px 26px';
    boton.style.backgroundRepeat = 'no-repeat';
    boton.style.backgroundPosition = 'center';
    boton.style.width = '34px';
    boton.style.height = '34px';
    boton.style.border = 'none';
    boton.style.cursor = 'pointer';
    boton.style.display = 'block';

    container.appendChild(boton);

    let estaEnFullscreen = false;

    boton.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();

     const elem = document.getElementById('map');
     if (!elem) return;

      if (!estaEnFullscreen) {
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if ((elem as any).webkitRequestFullscreen) (elem as any).webkitRequestFullscreen();
        else if ((elem as any).mozRequestFullScreen) (elem as any).mozRequestFullScreen();
        else if ((elem as any).msRequestFullscreen) (elem as any).msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
        else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen();
        else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', () => {
      estaEnFullscreen = !!document.fullscreenElement;
      boton.style.backgroundImage = estaEnFullscreen
        ? 'url("assets/leaflet/achicar-mapa.png")'
        : 'url("assets/leaflet/agrandar-mapa.png")';
    });

    return container;
  };

  customFullscreenControl.addTo(this.map);
}


  const baseMaps = {
    "🗺️ OpenStreetMap": osm,
    "🛰️ Satélite (ESRI)": esriSat,
    "📷 Satélite + Nombres (ESRI)": esriSatLabels,
    "🏔️ Topográfico (OpenTopoMap)": topo,
    "🔳 Claro (Carto Positron)": cartoLight,
    "🌙 Oscuro (Carto Dark Matter)": cartoDark
  };

  this.L.control.layers(baseMaps).addTo(this.map);

  if(this.mostrarMapaReclamos && this.reclamos?.length){
  this.agregarMarcadoresReclamos();
  }else if (this.mostrarMapaObras && this.obras?.length) {
     this.agregarMarcadoresObras();


  }





 this.actualizarMapaCalor();


if (this.layersControl) {
  this.map!.removeControl(this.layersControl);
}




const overlayMaps = {
  '🧩 Puntos en el mapa': this.markerClusterGroup,
  '🔥 Mapa de Calor': this.heatLayer
};

this.layersControl = this.L.control.layers(undefined, overlayMaps, { collapsed: false }).addTo(this.map);

const legend = this.L.control({ position: 'bottomright' });

legend.onAdd = (map: any) => {
  const container = this.L.DomUtil.create('div', 'leaflet-control leaflet-bar');

  container.style.position = 'relative';

  const legendBox = this.L.DomUtil.create('div', '', container);
  legendBox.id = 'legendBox';
  legendBox.style.padding = '6px';
  legendBox.style.background = 'rgba(255,255,204,0.95)';
  legendBox.style.borderRadius = '8px';
  legendBox.style.boxShadow = '0 0 5px #999';
  legendBox.style.marginBottom = '5px';

  const legendTitle = document.createElement('h4');
  if(this.mostrarMapaObras){
    legendTitle.textContent = 'Estado de Obras';
  }else{
       legendTitle.textContent = 'Estado de Reclamos';

  }
  legendTitle.style.margin = '5px 0';
  legendTitle.id = 'legendTitle';
  legendBox.appendChild(legendTitle);

  const legendContent = document.createElement('div');
  legendContent.id = 'legendContent';
   let estados: { iconUrl: string; label: string }[] = [];
  if(this.mostrarMapaReclamos){
     estados = [
         { iconUrl: 'assets/leaflet/marker-icon-green.png', label: 'Cerrados' },
         { iconUrl: 'assets/leaflet/marker-icon-yellow.png', label: 'En proceso' },
         { iconUrl: 'assets/leaflet/marker-icon-red.png', label: 'Pendientes' },
         { iconUrl: 'assets/leaflet/marker-icon-grey.png', label: 'Otros' }
       ];
  }else if(this.mostrarMapaObras){
  estados = [
           { iconUrl: 'assets/leaflet/marker-icon-green.png', label: 'Finalizada' },
           { iconUrl: 'assets/leaflet/marker-icon-yellow.png', label: 'En ejecucion' },
           { iconUrl: 'assets/leaflet/marker-icon-red.png', label: 'Planificada' },
           { iconUrl: 'assets/leaflet/marker-icon-grey.png', label: 'Otros' }
         ];
  }



  estados.forEach(e => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.marginBottom = '6px';

    const img = document.createElement('img');
    img.src = e.iconUrl;
    img.style.width = '25px';
    img.style.height = '41px';
    img.style.marginRight = '8px';

    const span = document.createElement('span');
    span.textContent = e.label;

    item.appendChild(img);
    item.appendChild(span);
    legendContent.appendChild(item);
  });

  legendBox.appendChild(legendContent);

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'btnToggleLegend';
  toggleBtn.title = 'Ocultar leyenda';
  toggleBtn.textContent = '➖';
  toggleBtn.style.backgroundColor = 'white';
  toggleBtn.style.border = '2px solid #ccc';
  toggleBtn.style.borderRadius = '50%';
  toggleBtn.style.width = '32px';
  toggleBtn.style.height = '32px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.fontSize = '18px';
  toggleBtn.style.boxShadow = '0 0 5px #999';
  toggleBtn.style.display = 'flex';
  toggleBtn.style.justifyContent = 'center';
  toggleBtn.style.alignItems = 'center';
  toggleBtn.style.margin = 'auto';

  let visible = true;

  toggleBtn.onclick = () => {
    visible = !visible;
    legendBox.style.display = visible ? 'block' : 'none';
    toggleBtn.textContent = visible ? '➖' : '➕';
    toggleBtn.title = visible ? 'Ocultar leyenda' : 'Mostrar leyenda';
  };

  container.appendChild(toggleBtn);

  this.L.DomEvent.disableClickPropagation(container);
  return container;
};

 legend.addTo(this.map);
  setTimeout(() => {
    this.map?.invalidateSize();
  }, 400);
}

toggleLeyenda() {
  this.leyendaVisible = !this.leyendaVisible;
  const leyendaDiv = document.getElementById('leyenda-reclamos');
  if (leyendaDiv) {
    leyendaDiv.style.display = this.leyendaVisible ? 'block' : 'none';
  }
}

mostrarMapaReclamosBoton() {
  this.mostrarMapaReclamos = !this.mostrarMapaReclamos;
  this.mostrarGraficosReclamos=false;
  this.mostrarInicio=false;
  this.tipoGrafico=false;
  this.mostrarGraficosObras=false;
  this.mostrarMapaObras=false;
  this.tipoGraficoObra=false;
  this.chatGpt=false;
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

  this.markerClusterGroup = this.L.markerClusterGroup();

  this.reclamos.forEach(reclamo => {
    if (reclamo.direccion?.latitud && reclamo.direccion?.longitud) {
      const estado = reclamo.estado?.descripcion;
      let iconUrl = 'assets/leaflet/marker-icon-grey.png'; // default

      if (estado === 'Cerrado') {
        iconUrl = 'assets/leaflet/marker-icon-green.png';
      } else if (estado === 'En Proceso') {
        iconUrl = 'assets/leaflet/marker-icon-yellow.png';
      }else if (estado === 'Abierto') {
               iconUrl = 'assets/leaflet/marker-icon-red.png';
             }

      const icono = this.L.icon({
        iconUrl,
        shadowUrl: 'assets/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const marker = this.L.marker(
        [reclamo.direccion.latitud, reclamo.direccion.longitud],
        { icon: icono, estado: estado || 'Otro' }
      ).bindPopup(`
         <b>${reclamo.nombre || ''}</b><br>
         <b>Estado:</b> ${estado || ''}<br>
         <b>Tipo:</b> ${reclamo.tipo_reclamo?.descripcion || ''}<br>
         <b>Tiempo de resolución:</b> ${reclamo.tiempo_resolucion || ''}<br>
         <b>Fecha:</b> ${reclamo.fecha_reclamo ? new Date(reclamo.fecha_reclamo).toISOString().slice(0, 10) : 'N/D'}<br>
         <b>Nivel de satisfacción:</b> ${reclamo.nivel_satisfaccion?.descripcion || ''}<br>
         <b>Localidad:</b> ${reclamo.direccion?.localidad || ''}<br>
         <b>Barrio:</b> ${reclamo.direccion?.barrio || ''}<br>
         <b>Calle y número:</b> ${reclamo.direccion?.calle || ''} ${reclamo.direccion?.numeroCalle || ''}
       `);

      this.markerClusterGroup.addLayer(marker);
    }
  });

  // Tooltip en clusters con desglose por estado
  this.markerClusterGroup.on('clustermouseover', (a: any) => {
    const markers = a.layer.getAllChildMarkers();
    const conteo = { Cerrado: 0, 'En Proceso': 0, Otro: 0 };

    markers.forEach((marker: any) => {
      const estado = marker.options.estado;
      if (estado === 'Cerrado') conteo.Cerrado++;
      else if (estado === 'En Proceso') conteo['En Proceso']++;
      else conteo.Otro++;
    });

    const popup = this.L.popup()
      .setLatLng(a.layer.getLatLng())
      .setContent(`
        <b>Reclamos agrupados:</b><br>
        ✅ Cerrados: ${conteo.Cerrado}<br>
        ⏳ En Proceso: ${conteo['En Proceso']}<br>
        ❗ Otros: ${conteo.Otro}
      `)
      .openOn(this.map);
  });

  this.markerClusterGroup.on('clustermouseout', () => {
    this.map!.closePopup();
  });

 const mostrarPuntos = (document.getElementById('checkboxTogglePuntos') as HTMLInputElement)?.checked ?? true;

 if (mostrarPuntos) {
   this.map.addLayer(this.markerClusterGroup);
 }

}

actualizarAgrupamientoMapa() {
  this.actualizarMapaCalor();
}

actualizarMapaCalor(): void {
  if (!this.map || !this.reclamos) return;

  // Eliminar heatLayer anterior si existe
  if (this.heatLayer) {
    this.map.removeLayer(this.heatLayer);
  }

  let heatPoints: [number, number][] = [];

  if (this.mostrarMapaReclamos) {
    if (this.grupoPorCalor === 'estado') {
      heatPoints = this.reclamos
        .filter(r => r.estado?.descripcion !== 'Cerrado' && r.direccion.latitud && r.direccion.longitud)
        .map(r => [r.direccion.latitud!, r.direccion.longitud!] as [number, number]);
    } else if (this.grupoPorCalor === 'satisfaccion') {
      heatPoints = this.reclamos
        .filter(r =>
          (r.nivel_satisfaccion.descripcion === 'Muy Insatisfecho' ||
           r.nivel_satisfaccion.descripcion === 'Insatisfecho' ||
           r.nivel_satisfaccion.descripcion === 'Muy Insatisfecha') &&
          r.direccion.latitud && r.direccion.longitud)
        .map(r => [r.direccion.latitud!, r.direccion.longitud!] as [number, number]);
    }
  } else if (this.mostrarMapaObras) {
    if (this.grupoPorCalorObra === 'estado') {
      heatPoints = this.obras
        .filter(o => o.estado?.descripcion !== 'Finalizada' && o.direccion.latitud && o.direccion.longitud)
        .map(o => [o.direccion.latitud!, o.direccion.longitud!] as [number, number]);
    } else if (this.grupoPorCalorObra === 'fechaEstimadaAtrasada') {
      const hoy = new Date();
      heatPoints = this.obras
        .filter(o =>
          o.fecha_estimada_finalizacion &&
          new Date(o.fecha_estimada_finalizacion) < hoy &&
          (!o.fecha_real_finalizacion || new Date(o.fecha_real_finalizacion) > hoy) &&
          o.direccion.latitud != null && o.direccion.longitud != null)
        .map(o => [o.direccion.latitud!, o.direccion.longitud!] as [number, number]);
    }
  }

  // Crear heatLayer nuevo
  this.heatLayer = (this.L as any).heatLayer(heatPoints, {
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

  // Actualizar las capas en el mapa y los checkboxes
  this.actualizarOverlayMaps();
}

private actualizarOverlayMaps(): void {
  if (!this.map) return;

  // 🔁 Remover control anterior
  if (this.layersControl) {
    this.map.removeControl(this.layersControl);
  }

  // ❌ No agregues los layers acá manualmente
  // ✅ Solo definilos para el control
  const overlayMaps = {
    '🧩 Puntos en el mapa': this.markerClusterGroup,
    '🔥 Mapa de Calor': this.heatLayer
  };

  // ✅ Crear nuevo control con los objetos recién recreados
  this.layersControl = this.L.control.layers(undefined, overlayMaps, { collapsed: false }).addTo(this.map);
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


//OBRAS

  mostrarGraficosObrasBoton(){
    this.mostrarGraficosObras=!this.mostrarGraficosObras;
    this.mostrarGraficosReclamos=false;
    this.mostrarInicio=false;
    this.mostrarMapaReclamos=false;
    this.mostrarMapaObras=false;
    this.tipoGrafico=false;
    this.chatGpt=false;
    this.tipoGraficoObra=!this.tipoGraficoObra;

    this.cargarFiltrosObra();
    this.cargarGraficoObras();

  }

  mostrarMapaObrasBoton(){
     this.mostrarMapaObras=!this.mostrarMapaObras;
     this.mostrarGraficosObras=false;
     this.mostrarInicio=false;
     this.mostrarMapaReclamos=false;
     this.mostrarGraficosReclamos=false;
     this.tipoGrafico=false;
     this.tipoGraficoObra=false;
     this.chatGpt=false;

     this.cargarFiltrosObra();

      if (this.mostrarMapaObras) {
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

cargarFiltrosObra(){
   this.direccionesService.obtenerLocalidades().subscribe({
          next: (data: string[]) => {
            this.localidadesDisponibles = data;
            console.log('localidades cargadas:', this.localidadesDisponibles);
          },
          error: (err) => {
            console.error('Error al cargar localidades:', err);
          }
        });





              this.estadoObrasService.obtenerDescripciones().subscribe({
                              next: (data: string[]) => {
                                this.estadosObraDisponibles = data;
                                console.log('estados cargados:', this.estadosObraDisponibles);
                              },
                              error: (err) => {
                                console.error('Error al cargar estados:', err);
                              }
                            });
                      this.tipoObrasSservice.obtenerDescripciones().subscribe({
                                next: (data: string[]) => {
                                  this.tiposObraDisponibles = data;
                                  console.log('tipos cargados:', this.tiposObraDisponibles);
                                },
                                error: (err) => {
                                  console.error('Error al cargar tipos:', err);
                                }
                              });

}


aplicarFiltrosObra() {
  let params = new HttpParams();

  // Fechas obligatorias (siempre se envían)
  params = params.set('fechaInicioDesde', this.fechaDesdeInicioObra && this.fechaDesdeInicioObra !== '' ? this.fechaDesdeInicioObra + 'T00:00:00' : 'null');
  params = params.set('fechaInicioHasta', this.fechaHastaInicioObra && this.fechaHastaInicioObra !== '' ? this.fechaHastaInicioObra + 'T23:59:59' : 'null');
  params = params.set('fechaEstimadaFinDesde', this.fechaDesdeEstiObra && this.fechaDesdeEstiObra !== '' ? this.fechaDesdeEstiObra + 'T00:00:00' : 'null');
  params = params.set('fechaEstimadaFinHasta', this.fechaHastaEstiObra && this.fechaHastaEstiObra !== '' ? this.fechaHastaEstiObra + 'T23:59:59' : 'null');
  params = params.set('fechaRealFinDesde', this.fechaDesdeRealObra && this.fechaDesdeRealObra !== '' ? this.fechaDesdeRealObra + 'T00:00:00' : 'null');
  params = params.set('fechaRealFinHasta', this.fechaHastaRealObra && this.fechaHastaRealObra !== '' ? this.fechaHastaRealObra + 'T23:59:59' : 'null');

  params = params.set('tipoObra', this.tipoObraSeleccionado || '');
  params = params.set('estado', this.estadoObraSeleccionado || '');
  params = params.set('avanceFisicoMayor', this.tiempAvanceMayor != null ? this.tiempAvanceMayor.toString() : '');
  params = params.set('avanceFisicoMenor', this.tiempAvanceMenor != null ? this.tiempAvanceMenor.toString() : '');
  params = params.set('montoPresupuestadoMayor', this.montoPresuMayor != null ? this.montoPresuMayor.toString() : '');
  params = params.set('montoPresupuestadoMenor', this.montoPresuMenor != null ? this.montoPresuMenor.toString() : '');
  params = params.set('montoEjecutadoMayor', this.montoEjeMayor != null ? this.montoEjeMayor.toString() : '');
  params = params.set('montoEjecutadoMenor', this.montoEjeMenor != null ? this.montoEjeMenor.toString() : '');
  params = params.set('localidad', this.localidadSeleccionada || '');
  params = params.set('barrio', this.barrioSeleccionado || '');

  this.obrasService.obtenerObrasFiltradas(params).subscribe((data: ObraConDescripciones[]) => {
    this.obras = data;
    console.log("obras obtenidas:", this.obras);

    if (this.mostrarGraficosObras) {
      this.cargarGraficoObras();
    }

    if (this.mostrarMapaObras) {
      this.agregarMarcadoresObras();

      // Solo si el mapa ya existe
      if (this.map) {
        // Agrega capas según estado actual
        if (this.markerClusterGroup) {
          this.map.addLayer(this.markerClusterGroup);
        }
        if (this.heatLayer) {
          this.map.addLayer(this.heatLayer);
        }

        // Eliminar control de capas previo si existe
        if (this.layersControl) {
          this.map.removeControl(this.layersControl);
        }

        // Crear nuevo control de capas
        const overlayMaps = {
          '🧩 Obras Agrupadas': this.markerClusterGroup,
          '🔥 Mapa de Calor': this.heatLayer
        };

        this.layersControl = this.L.control.layers(undefined, overlayMaps, { collapsed: false }).addTo(this.map);
      }
    }
  });
}
cargarGraficoObras(): void {
  const conteo: { [clave: string]: number } = {};
  const coloresVisibles = [
    '#a3c9f1', '#b6e3ac', '#ffd59e', '#f7a6b0',
    '#ffe39f', '#c3eaf7', '#dab6fc', '#ffbfa3'
  ];

  this.obras.forEach(obra => {
    let clave = 'Desconocido';

    switch (this.grupoPorObra) {
      case 'estado':
        clave = obra.estado?.descripcion || 'Desconocido';
        break;
      case 'localidad':
        clave = obra.direccion.localidad || 'Desconocido';
        break;
      case 'barrio':
        clave = obra.direccion.barrio || 'Desconocido';
        break;
      case 'tipo':
        clave = obra.tipo_obra?.descripcion || 'Desconocido';
        break;

      case 'mes':
        clave = this.getClavePorMes(obra.fecha_inicio);
        break;
      case 'mesFinReal':
        clave = this.getClavePorMes(obra.fecha_real_finalizacion);
        break;
      case 'mesFinEstimad':
        clave = this.getClavePorMes(obra.fecha_estimada_finalizacion);
        break;

      case 'avanceFisico':
        const avance = obra.avance_fisico || 0;
        if (avance < 25) clave = 'Menos de 25%';
        else if (avance <= 65) clave = 'menos de 65%';
        else clave = 'Más de 65%';
        break;

      case 'montoPresupuestado':
        const presupuesto = obra.monto_presupuestado || 0;
        if (presupuesto < 500000) clave = 'Menos de 500000$';
        else if (presupuesto <= 2000000) clave = 'menos de 2000000$';
        else clave = 'Más de 2000000$';
        break;

      case 'montoEjecutado':
        const ejecutado = obra.monto_ejecutado || 0;
        if (ejecutado < 500000) clave = 'Menos de 500000$';
        else if (ejecutado <= 2000000) clave = 'menos de 2000000$';
        else clave = 'Más de 2000000$';
        break;

      default:
        clave = 'Otro';
    }

    conteo[clave] = (conteo[clave] || 0) + 1;
  });

  // ORDENAR si se agrupa por mes
 let labels: string[];
 let dataValues: number[];

 if (
   this.grupoPorObra === 'mes' ||
   this.grupoPorObra === 'mesFinReal' ||
   this.grupoPorObra === 'mesFinEstimad'
 ) {
   const auxiliar: { label: string, date: Date, cantidad: number }[] = [];

   for (const label in conteo) {
     const partes = label.split(' de ');
     if (partes.length === 2) {
       const mes = partes[0].toLowerCase();
       const anio = partes[1];
       const mesNum = this.nombreMesAMesNumero(mes);
       const fecha = new Date(`${anio}-${mesNum}-01`);
       auxiliar.push({ label, date: fecha, cantidad: conteo[label] });
     } else {
       auxiliar.push({ label, date: new Date(0), cantidad: conteo[label] }); // fallback
     }
   }

   auxiliar.sort((a, b) => a.date.getTime() - b.date.getTime());
   labels = auxiliar.map(item => item.label);
   dataValues = auxiliar.map(item => item.cantidad);
 } else {
   labels = Object.keys(conteo);
   dataValues = labels.map(label => conteo[label]);
 }
  const backgroundColors = labels.map((_, index) => coloresVisibles[index % coloresVisibles.length]);
  const borderColors = backgroundColors.map(color => color);

  this.chartDataObras = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        label: 'Cantidad por ' + this.grupoPorObra,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }
    ]
  };
}
 actualizarAgrupamientoObras(){
  this.cargarGraficoObras();
 }

private getClavePorMes(fechaStr: string | null): string {
  if (!fechaStr) return 'Sin fecha';
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return 'Sin fecha';
  return fecha.toLocaleString('default', { month: 'long', year: 'numeric' });
}

private nombreMesAMesNumero(nombreMes: string): string {
  const meses: { [key: string]: string } = {
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
  };
  return meses[nombreMes.toLowerCase()] || '01';
}


private agregarMarcadoresObras() {
  if (!this.map || !this.obras) return;

  if (this.markerClusterGroup) {
    this.markerClusterGroup.clearLayers();
    this.map.removeLayer(this.markerClusterGroup);
    this.markerClusterGroup = null;
  }

  this.markerClusterGroup = this.L.markerClusterGroup();

  this.obras.forEach(obra => {
    const direccion = obra.direccion;
    if (direccion?.latitud && direccion?.longitud) {
      const estado = obra.estado?.descripcion;
      let iconUrl = 'assets/leaflet/marker-icon-grey.png';
      if (estado === 'Finalizada') {
        iconUrl = 'assets/leaflet/marker-icon-green.png';
      } else if (estado === 'En ejecución') {
        iconUrl = 'assets/leaflet/marker-icon-yellow.png';
      }else if (estado === 'Planificada') {
               iconUrl = 'assets/leaflet/marker-icon-red.png';
             }

      const icono = this.L.icon({
        iconUrl,
        shadowUrl: 'assets/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const marker = this.L.marker(
        [direccion.latitud, direccion.longitud],
        { icon: icono, estado: estado || 'Otro' }
      ).bindPopup(`
         <b>${obra.nombre || ''}</b><br>
         <b>Estado:</b> ${estado || ''}<br>
         <b>Tipo:</b> ${obra.tipo_obra?.descripcion || ''}<br>
         <b>Avance:</b> ${obra.avance_fisico || 0}%<br>
         <b>Monto presupuestado:</b> ${obra.monto_presupuestado || 0}<br>
         <b>Monto ejecutado:</b> ${obra.monto_ejecutado || 0}<br>
         <b>Inicio:</b> ${obra.fecha_inicio?.slice(0, 10) || 'N/D'}<br>
         <b>Finalizacion estimada:</b> ${obra.fecha_estimada_finalizacion?.slice(0, 10) || 'N/D'}<br>
<b>Finalización real:</b> ${
  obra.fecha_real_finalizacion &&
  new Date(obra.fecha_real_finalizacion) < new Date()
    ? obra.fecha_real_finalizacion.slice(0, 10)
    : 'N/D'
}<br>         <b>Localidad:</b> ${obra.direccion.localidad || ''}<br>
         <b>Barrio:</b> ${obra.direccion.barrio || ''}<br>
         <b>Calle y número:</b> ${obra.direccion.calle || ''} ${obra.direccion.numeroCalle || ''}
       `);

      this.markerClusterGroup.addLayer(marker);
    }
  });
    // Tooltip en clusters con desglose por estado
    this.markerClusterGroup.on('clustermouseover', (a: any) => {
      const markers = a.layer.getAllChildMarkers();
      const conteo = { Finalizada: 0, 'En ejecución': 0, Otro: 0 };

      markers.forEach((marker: any) => {
        const estado = marker.options.estado;
        if (estado === 'Finalizada') conteo.Finalizada++;
        else if (estado === 'En ejecución') conteo['En ejecución']++;
        else conteo.Otro++;
      });

      const popup = this.L.popup()
        .setLatLng(a.layer.getLatLng())
        .setContent(`
          <b>Obras agrupadas:</b><br>
          ✅ Finalizadas: ${conteo.Finalizada}<br>
          ⏳ En Ejecucion: ${conteo['En ejecución']}<br>
          ❗ Otras: ${conteo.Otro}
        `)
        .openOn(this.map);
    });

    this.markerClusterGroup.on('clustermouseout', () => {
      this.map!.closePopup();
    });

    // Agregar al mapa
    this.map.addLayer(this.markerClusterGroup);
  }



//GPT

enviarMensaje() {
  const prompt = this.mensajeUsuario.trim();
  if (!prompt) return;

  this.mensajes.push({ autor: 'usuario', texto: prompt });
  this.mensajeUsuario = '';

  const indexPensando = this.mensajes.push({
    autor: 'ia',
    texto: '⏳ Pensando...'
  }) - 1;

const historialFormateado = this.mensajes.map(m => ({
  rol: m.autor === 'usuario' ? 'user' as const : 'assistant' as const,
  content: m.texto
}));

const historialReciente = historialFormateado.slice(-8);

  // Llamar al servicio GPT
   this.gptService.preguntar({ prompt, historial: historialReciente }).subscribe({
   next: (res) => {
      const respuestaIA = res.respuesta || '🤖 No se encontró respuesta.';
      this.mensajes[indexPensando].texto = respuestaIA;
    },
    error: () => {
      this.mensajes[indexPensando].texto = '❌ Error al consultar la IA.';
    }
  });
}


 mostrarChatGpt(){

 this.chatGpt=!this.chatGpt;

   this.mostrarInicio=false;
   this.mostrarGraficosReclamos=false;
   this.mostrarMapaReclamos=false;
   this.mostrarMapaObras=false;
   this.mostrarGraficosObras=false;
   this.tipoGrafico=false;
   this.tipoGraficoObra=false;


 }

ActualizarBarrios(){
this.direccionesService.obtenerBarrios(this.localidadSeleccionada).subscribe({
                next: (data: string[]) => {
                  this.barriosDisponibles = data;
                  console.log('barrios cargados:', this.barriosDisponibles);
                },
                error: (err) => {
                  console.error('Error al cargar barrios:', err);
                }
              });

}

volverAlLogin(){

this.router.navigate(['./login']);
}

  MostrarSubBotonesReclamo(){
    this.mostrarSubBotonReclamos = !this.mostrarSubBotonReclamos;
  }

MostrarSubBotonesObra(){
this.mostrarSubBotonObras=!this.mostrarSubBotonObras;

}





}
