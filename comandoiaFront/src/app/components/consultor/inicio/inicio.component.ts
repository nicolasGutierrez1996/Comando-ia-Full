import { Component, OnInit } from '@angular/core';
import {IndicadorObraService} from '../../../services/indicadorObra.service';
import { IndicadorService,TarjetaConEstado } from '../../../services/indicador.service';
import { CommonModule } from '@angular/common'; // ✅ necesario para *ngIf, *ngFor
import { HttpClientModule } from '@angular/common/http'; // ✅ necesario para servicios HTTP
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
    imports: [
      CommonModule,
      FormsModule,
      HttpClientModule
    ],
  standalone: true
})
export class InicioComponent implements OnInit {
indicadoresTarjetas: TarjetaConEstado[] = [];
indicadoresTarjetasObras: TarjetaConEstado[] = [];


  constructor(private indicadorService:IndicadorService,
              private indicadorServiceObras:IndicadorObraService) {}

  ngOnInit(): void {
          this.cargarIndicadores();
          this.cargarIndicadoresObras();
  }


  cargarIndicadores(): void {
    this.indicadorService.obtenerIndicadoresConSuplentes().subscribe(data => {
      console.log('📦 Indicadores crudos desde el backend:', data);

      this.indicadoresTarjetas = data.map((t, i) => {
        const tarjeta = {
          principal: t.principal,
          suplentes: t.suplentes,
          indiceSuplente: null
        };
        console.log(`✅ Tarjeta ${i + 1} armada:`, tarjeta);
        return tarjeta;
      });

      console.log('✅ Todas las tarjetas listas:', this.indicadoresTarjetas);
    }, error => {
      console.error('❌ Error al cargar indicadores:', error);
    });
  }

  cambiarVista(tarjeta: TarjetaConEstado): void {
    if (tarjeta.indiceSuplente === null) {
      tarjeta.indiceSuplente = 0;
    } else if (tarjeta.indiceSuplente < tarjeta.suplentes.length - 1) {
      tarjeta.indiceSuplente++;
    } else {
      tarjeta.indiceSuplente = null; // volver al principal
    }
  }



  cargarIndicadoresObras(): void {
    this.indicadorServiceObras.obtenerIndicadoresConSuplentes().subscribe(data => {
      console.log('📦 Indicadores crudos desde el backend:', data);

      this.indicadoresTarjetasObras = data.map((t, i) => {
        const tarjeta = {
          principal: t.principal,
          suplentes: t.suplentes,
          indiceSuplente: null
        };
        console.log(`✅ Tarjeta ${i + 1} armada:`, tarjeta);
        return tarjeta;
      });

      console.log('✅ Todas las tarjetas listas:', this.indicadoresTarjetasObras);
    }, error => {
      console.error('❌ Error al cargar indicadores:', error);
    });
  }


}
