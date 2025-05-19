import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private baseUrl = 'http://localhost:8080/api/roles';

  constructor(private http: HttpClient) {}


}
