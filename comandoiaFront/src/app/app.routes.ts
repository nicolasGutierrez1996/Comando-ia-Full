import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { MenuComponent } from './components/menu/menu.component';
import { RecuperarComponent } from './components/bienvenida/recuperarContraseña/recuperar.component';
import { AdministradorSistemaInitComponent } from './components/AdministradorSistemaInit/administradorSistemaInit.component';
import { AdministradorComponent } from './components/administrador/administrador.component';
import { ConsultorComponent } from './components/consultor/consultor.component';
import { ConsultorPrincipalComponent } from './components/consultor-principal/consultor-principal.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'recuperar', component: RecuperarComponent },
  { path: 'administradorSistemaInit', component: AdministradorSistemaInitComponent },
  { path: 'Administrador', component: AdministradorComponent },
  { path: 'Consultor', component: ConsultorComponent },
  { path: 'ConsultorPrincipal', component: ConsultorPrincipalComponent }

];
