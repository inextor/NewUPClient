import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { Order } from '../../models/RestModels/Order';
import { Order_Info } from '../../models/InfoModels/Order_Info';
import { User } from '../../models/RestModels/User';

@Component({
  selector: 'app-view-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-order.component.html',
  styleUrl: './view-order.component.css'
})
export class ViewOrderComponent extends BaseComponent implements OnInit {

  rest_order_info: Rest<Order, Order_Info> = new Rest<Order, Order_Info>(this.rest, 'order_info.php');
  rest_user: Rest<User, User> = new Rest<User, User>(this.rest, 'user.php');
  rest_ecommerce_item: Rest<any, any> = new Rest<any, any>(this.rest, 'ecommerce_item.php');

  order_id: number | null = null;
  order_info: Order_Info | null = null;
  isLoading: boolean = false;

  // User map for displaying user names
  userMap: Map<number, User> = new Map();
  // Ecommerce item map for displaying item details
  ecommerceItemMap: Map<number, any> = new Map();

  ngOnInit(): void {
    // Get order_id from route params
    this.getParamsAndQueriesObservable().subscribe({
      next: (response) => {
        const idParam = response.param.get('id');
        if (idParam) {
          this.order_id = parseInt(idParam);
          this.loadOrderInfo();
        } else {
          this.rest.showError('No se proporcionó ID de orden');
        }
      },
      error: (error) => {
        this.rest.showError(error);
      }
    });
  }

  async loadOrderInfo(): Promise<void> {
    if (!this.order_id) {
      return;
    }

    this.isLoading = true;

    try {
      // Fetch order_info by ID
      const response = await this.rest_order_info.get(this.order_id);
      this.order_info = response;

      // Collect unique user IDs and ecommerce item IDs
      const userIds = new Set<number>();
      const ecommerceItemIds = new Set<number>();

      if (this.order_info && this.order_info.order_items_info) {
        for (const itemInfo of this.order_info.order_items_info) {
          ecommerceItemIds.add(itemInfo.order_item.ecommerce_item_id);

          for (const userOrderItem of itemInfo.user_order_items) {
            userIds.add(userOrderItem.user_id);
          }
        }
      }

      // Fetch users
      if (userIds.size > 0) {
        const usersResponse = await this.rest_user.search({
          'id,': Array.from(userIds),
          limit: 99999
        });

        for (const user of usersResponse.data) {
          this.userMap.set(user.id, user);
        }
      }

      // Fetch ecommerce items
      if (ecommerceItemIds.size > 0) {
        const ecommerceItemsResponse = await this.rest_ecommerce_item.search({
          'id,': Array.from(ecommerceItemIds),
          limit: 99999
        });

        for (const ecomItem of ecommerceItemsResponse.data) {
          this.ecommerceItemMap.set(ecomItem.id, ecomItem);
        }
      }

    } catch (error) {
      this.rest.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  getUserName(user_id: number): string {
    const user = this.userMap.get(user_id);
    return user ? (user.name || user.code || `User #${user_id}`) : `User #${user_id}`;
  }

  getEcommerceItemName(ecommerce_item_id: number): string {
    const item = this.ecommerceItemMap.get(ecommerce_item_id);
    return item ? (item.name || item.code || `Item #${ecommerce_item_id}`) : `Item #${ecommerce_item_id}`;
  }

  getEcommerceItemCode(ecommerce_item_id: number): string {
    const item = this.ecommerceItemMap.get(ecommerce_item_id);
    return item?.code || '';
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

  formatDate(date: string | Date | null): string {
    if (!date) return '-';

    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return String(date);
    }
  }

  formatJSON(json: any): string {
    if (!json) return '';

    try {
      if (typeof json === 'string') {
        return JSON.stringify(JSON.parse(json), null, 2);
      }
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return String(json);
    }
  }

  getTotalAssignedQty(userOrderItems: any[]): number {
    return userOrderItems.reduce((sum, item) => sum + (item.qty || 0), 0);
  }

  getTotalOrderQty(): number {
    if (!this.order_info) return 0;
    return this.order_info.order_items_info.reduce((sum, itemInfo) => sum + (itemInfo.order_item.qty || 0), 0);
  }

  getGroupedItems(): any[] {
    if (!this.order_info) return [];

    const grouped = new Map<number, any>();

    for (const itemInfo of this.order_info.order_items_info) {
      const ecommerce_item_id = itemInfo.order_item.ecommerce_item_id;

      if (!grouped.has(ecommerce_item_id)) {
        grouped.set(ecommerce_item_id, {
          ecommerce_item_id: ecommerce_item_id,
          variations: [],
          total_qty: 0,
          total_amount: 0
        });
      }

      const group = grouped.get(ecommerce_item_id)!;
      group.variations.push({
        variation: itemInfo.order_item.variation,
        qty: itemInfo.order_item.qty,
        unit_price: itemInfo.order_item.unit_price,
        line_total: itemInfo.order_item.qty * (itemInfo.order_item.unit_price || 0),
        notes: itemInfo.order_item.notes,
        user_order_items: itemInfo.user_order_items
      });
      group.total_qty += itemInfo.order_item.qty;
      group.total_amount += itemInfo.order_item.qty * (itemInfo.order_item.unit_price || 0);
    }

    return Array.from(grouped.values());
  }

  getTotalUniqueUsers(): number {
    if (!this.order_info) return 0;

    const uniqueUserIds = new Set<number>();
    for (const itemInfo of this.order_info.order_items_info) {
      for (const userOrderItem of itemInfo.user_order_items) {
        uniqueUserIds.add(userOrderItem.user_id);
      }
    }
    return uniqueUserIds.size;
  }

  getOrderTotal(): string {
    if (!this.order_info) return '$0.00';

    let total = 0;
    let hasPrice = false;

    for (const itemInfo of this.order_info.order_items_info) {
      if (itemInfo.order_item.unit_price !== null) {
        total += itemInfo.order_item.qty * itemInfo.order_item.unit_price;
        hasPrice = true;
      }
    }

    if (!hasPrice) {
      return 'Sin precio';
    }

    return '$' + total.toFixed(2);
  }
}
