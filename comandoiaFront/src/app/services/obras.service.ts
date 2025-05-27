
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


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
    avance_fisico: number;
    monto_presupuestado: number;
    monto_ejecutado: number;

  fecha_inicio: string;
fecha_estimada_finalizacion: string;
fecha_real_finalizacion: string;

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
export class ObrasService {
  private baseUrl = 'http://localhost:8080/api/ObrasPublicas';

  constructor(private http: HttpClient) {}


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

}








