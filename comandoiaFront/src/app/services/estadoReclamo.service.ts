import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstadoReclamo {
  id? : number,
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstadoReclamoService {
  private baseUrl = 'http://localhost:8080/api/EstadosReclamo';

  constructor(private http: HttpClient) {}

 obtenerEstadosReclamo():Observable<EstadoReclamo[]>{
   return this.http.get<EstadoReclamo[]>(`${this.baseUrl}`);
 }

crearEstadoReclamo(estadoReclamo: EstadoReclamo): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, estadoReclamo);
  }

    existeEstadoReclamo(descripcion: string): Observable<boolean> {
      return this.http.get<boolean>(`${this.baseUrl}/existe-descripcion/${descripcion}`);
    }

      buscarEstadoReclamoPorDescripcion(descripcion: string): Observable<EstadoReclamo[]> {
        return this.http.get<EstadoReclamo[]>(`${this.baseUrl}/buscarEstadoReclamoPorDescripcion/${descripcion}`);
      }

      actualizarEstadoReclamo(id: number, estadoReclamo: EstadoReclamo): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, estadoReclamo);
      }

    eliminarEstadoReclamo(id: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}/${id}`);
    }

    obtenerDescripciones():Observable<string[]>{
     return this.http.get<string[]>(`${this.baseUrl}/buscarEstadoReclamoDescripciones`);
    }
}
