import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoReclamo {
  id?:number;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoReclamosService {
  private baseUrl = 'http://localhost:8080/api/TipoReclamo';

  constructor(private http: HttpClient) {}

 obtenerTiposReclamo():Observable<TipoReclamo[]>{
   return this.http.get<TipoReclamo[]>(`${this.baseUrl}`);
 }

crearTipoReclamo(tipoReclamo: TipoReclamo): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, tipoReclamo);
  }

  existeTipoReclamo(tipoReclamo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe-descripcion/${tipoReclamo}`);
  }
  buscarTipoReclamoPorDescripcion(descripcion: string): Observable<TipoReclamo[]> {
    return this.http.get<TipoReclamo[]>(`${this.baseUrl}/buscarTipoReclamoPorDescripcion/${descripcion}`);
  }

  actualizarTipoReclamo(id: number, tipoReclamo: TipoReclamo): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, tipoReclamo);
  }

  eliminarTipoReclamo(id:number): Observable<any> {

       return this.http.delete(`${this.baseUrl}/${id}`);

   }
}
