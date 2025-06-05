
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface Obra{
  id?:number;
  nombre: string;
  descripcion: string;
  tipo_obra: {
    id: number;
  };
    estado: {
      id: number;
    };
    avance_fisico: number| null;
    monto_presupuestado: number| null;
    monto_ejecutado: number| null;

  fecha_inicio: string | null;
fecha_estimada_finalizacion: string | null;
fecha_real_finalizacion: string | null;

  direccion: {
    localidad: string;
    barrio: string;
    calle: string;
    numeroCalle: number | null;

  };
}


export interface ObraConDescripciones{
  id?:number;
  nombre: string;
  descripcion: string;
  tipo_obra: {
    id: number;
    descripcion:string;
  };
    estado: {
      id: number;
      descripcion:string;
    };
    avance_fisico: number| null;
    monto_presupuestado: number| null;
    monto_ejecutado: number| null;

  fecha_inicio: string | null;
fecha_estimada_finalizacion: string | null;
fecha_real_finalizacion: string | null;

  direccion: {
    localidad: string;
    barrio: string;
    calle: string;
    numeroCalle: number | null;
          latitud:number | null;
                longitud:number | null
  };
}

@Injectable({
  providedIn: 'root'
})
export class ObrasService {
  private baseUrl = 'http://localhost:8080/api/ObrasPublicas';

  constructor(private http: HttpClient) {}


  obtenerObras(): Observable<ObraConDescripciones[]> {
    return this.http.get<ObraConDescripciones[]>(`${this.baseUrl}`);
  }

importarDesdeExcel(formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/excel/upload`, formData);
}

crearObra(obra:Obra): Observable<Obra>{
return this.http.post<Obra>(`${this.baseUrl}`,obra);

}

  existeNombreObra(nombreObra: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe-nombre/${nombreObra}`);
  }

       buscarObrasPorNombre(nombre: string): Observable<Obra[]> {
          return this.http.get<Obra[]>(`${this.baseUrl}/buscarObraPorNombre/${nombre}`);
        }

             actualizarObra(id: number, obra: Obra): Observable<any> {
               return this.http.put(`${this.baseUrl}/${id}`, obra);
             }

obtenerObrasFiltradas(params: HttpParams) {
  return this.http.get<ObraConDescripciones[]>(`${this.baseUrl}/buscarObras`, { params });
}


}








