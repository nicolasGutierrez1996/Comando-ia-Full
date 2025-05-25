
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ReclamosService {
  private baseUrl = 'http://localhost:8080/api/Reclamos';

  constructor(private http: HttpClient) {}


importarDesdeExcel(formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/excel/upload`, formData);
}

}








