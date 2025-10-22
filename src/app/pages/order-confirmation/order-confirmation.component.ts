import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { Order } from '../../models/RestModels/Order';
import { Order_Item } from '../../models/RestModels/Order_Item';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { Rest } from '../../classes/Rest';
import { ImagePipe } from '../../pipes/image.pipe';

interface OrderItemWithDetails extends Order_Item {
	ecommerce_item?: Ecommerce_Item;
	item_info?: any;
}

@Component({
	selector: 'app-order-confirmation',
	standalone: true,
	imports: [CommonModule, RouterLink, ImagePipe],
	templateUrl: './order-confirmation.component.html',
	styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent extends BaseComponent implements OnInit {
	order: Order | null = null;
	order_items: OrderItemWithDetails[] = [];
	override is_loading: boolean = false;

	rest_order: Rest<Order, Order> = new Rest<Order, Order>(this.rest, 'order.php');
	rest_order_item: Rest<Order_Item, Order_Item> = new Rest<Order_Item, Order_Item>(this.rest, 'order_item.php');
	rest_ecommerce_item: Rest<Ecommerce_Item, Ecommerce_Item> = new Rest<Ecommerce_Item, Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	rest_item: Rest<any, any> = new Rest<any, any>(this.rest.pos_rest, 'item_info.php');

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			const order_id = params.get('id');
			if (order_id) {
				this.loadOrder(+order_id);
			}
		});
	}

	loadOrder(order_id: number): void {
		this.is_loading = true;

		this.rest_order.get(order_id)
			.then((order: Order) => {
				this.order = order;

				// Load order items
				return this.rest_order_item.search({ order_id: order_id });
			})
			.then((response: any) => {
				this.order_items = response.data || [];

				// Fetch ecommerce item details for each order item
				const promises = this.order_items.map(order_item => {
					return this.rest_ecommerce_item.get(order_item.ecommerce_item_id)
						.then((ecommerce_item: Ecommerce_Item) => {
							order_item.ecommerce_item = ecommerce_item;
							return this.rest_item.get(ecommerce_item.item_id);
						})
						.then((item_info: any) => {
							order_item.item_info = item_info;
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
}
