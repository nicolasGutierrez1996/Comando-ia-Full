import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Estado {
  id: number;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstadoUsuarioService {
  private baseUrl = 'http://localhost:8080/api/EstadosUsuario';

  constructor(private http: HttpClient) {}

  obtenerEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(this.baseUrl);
  }
}
