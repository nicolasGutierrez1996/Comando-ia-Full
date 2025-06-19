import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuario = '';
  private rol = '';

  setDatos(usuario: string, rol: string) {
    this.usuario = usuario;
    this.rol = rol;
    localStorage.setItem('usuario', usuario);
    localStorage.setItem('rol', rol);
  }

  getUsuario(): string {
    if (!this.usuario) {
      this.usuario = localStorage.getItem('usuario') || '';
    }
    return this.usuario;
  }

  getRol(): string {
    if (!this.rol) {
      this.rol = localStorage.getItem('rol') || '';
    }
    return this.rol;
  }

  limpiar() {
    this.usuario = '';
    this.rol = '';
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
  }
}
