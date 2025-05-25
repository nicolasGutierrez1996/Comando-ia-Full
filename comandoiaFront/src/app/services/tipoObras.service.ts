import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoObra {
  id?:number;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoObrasService {
  private baseUrl = 'http://localhost:8080/api/TipoObra';

  constructor(private http: HttpClient) {}

crearTipoObra(tipoObra: TipoObra): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, tipoObra);
  }

  existeTipoObra(tipoObra: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe-descripcion/${tipoObra}`);
  }
  buscarTipoObraPorDescripcion(descripcion: string): Observable<TipoObra[]> {
    return this.http.get<TipoObra[]>(`${this.baseUrl}/buscarTipoObraPorDescripcion/${descripcion}`);
  }

  actualizarTipoObra(id: number, tipoObra: TipoObra): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, tipoObra);
  }

  eliminarTipoObra(id:number): Observable<any> {

       return this.http.delete(`${this.baseUrl}/${id}`);

   }

}
