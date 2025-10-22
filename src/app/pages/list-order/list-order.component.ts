import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order } from '../../models/RestModels/Order';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';
import { ShortDatePipe } from '../../pipes/short-date.pipe';

@Component({
	selector: 'app-list-order',
	imports: [CommonModule, RouterLink, FormsModule, ShortDatePipe],
	templateUrl: './list-order.component.html',
	styleUrl: './list-order.component.css'
})
export class ListOrderComponent extends BaseComponent implements OnInit {

	rest_order: Rest<Order, Order> = new Rest<Order, Order>(this.rest, 'order.php');
	order_list: Order[] = [];
	searchTerm: string = '';

	search_object: SearchObject<Order> = new SearchObject<Order>(['order_number', 'status', 'notes']);

	ngOnInit(): void {
		this.route.queryParamMap.subscribe((params: ParamMap) => {
			this.search_object.assignNavigationParams(params);

			this.rest_order.search(this.search_object)
				.then((response: RestResponse<Order>) => {
					this.order_list = response.data;
				})
				.catch((error: any) => {
					this.rest.showError(error);
				});
		});
	}

	onSearch(): void {
		this.search_object.lk.order_number = this.searchTerm || null;
		this.search_object.page = 0;

		const navigationParams = this.search_object.getNavigationParams();
		this.router.navigate(['/list-order'], {
			queryParams: Object.fromEntries(navigationParams.entries())
		});
	}

	getStatusBadgeClass(status: string): string {
		switch (status) {
			case 'PENDING':
				return 'bg-warning';
			case 'PROCESSING':
				return 'bg-info';
			case 'COMPLETED':
				return 'bg-success';
			case 'CANCELLED':
				return 'bg-danger';
			default:
				return 'bg-secondary';
		}
	}

	markAsReceived(order: Order): void {
		if (confirm('¿Está seguro de marcar esta orden como recibida?')) {
			const updatedOrder: Partial<Order> = {
				id: order.id,
				status: 'COMPLETED'
			};

			this.rest_order.update(updatedOrder)
				.then(() => {
					this.rest.showSuccess('Orden marcada como recibida');
					// Update the local order in the list
					order.status = 'COMPLETED';
				})
				.catch((error: any) => {
					this.rest.showError(error);
				});
		}
	}
}
