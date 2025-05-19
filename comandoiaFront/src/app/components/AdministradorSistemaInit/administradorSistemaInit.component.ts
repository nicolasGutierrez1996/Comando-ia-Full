import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-administradorSistemaInit',
  templateUrl: './administradorSistemaInit.component.html',
  styleUrls: ['./administradorSistemaInit.component.scss']
})
export class AdministradorSistemaInitComponent implements OnInit {

  // Variables de ejemplo para mostrar en el HTML o trabajar con lógica
  titulo: string = 'Panel de Administración del Sistema';

  constructor() {}

  ngOnInit(): void {
    // Lógica que quieras ejecutar al inicializar el componente
    console.log('AdministradorSistemaInitComponent inicializado');
  }

}
