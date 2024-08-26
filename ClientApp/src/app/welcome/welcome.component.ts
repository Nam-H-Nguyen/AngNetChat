import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './welcome.component.html',
  template: `
    <button [routerLink]="['/join-room']">Join Room Now</button>
  `,
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {

}
