import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { RestService } from '../../services/rest.service';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { WhatsappFloatComponent } from '../../components/whatsapp-float/whatsapp-float.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
	selector: 'app-main',
	standalone: true,
	imports: [RouterOutlet, CommonModule, HeaderComponent, MenuComponent, WhatsappFloatComponent, FooterComponent],
	templateUrl: './main.component.html',
	styleUrl: './main.component.css'
})
export class MainComponent {
	constructor(public rest: RestService)
	{

	}

	toggleMenu() {
		this.rest.toggleMenu();
	}
}
