import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NivelReclamo {
  id?:number;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class NivelSatisfaccionService {
  private baseUrl = 'http://localhost:8080/api/TipoNivelSatisfaccion';

  constructor(private http: HttpClient) {}

 obtenerNivelesReclamo():Observable<NivelReclamo[]>{
   return this.http.get<NivelReclamo[]>(`${this.baseUrl}`);
 }


crearTipoNivel(nivelReclamo: NivelReclamo): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, nivelReclamo);
  }

  existeTipoNivel(nivelReclamo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe-descripcion/${nivelReclamo}`);
  }
  buscarNivelReclamoPorDescripcion(descripcion: string): Observable<NivelReclamo[]> {
    return this.http.get<NivelReclamo[]>(`${this.baseUrl}/buscarNivelPorDescripcion/${descripcion}`);
  }

  actualizarNivelReclamo(id: number, nivelReclamo: NivelReclamo): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, nivelReclamo);
  }

  eliminarNivelReclamo(id:number): Observable<any> {

       return this.http.delete(`${this.baseUrl}/${id}`);

   }
}
