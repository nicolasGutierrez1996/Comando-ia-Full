import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  usuario: string;
  contrasena: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = 'http://localhost:8080/api/Usuarios'; // ajusta la URL si usas otro puerto o dominio

  constructor(private http: HttpClient) {}

  login(usuario: string, contrasena: string): Observable<any> {
    const body: LoginRequest = { usuario, contrasena };
    return this.http.post(`${this.baseUrl}/login`, body);
  }
}
