import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

export interface IndicadorComparadoDTO {
  nombre: string;
  descripcion: string;
  unidad: string;
  direccion: string;
  valorActual: number;
  variacion: number;
}

export interface TarjetaIndicador {
  principal: IndicadorComparadoDTO;
  suplentes: IndicadorComparadoDTO[];
}

export interface TarjetaConEstado extends TarjetaIndicador {
  indiceSuplente: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class IndicadorObraService {
  private baseUrl = 'http://localhost:8080/api/indicadores/obras';

  constructor(private http: HttpClient) {}

obtenerIndicadoresConSuplentes(): Observable<TarjetaIndicador[]> {
  return forkJoin({
    principales: this.http.get<IndicadorComparadoDTO[]>(`${this.baseUrl}/principales-detalle`),
    suplentes: this.http.get<IndicadorComparadoDTO[]>(`${this.baseUrl}/suplentes-detalle`)
  }).pipe(
    map(({ principales, suplentes }) => {
      const tarjetas: TarjetaIndicador[] = [];


      tarjetas.push({
        principal: principales[0],
        suplentes: [suplentes[0], suplentes[1]]
      });

      tarjetas.push({
        principal: principales[1],
        suplentes: [suplentes[2], suplentes[3]]
      });

      return tarjetas;
    })
  );
}
}
