import { Component, inject } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './header.component.html',
	styleUrl: './header.component.css'
})
export class HeaderComponent {
	rest = inject(RestService);

	foo:boolean = true;
	constructor(rest: RestService)
	{
		console.log('Ecommerce object in HeaderComponent:', this.rest.ecommerce);
	}

	toggleMenu()
	{
		this.foo = this.rest.toggleMenu();
	}
}


