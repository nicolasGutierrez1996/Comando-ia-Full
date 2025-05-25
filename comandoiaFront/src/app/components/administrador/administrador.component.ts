import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReclamosService} from '../../services/reclamos.service';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule,FormsModule, MatSnackBarModule],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.css'
})
export class AdministradorComponent {

selectedFile: File | null = null;

//RECLAMOS
mostrarSubBotonReclamos: boolean=false;
mostrarSubBotonObras:boolean=false;
mostrarCrearReclamo:boolean=false;
mostrarEditarReclamo:boolean=false;
mostrarAdjuntarExcel:boolean=false;
nombreReclamo: string='';
tipoReclamo: string='';
fechaReclamo: Date = new Date();
estadoReclamo:string='';
localidad:string='';
barrio:string='';
calle:string='';
nroCalle:number=0;
tiempoResolucion=number=0;
satisfaccion:string='';
descripcion:string='';

//OBRAS
mostrarCrearObra:boolean=false;
mostrarEditarObra:boolean=false;

  constructor(private snackBar: MatSnackBar
  ,private router: Router, private reclamosService:ReclamosService) {}


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

onUpload(): void {
  if (!this.selectedFile) return;

  const formData = new FormData();
  formData.append('file', this.selectedFile); // 'file' debe coincidir con @RequestParam("file") en el backend

  this.reclamosService.importarDesdeExcel(formData).subscribe({
    next: (res) => {
      console.log('Archivo subido correctamente:', res);
      this.snackBar.open('Archivo subido correctamente', 'Cerrar', { duration: 3000 });
    },
    error: (err) => {
      console.error('Error al subir el archivo:', err);
      this.snackBar.open('Error al subir el archivo', 'Cerrar', { duration: 3000 });
    }
  });
}

volverAlLogin(){
this.router.navigate(['./login']);

}
  MostrarSubBotonesReclamo(): void {
    this.mostrarSubBotonReclamos = !this.mostrarSubBotonReclamos;
  }

  MostrarSubBotonesObras(): void {
    this.mostrarSubBotonObras = !this.mostrarSubBotonObras;
  }

  MostrarCrearReclamo(){
     this.mostrarCrearReclamo=!this.mostrarCrearReclamo;
     this.mostrarEditarReclamo=false;
     this.mostrarAdjuntarExcel=false;
  }

  MostrarEditarReclamo(){
    this.mostrarEditarReclamo=!this.mostrarEditarReclamo;
    this.mostrarAdjuntarExcel=false;
    this.mostrarCrearReclamo=false;
  }
MostrarAdjuntarExcel(){
this.mostrarAdjuntarExcel=!this.mostrarAdjuntarExcel;
this.mostrarEditarReclamo=false;
this.mostrarCrearReclamo=false;

}
}
