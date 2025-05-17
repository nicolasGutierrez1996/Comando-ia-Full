import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { MenuComponent } from './components/menu/menu.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'menu', component: MenuComponent },
];
