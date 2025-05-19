import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

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
recuperarClave(email: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/recuperar/${email}`, null);
}

  actualizarClave(email:string,token:string,nuevaClave:string):Observable<any>{
       return this.http.put(`${this.baseUrl}/actualizar-clave/${email}/${token}/${nuevaClave}`, null);
  }

obtenerToken(email: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/obtenerToken/${email}`, null);
}

cambiarContrasena(email:string,contrasena:string):Observable<any>{
  return this.http.put(`${this.baseUrl}/actualizarContrasena/${email}/${contrasena}`, null);

}

obtenerRol(nombre: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/obtenerRol/${nombre}`, null);
}


}
