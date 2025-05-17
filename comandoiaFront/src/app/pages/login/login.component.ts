import { Component } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';
import { BienvenidaComponent } from '../../components/bienvenida/bienvenida.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MenuComponent, BienvenidaComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {}
