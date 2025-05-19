import { Component } from '@angular/core';
import { Router, RouterModule, Event } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule], // <-- Importá RouterModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'comandoiaFront';

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      console.log('Router Event:', event);
    });
  }
}
