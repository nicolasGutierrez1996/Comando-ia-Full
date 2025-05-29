import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ObrasService,Obra} from '../../services/obras.service';
import { ReclamosService,ReclamoConDescripciones} from '../../services/reclamos.service';
import { ChartData, ChartOptions } from 'chart.js';
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


reclamos: ReclamoConDescripciones[] = [];
obras:Obra [] = [];

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Cantidad por Estado' }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  };

constructor(private router: Router, private reclamosService:ReclamosService,
   private obrasService:ObrasService) {}

 ngOnInit(): void {
    this.reclamosService.obtenerReclamos().subscribe((data: ReclamoConDescripciones[]) => {


      this.reclamos = data;
       console.log('Reclamos recibidos:', this.reclamos);
      this.cargarGraficoPorEstado();
    });
  }


  mostrarInicioBoton(){
  this.mostrarInicio=!this.mostrarInicio;
  this.mostrarGraficosReclamos=false;

  }
  mostrarGraficosReclamosBoton(){
    this.mostrarGraficosReclamos=!this.mostrarGraficosReclamos;
    this.mostrarInicio=false;
  }


  cargarGraficoPorEstado(): void {
    const conteo: { [estado: string]: number } = {};

    this.reclamos.forEach(reclamo => {
      const estado = reclamo.estado?.descripcion || 'Desconocido';
      conteo[estado] = (conteo[estado] || 0) + 1;
    });

    // Reasignar el objeto para que Angular detecte el cambio y refresque el gráfico
    this.barChartData = {
      labels: Object.keys(conteo),
      datasets: [
        { data: Object.values(conteo), label: 'Cantidad por Estado' }
      ]
    };
  }



}
