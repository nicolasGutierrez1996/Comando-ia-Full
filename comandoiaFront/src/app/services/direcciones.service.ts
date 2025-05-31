import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DireccionesService {
  private baseUrl = 'http://localhost:8080/api/direcciones';

  constructor(private http: HttpClient) {}

obtenerLocalidades():Observable<string[]>{
 return this.http.get<string[]>(`${this.baseUrl}/obtenerLocalidades`);
}
obtenerBarrios():Observable<string[]>{
 return this.http.get<string[]>(`${this.baseUrl}/obtenerBarrios`);
}

}
