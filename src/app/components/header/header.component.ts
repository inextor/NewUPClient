import { Component, inject } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  rest = inject(RestService);
  menuService = inject(MenuService);

  constructor() {
    console.log('Ecommerce object in HeaderComponent:', this.rest.ecommerce);
  }
}
