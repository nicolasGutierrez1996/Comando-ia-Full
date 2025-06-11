import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GptService {
  private apiUrl = 'http://localhost:8080/api/ia';

  constructor(private http: HttpClient) {}

preguntar(
  prompt: string | {
    prompt: string;
    historial?: { rol: 'user' | 'assistant'; content: string }[];
  }
): Observable<any> {
  // Si el argumento es un string simple (modo flotante viejo)
  if (typeof prompt === 'string') {
    return this.http.post<any>(`${this.apiUrl}/preguntar`, { prompt });
  }


  return this.http.post<any>(`${this.apiUrl}/preguntar`, prompt);
}
}
