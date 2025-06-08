import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GptService {
  private apiUrl = 'http://localhost:8080/api/ia';

  constructor(private http: HttpClient) {}

  preguntar(prompt: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/preguntar` , { prompt });
  }
}
