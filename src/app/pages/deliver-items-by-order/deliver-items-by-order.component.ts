import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { Order } from '../../models/RestModels/Order';
import { Order_Info } from '../../models/InfoModels/Order_Info';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-deliver-items-by-order',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './deliver-items-by-order.component.html',
  styleUrl: './deliver-items-by-order.component.css'
})
export class DeliverItemsByOrderComponent extends BaseComponent implements OnInit {

  rest_order_info: Rest<Order, Order_Info> = new Rest<Order, Order_Info>(this.rest, 'order_info.php');
  rest_user_order_item: Rest<any, any> = new Rest<any, any>(this.rest, 'user_order_item.php');

  orders_with_pending: Order_Info[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  confirmationService: ConfirmationService;

  constructor(injector: Injector) {
    super(injector);
    this.confirmationService = injector.get(ConfirmationService);
  }

  ngOnInit(): void {
    this.loadOrdersWithPendingItems();
  }

  async loadOrdersWithPendingItems(): Promise<void> {
    this.isLoading = true;

    try {
      // Get all orders
      const response = await this.rest_order_info.search({
        limit: 99999
      });

      // Filter orders that have pending items (items with delivery_timestamp = null)
      this.orders_with_pending = response.data.filter((orderInfo: Order_Info) => {
        return orderInfo.order_items_info.some(itemInfo =>
          itemInfo.user_order_items.some(userOrderItem =>
            userOrderItem.delivery_timestamp === null
          )
        );
      });

    } catch (error) {
      this.rest.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  getPendingItemsCount(orderInfo: Order_Info): number {
    let count = 0;
    for (const itemInfo of orderInfo.order_items_info) {
      for (const userOrderItem of itemInfo.user_order_items) {
        if (userOrderItem.delivery_timestamp === null) {
          count++;
        }
      }
    }
    return count;
  }

  getTotalItemsCount(orderInfo: Order_Info): number {
    let count = 0;
    for (const itemInfo of orderInfo.order_items_info) {
      count += itemInfo.user_order_items.length;
    }
    return count;
  }

  async deliverAllByOrder(order_id: number, orderNumber: string): Promise<void> {
    const confirmed = confirm(
      `¿Está seguro de marcar todos los items de la orden "${orderNumber}" como entregados?`
    );

    if (!confirmed) return;

    this.isLoading = true;

    try {
      const response = await fetch(this.rest.base_url + '/user_order_item.php', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + this.rest.bearer,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: order_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      this.rest.showSuccess(`Todos los items de la orden "${orderNumber}" han sido marcados como entregados`);
      await this.loadOrdersWithPendingItems();

    } catch (error) {
      this.rest.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '-';

    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return String(date);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'badge bg-warning';
      case 'PROCESSING':
        return 'badge bg-info';
      case 'COMPLETED':
        return 'badge bg-success';
      case 'CANCELLED':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  get filteredOrders(): Order_Info[] {
    if (!this.searchTerm.trim()) {
      return this.orders_with_pending;
    }

    const search = this.searchTerm.toLowerCase();
    return this.orders_with_pending.filter(orderInfo => {
      const orderNumber = (orderInfo.order.order_number || '').toLowerCase();
      const orderId = orderInfo.order.id.toString();
      return orderNumber.includes(search) || orderId.includes(search);
    });
  }
}
