import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasMessageComponent } from './components/toas-message/toas-message.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToasMessageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'NewUPClient';
}
