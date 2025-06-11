import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map,timeout } from 'rxjs/operators';

interface LoginRequest {
  usuario: string;
  contrasena: string;
}



export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  contrasena?: string;
  token?: string;
  fechaCreacion?: string;
  fechaUltimaActualizacion?: string;
  estado: { id: number };
  rol: { id: number };
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

validarToken(email: string,tokenIngresado:String): Observable<any> {
return this.http.post(`${this.baseUrl}/validarToken/${email}/${tokenIngresado}`, null);
}

cambiarContrasena(email:string,contrasena:string):Observable<any>{
  return this.http.put(`${this.baseUrl}/actualizarContrasena/${email}/${contrasena}`, null);

}

obtenerRol(nombre: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/obtenerRol/${nombre}`, null);
}

crearUsuario(usuario: Usuario): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, usuario);
  }

existeUsuario(nombre: string): Observable<boolean> {
  return this.http.get<boolean>(`${this.baseUrl}/existe-nombre/${nombre}`);
}
buscarUsuariosPorNombre(nombre: string): Observable<Usuario[]> {
  return this.http.get<Usuario[]>(`${this.baseUrl}/buscarUsuariosPorNombre/${nombre}`);
}

actualizarUsuario(id: number, usuario: Usuario): Observable<any> {
  return this.http.put(`${this.baseUrl}/${id}`, usuario);
}


}
