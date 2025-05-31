
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';


export interface Reclamo{
  id?:number;
  nombre: string;
  descripcion: string;
  tipo_reclamo: {
    id: number;
  };
  fecha_reclamo: string;
  estado: {
    id: number;
  };
  tiempo_resolucion: number;
  nivel_satisfaccion: {
    id: number;
  };
  direccion: {
    localidad: string;
    barrio: string;
    calle: string;
    numeroCalle: number | null;
  };
}

export interface ReclamoConDescripciones{
  id?:number;
  nombre: string;
  descripcion: string;
  tipo_reclamo: {
    id: number;
    descripcion: string;
  };
  fecha_reclamo: string;
  estado: {
    id: number;
    descripcion: string;
  };
  tiempo_resolucion: number;
  nivel_satisfaccion: {
    id: number;
    descripcion: string;
  };
  direccion: {
    localidad: string;
    barrio: string;
    calle: string;
    numeroCalle: number | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReclamosService {
  private baseUrl = 'http://localhost:8080/api/Reclamos';

  constructor(private http: HttpClient) {}


  obtenerReclamos(): Observable<ReclamoConDescripciones[]> {
    return this.http.get<ReclamoConDescripciones[]>(`${this.baseUrl}`);
  }

importarDesdeExcel(formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/excel/upload`, formData);
}

crearReclamo(reclamo:Reclamo): Observable<Reclamo>{
return this.http.post<Reclamo>(`${this.baseUrl}`,reclamo);

}

  existeNombreReclamo(nombreReclamo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe-nombre/${nombreReclamo}`);
  }

       buscarReclamosPorNombre(nombre: string): Observable<Reclamo[]> {
          return this.http.get<Reclamo[]>(`${this.baseUrl}/buscarReclamoPorNombre/${nombre}`);
        }

             actualizarReclamo(id: number, reclamo: Reclamo): Observable<any> {
               return this.http.put(`${this.baseUrl}/${id}`, reclamo);
             }

obtenerReclamosFiltrados(params: HttpParams) {
  return this.http.get<ReclamoConDescripciones[]>(`${this.baseUrl}/filtrarReclamos`, { params });
}

}








