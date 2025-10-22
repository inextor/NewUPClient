import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { Cart } from '../../models/RestModels/Cart';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { Rest } from '../../classes/Rest';
import { RestResponse } from '../../classes/RestResponse';
import { ImagePipe } from '../../pipes/image.pipe';

interface CartItemWithDetails extends Cart {
	ecommerce_item?: Ecommerce_Item;
	item_info?: any;
}

@Component({
	selector: 'app-cart',
	standalone: true,
	imports: [CommonModule, RouterLink, ImagePipe],
	templateUrl: './cart.component.html',
	styleUrl: './cart.component.css'
})
export class CartComponent extends BaseComponent implements OnInit {
	cart_items: CartItemWithDetails[] = [];
	override is_loading: boolean = false;

	rest_cart: Rest<Cart,Cart> = new Rest<Cart,Cart>(this.rest, 'cart.php');
	rest_ecommerce_item: Rest<Ecommerce_Item,Ecommerce_Item> = new Rest<Ecommerce_Item,Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	rest_item: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'item_info.php');

	ngOnInit(): void {
		// Load cart initially
		this.loadCart();

		// Also reload when query params change (e.g., when navigating back to cart)
		this.route.queryParams.subscribe(() => {
			this.loadCart();
		});
	}

	loadCart(): void {
		this.is_loading = true;

		// Search for cart items for the current user
		this.rest_cart.search({ user_id: this.rest.user?.id || 0 })
			.then((response: RestResponse<Cart>) => {
				this.cart_items = response.data || [];

				// Fetch ecommerce_item details for each cart item
				const promises = this.cart_items.map(cart_item => {
					return this.rest_ecommerce_item.get(cart_item.ecommerce_item_id)
						.then((ecommerce_item: Ecommerce_Item) => {
							cart_item.ecommerce_item = ecommerce_item;

							// Fetch item_info from POS API
							return this.rest_item.get(ecommerce_item.item_id);
						})
						.then((item_info: any) => {
							cart_item.item_info = item_info;
						});
				});

				return Promise.all(promises);
			})
			.then(() => {
				this.is_loading = false;
			})
			.catch((error: any) => {
				this.rest.showError(error);
				this.is_loading = false;
			});
	}

	removeFromCart(cart_item_id: number): void {
		this.rest_cart.delete(cart_item_id)
			.then(() => {
				this.rest.showSuccess('Producto eliminado del carrito');
				this.loadCart();
			})
			.catch((error: any) => {
				this.rest.showError(error);
			});
	}

	getTotalPrice(): number {
		return this.cart_items.reduce((total, item) => {
			const price = item.ecommerce_item?.price || 0;
			return total + (price * item.qty);
		}, 0);
	}
}
