import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RestService } from '../../services/rest.service';
import { CommonModule } from '@angular/common';
import { Rest } from '../../classes/Rest';
import { Cart } from '../../models/RestModels/Cart';
import { RestResponse } from '../../classes/RestResponse';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './header.component.html',
	styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
	rest = inject(RestService);
	cart_count: number = 0;
	rest_cart: Rest<Cart, Cart> = new Rest<Cart, Cart>(this.rest, 'cart.php');

	foo:boolean = true;
	constructor(rest: RestService)
	{
		console.log('Ecommerce object in HeaderComponent:', this.rest.ecommerce);
	}

	ngOnInit(): void {
		this.loadCartCount();

		// Reload cart count every 30 seconds to keep it updated
		setInterval(() => {
			this.loadCartCount();
		}, 30000);
	}

	loadCartCount(): void {
		if (!this.rest.user?.id) {
			this.cart_count = 0;
			return;
		}

		this.rest_cart.search({ user_id: this.rest.user.id })
			.then((response: RestResponse<Cart>) => {
				// Sum up quantities of all cart items
				this.cart_count = response.data.reduce((total, item) => total + item.qty, 0);
			})
			.catch(() => {
				this.cart_count = 0;
			});
	}

	toggleMenu()
	{
		this.foo = this.rest.toggleMenu();
	}
}


