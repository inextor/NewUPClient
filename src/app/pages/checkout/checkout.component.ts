import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { Cart } from '../../models/RestModels/Cart';
import { Order } from '../../models/RestModels/Order';
import { Order_Item } from '../../models/RestModels/Order_Item';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { Rest } from '../../classes/Rest';
import { RestResponse } from '../../classes/RestResponse';
import { ImagePipe } from '../../pipes/image.pipe';
import { GetEmpty } from '../../models/GetEmpty';

interface CartItemWithDetails extends Cart {
	ecommerce_item?: Ecommerce_Item;
	item_info?: any;
}

@Component({
	selector: 'app-checkout',
	standalone: true,
	imports: [CommonModule, FormsModule, ImagePipe],
	templateUrl: './checkout.component.html',
	styleUrl: './checkout.component.css'
})
export class CheckoutComponent extends BaseComponent implements OnInit {
	cart_items: CartItemWithDetails[] = [];
	override is_loading: boolean = false;
	is_processing: boolean = false;

	// Order data
	order: Order = GetEmpty.order();

	rest_cart: Rest<Cart, Cart> = new Rest<Cart, Cart>(this.rest, 'cart.php');
	rest_ecommerce_item: Rest<Ecommerce_Item, Ecommerce_Item> = new Rest<Ecommerce_Item, Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	rest_item: Rest<any, any> = new Rest<any, any>(this.rest.pos_rest, 'item_info.php');
	rest_order: Rest<Order, Order> = new Rest<Order, Order>(this.rest, 'order.php');
	rest_order_item: Rest<Order_Item, Order_Item> = new Rest<Order_Item, Order_Item>(this.rest, 'order_item.php');

	ngOnInit(): void {
		// Pre-fill customer info from logged-in user
		if (this.rest.user) {
			this.order.user_id = this.rest.user.id;
			this.order.customer_name = this.rest.user.name || '';
			this.order.customer_email = this.rest.user.email || '';
			this.order.customer_phone = this.rest.user.phone || '';
		}

		this.order.ecommerce_id = this.rest.ecommerce.id;
		this.order.created_by_user_id = this.rest.user?.id || null;

		this.loadCart();
	}

	loadCart(): void {
		this.is_loading = true;

		this.rest_cart.search({ user_id: this.rest.user?.id || 0 })
			.then((response: RestResponse<Cart>) => {
				this.cart_items = response.data || [];

				if (this.cart_items.length === 0) {
					this.rest.showError('Tu carrito está vacío');
					this.router.navigate(['/cart']);
					return;
				}

				// Fetch ecommerce_item details
				const promises = this.cart_items.map(cart_item => {
					return this.rest_ecommerce_item.get(cart_item.ecommerce_item_id)
						.then((ecommerce_item: Ecommerce_Item) => {
							cart_item.ecommerce_item = ecommerce_item;
							return this.rest_item.get(ecommerce_item.item_id);
						})
						.then((item_info: any) => {
							cart_item.item_info = item_info;
						});
				});

				return Promise.all(promises);
			})
			.then(() => {
				this.calculateTotals();
				this.is_loading = false;
			})
			.catch((error: any) => {
				this.rest.showError(error);
				this.is_loading = false;
			});
	}

	calculateTotals(): void {
		this.order.subtotal = this.cart_items.reduce((total, item) => {
			const price = item.ecommerce_item?.price || 0;
			return total + (price * item.qty);
		}, 0);

		this.order.tax_amount = 0; // Set tax if applicable
		this.order.shipping_cost = 0; // Set shipping if applicable
		this.order.total_amount = this.order.subtotal + this.order.tax_amount + this.order.shipping_cost;
		this.order.items_count = this.cart_items.reduce((count, item) => count + item.qty, 0);
	}

	processCheckout(): void {
		// Validate required fields
		if (!this.order.customer_name || !this.order.customer_email || !this.order.customer_phone) {
			this.rest.showError('Por favor complete todos los campos obligatorios');
			return;
		}

		if (!this.order.shipping_address || !this.order.shipping_city || !this.order.shipping_state || !this.order.shipping_postal_code) {
			this.rest.showError('Por favor complete la dirección de envío completa');
			return;
		}

		this.is_processing = true;

		let created_order_id: number;

		// Create the order
		this.rest_order.create(this.order)
			.then((created_order: Order) => {
				created_order_id = created_order.id;

				// Create order items from cart items
				const order_item_promises = this.cart_items.map(cart_item => {
					const order_item: Order_Item = {
						id: 0,
						order_id: created_order.id,
						ecommerce_item_id: cart_item.ecommerce_item_id,
						variation: cart_item.variation,
						qty: cart_item.qty,
						unit_price: cart_item.ecommerce_item?.price || 0,
						notes: null,
						created: new Date(),
						updated: new Date()
					};
					return this.rest_order_item.create(order_item);
				});

				return Promise.all(order_item_promises);
			})
			.then(() => {
				// Delete cart items
				const delete_promises = this.cart_items.map(cart_item => {
					return this.rest_cart.delete(cart_item.id);
				});
				return Promise.all(delete_promises);
			})
			.then(() => {
				this.is_processing = false;
				this.rest.showSuccess('¡Pedido creado exitosamente!');
				this.router.navigate(['/order-confirmation', created_order_id]);
			})
			.catch((error: any) => {
				this.rest.showError(error);
				this.is_processing = false;
			});
	}
}
