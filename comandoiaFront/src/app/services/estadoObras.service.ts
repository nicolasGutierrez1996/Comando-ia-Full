import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstadoObra {
  id? : number,
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstadoObrasService {
  private baseUrl = 'http://localhost:8080/api/EstadosObra';

  constructor(private http: HttpClient) {}

obtenerEstadosObra():Observable<EstadoObra[]>{
 return this.http.get<EstadoObra[]>(`${this.baseUrl}`);
}

crearEstadoObra(estadoObra: EstadoObra): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, estadoObra);
  }

    existeEstadoObra(descripcion: string): Observable<boolean> {
      return this.http.get<boolean>(`${this.baseUrl}/existe-descripcion/${descripcion}`);
    }

      buscarEstadoObraPorDescripcion(descripcion: string): Observable<EstadoObra[]> {
        return this.http.get<EstadoObra[]>(`${this.baseUrl}/buscarEstadoObraPorDescripcion/${descripcion}`);
      }

      actualizarEstadoObra(id: number, estadoObra: EstadoObra): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, estadoObra);
      }

    eliminarEstadoObra(id: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}/${id}`);
    }

        obtenerDescripciones():Observable<string[]>{
         return this.http.get<string[]>(`${this.baseUrl}/buscarEstadoObraDescripciones`);
        }
}
