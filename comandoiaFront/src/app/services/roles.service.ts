import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rol {
  id: number;
  tipo: 'ADMINISTRADOR_DEL_SISTEMA' | 'ADMINISTRATIVO' | 'CONSULTOR_PRINCIPAL' | 'CONSULTOR';
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private baseUrl = 'http://localhost:8080/api/roles';

  constructor(private http: HttpClient) {}

  obtenerRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.baseUrl);
  }
}
