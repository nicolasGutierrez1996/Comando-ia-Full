import { Component, OnInit } from '@angular/core';
import { IndicadorObraService } from '../../../services/indicadorObra.service';
import { IndicadorService, TarjetaConEstado } from '../../../services/indicador.service';
import { ReclamosService, ReclamoConDescripciones } from '../../../services/reclamos.service';

import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { AuthService } from '../../../services/authService.service';
import { GptService } from '../../../services/gpt.service';
import { MarkdownModule } from 'ngx-markdown';

interface MensajeIA {
  autor: 'usuario' | 'ia';
  texto: string;
}

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule,MarkdownModule
  ],
  standalone: true
})
export class InicioComponent implements OnInit {
  indicadoresTarjetas: TarjetaConEstado[] = [];
  indicadoresTarjetasObras: TarjetaConEstado[] = [];
  reclamos: ReclamoConDescripciones[] = [];

  // ✅ Datos para el gráfico de demandas sociales
  demandasData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  // ✅ Opciones para gráfico de tipo doughnut
pieOptions: ChartOptions<'pie'> = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      intersect: true, // 👈 Asegura que solo se muestre si está exactamente sobre el sector
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.raw}`,
        labelColor: (ctx) => {
          const bg = Array.isArray(ctx.dataset.backgroundColor)
            ? ctx.dataset.backgroundColor[ctx.dataIndex] as string
            : '#ccc';
          return {
            borderColor: 'transparent',
            backgroundColor: bg
          };
        }
      }
    }
  },
  interaction: {
    intersect: true,
    // 👇 remover "mode" o usar "point" explícitamente
    mode: 'point'
  }
};

satisfaccionMensualData: ChartData<'bar'> = {
  labels: [],
  datasets: []
};
lineOptions: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (ctx) => {
           const raw = ctx.raw as number;
            const mostrado = raw < 0.5 ? 0 : raw;
            return `${mostrado}% satisfacción`;
        }
      },
      filter: (ctx) => {
          // 👇 Fuerza mostrar tooltip aunque el valor sea 0.01
          return true;
        }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (tickValue: string | number) => {
          const valor = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
          return valor < 0.5 ? '0%' : `${valor}%`;
        }
      }
    }
  }
};

barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value: number) => `${value}%`
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.parsed.y}%`
      }
    }
  }
};
nombreUsuario:String = '';
rolUsuario:String = '';
mensajeUsuario:String='';
mensajes: MensajeIA[] = [];


  constructor(
    private indicadorService: IndicadorService,
    private indicadorServiceObras: IndicadorObraService,
    private reclamosService: ReclamosService,
    private authService: AuthService,
    private gptService:GptService
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = this.authService.getUsuario();
    this.rolUsuario = this.authService.getRol();
    this.cargarIndicadores();
    this.cargarIndicadoresObras();
    this.cargarGraficoDemandasSociales();
    this.cargarGraficoNivelSatisfaccion();

  }

cargarGraficoNivelSatisfaccion(): void {
  const conteo: { [mes: string]: { total: number; satisfechos: number } } = {};

  this.reclamosService.obtenerReclamos().subscribe((reclamos: ReclamoConDescripciones[]) => {
    reclamos.forEach((r) => {
      const nivel = r.nivel_satisfaccion?.descripcion;
      const fecha = r.fecha_reclamo;
      if (nivel && fecha) {
        const date = new Date(fecha);
        const mes = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

        if (!conteo[mes]) {
          conteo[mes] = { total: 0, satisfechos: 0 };
        }

        conteo[mes].total++;
        if (['Muy satisfecho', 'Satisfecho'].includes(nivel)) {
          conteo[mes].satisfechos++;
        }
      }
    });

    // 🔽 Ordenar los meses cronológicamente
    const labelsOrdenados = Object.keys(conteo).sort((a, b) => {
      const [mesA, anioA] = a.split('/').map(Number);
      const [mesB, anioB] = b.split('/').map(Number);
      return new Date(anioA, mesA - 1).getTime() - new Date(anioB, mesB - 1).getTime();
    });

    const datos = labelsOrdenados.map(mes => {
      const { total, satisfechos } = conteo[mes];
      const porcentaje = total > 0 ? Math.round((satisfechos / total) * 100) : 0;
      return porcentaje === 0 ? 0.01 : porcentaje;  // fuerza barra mínima visible
    });

    this.satisfaccionMensualData = {
      labels: labelsOrdenados,
      datasets: [{
        label: 'Satisfacción mensual',
        data: datos,
        backgroundColor: datos.map(valor => valor === 0.01 ? '#9e9e9e' : '#4da6ff'),
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        borderRadius: 4
      }]
    };

    this.lineOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const raw = ctx.raw as number;
              const mes = ctx.label;
              const total = conteo[mes]?.total || 0;
              const mostrado = raw < 0.5 ? 0 : raw;
              return `${mostrado}% satisfacción (${total} reclamos)`;
            }
          },
          filter: () => true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (tickValue: string | number) => {
              const valor = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
              return valor < 0.5 ? '0%' : `${valor}%`;
            }
          }
        }
      }
    };
  });
}
  cargarGraficoDemandasSociales(): void {
    this.reclamosService.obtenerReclamos().subscribe((reclamos: ReclamoConDescripciones[]) => {
      const conteoPorTipo: { [tipo: string]: number } = {};

      reclamos.forEach(reclamo => {
        const tipo = reclamo.tipo_reclamo?.descripcion || 'Otro';
        conteoPorTipo[tipo] = (conteoPorTipo[tipo] || 0) + 1;
      });

      const labels = Object.keys(conteoPorTipo);
      const valores = Object.values(conteoPorTipo);

      this.demandasData = {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: [
           '#4285F4', '#FF6384', '#FFCE56', '#66BB6A', '#9575CD',
                 '#26C6DA', '#F06292', '#FF7043', '#BA68C8', '#9CCC65',
                 '#00ACC1', '#FFB74D', '#7986CB', '#D4E157', '#8D6E63'
          ]
        }]
      };
    });
  }

  cargarIndicadores(): void {
    this.indicadorService.obtenerIndicadoresConSuplentes().subscribe(data => {
      this.indicadoresTarjetas = data.map((t) => ({
        principal: t.principal,
        suplentes: t.suplentes,
        indiceSuplente: null
      }));
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
      tarjeta.indiceSuplente = null;
    }
  }

  cargarIndicadoresObras(): void {
    this.indicadorServiceObras.obtenerIndicadoresConSuplentes().subscribe(data => {
      console.log('🟡 Indicadores de obras:', data);
      this.indicadoresTarjetasObras = data.map((t) => ({
        principal: t.principal,
        suplentes: t.suplentes,
        indiceSuplente: null
      }));
    }, error => {
      console.error('❌ Error al cargar indicadores de obras:', error);
    });
  }

  getColor(i: number): string {
    const bg = this.demandasData?.datasets?.[0]?.backgroundColor;
    return Array.isArray(bg) ? bg[i] as string : '#ccc'; // fallback gris
  }


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
      error: (res) => {
                const respuestaIA = res.respuesta || '❌ Error al consultar la IA.';

        this.mensajes[indexPensando].texto = respuestaIA;
      }
    });
  }



}

