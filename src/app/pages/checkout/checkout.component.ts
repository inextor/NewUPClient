import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

interface ContactInfo {
	first_name: string;
	last_name: string;
	whatsapp: string;
	comments: string;
}

interface DeliveryInfo {
	first_name: string;
	last_name: string;
	phone: string;
	company: string;
	delivery_type: string;
	requested_date: string;
}

@Component({
	selector: 'app-checkout',
	standalone: true,
	imports: [CommonModule, FormsModule, ImagePipe, RouterLink],
	templateUrl: './checkout.component.html',
	styleUrl: './checkout.component.css'
})
export class CheckoutComponent extends BaseComponent implements OnInit {
	cart_items: CartItemWithDetails[] = [];
	override is_loading: boolean = false;
	is_processing: boolean = false;

	// Order data
	order: Order = GetEmpty.order();

	// Section visibility state
	sections = {
		orderInfo: true,
		deliveryInfo: true
	};

	// Contact info (Section 1)
	contactInfo: ContactInfo = {
		first_name: '',
		last_name: '',
		whatsapp: '',
		comments: ''
	};

	// Delivery info (Section 2)
	deliveryInfo: DeliveryInfo = {
		first_name: '',
		last_name: '',
		phone: '',
		company: '',
		delivery_type: '',
		requested_date: ''
	};

	sameAsContact: boolean = false;
	selectedFile: File | null = null;
	minDate: string = '';

	rest_cart: Rest<Cart, Cart> = new Rest<Cart, Cart>(this.rest, 'cart.php');
	rest_ecommerce_item: Rest<Ecommerce_Item, Ecommerce_Item> = new Rest<Ecommerce_Item, Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	rest_item: Rest<any, any> = new Rest<any, any>(this.rest.pos_rest, 'item_info.php');
	rest_order: Rest<Order, Order> = new Rest<Order, Order>(this.rest, 'order.php');
	rest_order_item: Rest<Order_Item, Order_Item> = new Rest<Order_Item, Order_Item>(this.rest, 'order_item.php');

	ngOnInit(): void {
		// Set minimum date to today
		const today = new Date();
		this.minDate = today.toISOString().split('T')[0];

		// Pre-fill customer info from logged-in user
		if (this.rest.user) {
			this.order.user_id = this.rest.user.id;
			this.order.customer_email = this.rest.user.email || '';
			this.order.customer_phone = this.rest.user.phone || '';

			// Try to split user name into first/last
			const nameParts = (this.rest.user.name || '').split(' ');
			this.contactInfo.first_name = nameParts[0] || '';
			this.contactInfo.last_name = nameParts.slice(1).join(' ') || '';
		}

		this.order.ecommerce_id = this.rest.ecommerce.id;
		this.order.created_by_user_id = this.rest.user?.id || null;

		this.loadCart();
	}

	toggleSection(section: 'orderInfo' | 'deliveryInfo'): void {
		this.sections[section] = !this.sections[section];
	}

	onSameAsContactChange(): void {
		if (this.sameAsContact) {
			this.deliveryInfo.first_name = this.contactInfo.first_name;
			this.deliveryInfo.last_name = this.contactInfo.last_name;
			this.deliveryInfo.phone = this.order.customer_phone || '';
		}
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			this.selectedFile = input.files[0];
		}
	}

	removeFile(): void {
		this.selectedFile = null;
		// Reset the file input
		const fileInput = document.getElementById('po_file') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
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

		// Calculate IVA (16%)
		this.order.tax_amount = this.order.subtotal * 0.16;
		this.order.shipping_cost = 0; // Set shipping if applicable
		this.order.total_amount = this.order.subtotal + this.order.tax_amount + this.order.shipping_cost;
		this.order.items_count = this.cart_items.reduce((count, item) => count + item.qty, 0);
	}

	processCheckout(): void {
		// Validate Section 1: Contact Info
		if (!this.contactInfo.first_name || !this.contactInfo.last_name) {
			this.rest.showError('Por favor complete su nombre y apellido');
			this.sections.orderInfo = true;
			return;
		}

		if (!this.order.customer_email || !this.order.customer_phone) {
			this.rest.showError('Por favor complete el correo y teléfono');
			this.sections.orderInfo = true;
			return;
		}

		// Validate Section 2: Delivery Info
		if (!this.deliveryInfo.first_name || !this.deliveryInfo.last_name || !this.deliveryInfo.phone) {
			this.rest.showError('Por favor complete la información del destinatario');
			this.sections.deliveryInfo = true;
			return;
		}

		if (!this.order.shipping_address || !this.order.shipping_city || !this.order.shipping_state || !this.order.shipping_postal_code) {
			this.rest.showError('Por favor complete la dirección de envío completa');
			this.sections.deliveryInfo = true;
			return;
		}

		if (!this.deliveryInfo.delivery_type) {
			this.rest.showError('Por favor seleccione el tipo de entrega');
			this.sections.deliveryInfo = true;
			return;
		}

		this.is_processing = true;

		// Combine first and last name for customer_name
		this.order.customer_name = `${this.contactInfo.first_name} ${this.contactInfo.last_name}`.trim();

		// Build comprehensive notes with all additional info
		const noteParts: string[] = [];

		if (this.contactInfo.whatsapp) {
			noteParts.push(`WhatsApp: ${this.contactInfo.whatsapp}`);
		}
		if (this.contactInfo.comments) {
			noteParts.push(`Comentarios: ${this.contactInfo.comments}`);
		}
		if (this.deliveryInfo.company) {
			noteParts.push(`Empresa: ${this.deliveryInfo.company}`);
		}
		noteParts.push(`Destinatario: ${this.deliveryInfo.first_name} ${this.deliveryInfo.last_name}`);
		noteParts.push(`Teléfono Entrega: ${this.deliveryInfo.phone}`);
		noteParts.push(`Tipo de Entrega: ${this.getDeliveryTypeLabel(this.deliveryInfo.delivery_type)}`);
		if (this.deliveryInfo.requested_date) {
			noteParts.push(`Fecha Solicitada: ${this.deliveryInfo.requested_date}`);
		}
		if (this.order.notes) {
			noteParts.push(`Notas de Entrega: ${this.order.notes}`);
		}
		if (this.selectedFile) {
			noteParts.push(`Archivo PO adjunto: ${this.selectedFile.name}`);
		}

		this.order.notes = noteParts.join('\n');

		let created_order_id: number;

		// Create the order
		this.rest_order.create(this.order)
			.then((created_order: Order) => {
				created_order_id = created_order.id;

				// Create order items from cart items
				const order_item_promises = this.cart_items.map(cart_item => {
					const ecommerce_item_id = (cart_item as any).ecommerce_item_id || (cart_item as any).ecommerce_item;

					const order_item: Order_Item = {
						id: 0,
						order_id: created_order.id,
						ecommerce_item_id: ecommerce_item_id,
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
				this.rest.loadCartCount();
				this.rest.showSuccess('¡Pedido creado exitosamente!');
				this.router.navigate(['/order-confirmation', created_order_id]);
			})
			.catch((error: any) => {
				this.rest.showError(error);
				this.is_processing = false;
			});
	}

	getDeliveryTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			'envio': 'Envío a domicilio',
			'recoger': 'Recoger en tienda',
			'paqueteria': 'Paquetería'
		};
		return labels[type] || type;
	}
}
