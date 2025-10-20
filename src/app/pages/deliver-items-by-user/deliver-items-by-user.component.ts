import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { User_Order_Item } from '../../models/RestModels/User_Order_Item';
import { User_Order_Item_Info } from '../../models/InfoModels/User_Order_Item_Info';
import { User } from '../../models/RestModels/User';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-deliver-items-by-user',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './deliver-items-by-user.component.html',
  styleUrl: './deliver-items-by-user.component.css'
})
export class DeliverItemsByUserComponent extends BaseComponent implements OnInit {

  rest_user_order_item: Rest<User_Order_Item, User_Order_Item_Info> = new Rest<User_Order_Item, User_Order_Item_Info>(this.rest, 'user_order_item.php');
  rest_user: Rest<User, User> = new Rest<User, User>(this.rest, 'user.php');
  rest_ecommerce_item: Rest<any, any> = new Rest<any, any>(this.rest, 'ecommerce_item.php');

  user_order_items_info: User_Order_Item_Info[] = [];
  selectedItems: Set<number> = new Set();
  isLoading: boolean = false;
  searchTerm: string = '';

  // Maps for user and item names
  userMap: Map<number, User> = new Map();
  ecommerceItemMap: Map<number, any> = new Map();

  constructor(private confirmationService: ConfirmationService) {
    super();
  }

  ngOnInit(): void {
    this.loadPendingItems();
  }

  async loadPendingItems(): Promise<void> {
    this.isLoading = true;

    try {
      // Search for user_order_items where delivered is null
      const response = await this.rest_user_order_item.search({
        'delivered': null,
        limit: 99999
      });

      this.user_order_items_info = response.data;

      // Collect unique user IDs and ecommerce item IDs
      const userIds = new Set<number>();
      const ecommerceItemIds = new Set<number>();
      const orderItemIds = new Set<number>();

      for (const info of this.user_order_items_info) {
        userIds.add(info.user_order_item.user_id);
        if (info.order_item) {
          ecommerceItemIds.add(info.order_item.ecommerce_item_id);
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

  getEcommerceItemName(info: User_Order_Item_Info): string {
    if (info.order_item) {
      const item = this.ecommerceItemMap.get(info.order_item.ecommerce_item_id);
      return item ? (item.name || item.code || `Item #${info.order_item.ecommerce_item_id}`) : `Item #${info.order_item.ecommerce_item_id}`;
    }
    return '-';
  }

  getEcommerceItemCode(info: User_Order_Item_Info): string {
    if (info.order_item) {
      const item = this.ecommerceItemMap.get(info.order_item.ecommerce_item_id);
      return item?.code || '';
    }
    return '';
  }

  toggleSelection(id: number): void {
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
  }

  toggleAll(): void {
    if (this.selectedItems.size === this.user_order_items_info.length) {
      this.selectedItems.clear();
    } else {
      this.selectedItems.clear();
      for (const info of this.user_order_items_info) {
        this.selectedItems.add(info.user_order_item.id);
      }
    }
  }

  async deliverSelected(): Promise<void> {
    if (this.selectedItems.size === 0) {
      this.rest.showError('Por favor seleccione al menos un item para entregar');
      return;
    }

    const confirmed = await this.confirmationService.confirm(
      `¿Está seguro de marcar ${this.selectedItems.size} item(s) como entregado(s)?`
    );

    if (!confirmed) return;

    this.isLoading = true;

    try {
      // Use the PATCH endpoint with ids array
      const response = await fetch(this.rest.base_url + '/user_order_item.php', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + this.rest.getBearerToken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: Array.from(this.selectedItems)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      this.rest.showSuccess(`${this.selectedItems.size} item(s) marcado(s) como entregado(s)`);
      this.selectedItems.clear();
      await this.loadPendingItems();

    } catch (error) {
      this.rest.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async deliverSingle(id: number): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      '¿Está seguro de marcar este item como entregado?'
    );

    if (!confirmed) return;

    this.isLoading = true;

    try {
      const response = await fetch(this.rest.base_url + '/user_order_item.php', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + this.rest.getBearerToken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      this.rest.showSuccess('Item marcado como entregado');
      await this.loadPendingItems();

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

  get filteredItems(): User_Order_Item_Info[] {
    if (!this.searchTerm.trim()) {
      return this.user_order_items_info;
    }

    const search = this.searchTerm.toLowerCase();
    return this.user_order_items_info.filter(info => {
      const userName = this.getUserName(info.user_order_item.user_id).toLowerCase();
      const itemName = this.getEcommerceItemName(info).toLowerCase();
      const itemCode = this.getEcommerceItemCode(info).toLowerCase();

      return userName.includes(search) ||
             itemName.includes(search) ||
             itemCode.includes(search);
    });
  }
}
