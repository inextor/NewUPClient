import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { User } from '../../models/RestModels/User';
import { Order } from '../../models/RestModels/Order';
import { Order_Item } from '../../models/RestModels/Order_Item';
import { Role } from '../../models/RestModels/Role';
import { Role_Ecommerce_Item } from '../../models/RestModels/Role_Ecommerce_Item';
import { Role_User } from '../../models/RestModels/Role_User';
import { GetEmpty } from '../../models/GetEmpty';
import { Order_Info } from '../../models/InfoModels/Order_Info';

interface OrderRow {
	id: number; // Unique ID for tracking
	ecommerce_item_id: number;
	ecommerce_item: any;
	user_id: number;
	user: User;
	qty: number;
	notes: string;
}

interface ItemSummary {
	ecommerce_item_id: number;
	ecommerce_item: any;
	totalQty: number;
}

interface UserSummary {
	user_id: number;
	user: User;
	totalQty: number;
}

@Component({
	selector: 'app-create-multi-user-order',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './create-multi-user-order.component.html',
	styleUrl: './create-multi-user-order.component.css'
})
export class CreateMultiUserOrderComponent extends BaseComponent {

	rest_user: Rest<User, User> = new Rest<User, User>(this.rest, 'user.php');
	rest_ecommerce_item: Rest<any, any> = new Rest<any, any>(this.rest, 'ecommerce_item.php');
	rest_order: Rest<Order, Order> = new Rest<Order, Order>(this.rest, 'order.php');
	rest_role: Rest<Role, Role> = new Rest<Role, Role>(this.rest, 'role.php');
	rest_role_ecommerce_item: Rest<Role_Ecommerce_Item, Role_Ecommerce_Item> = new Rest<Role_Ecommerce_Item, Role_Ecommerce_Item>(this.rest, 'role_ecommerce_item.php');
	rest_role_user: Rest<Role_User, Role_User> = new Rest<Role_User, Role_User>(this.rest, 'role_user.php');

	// Step 1: Role selection
	roleList: Role[] = [];
	selectedRoleId: number | null = null;
	isLoadingRole: boolean = false;

	// Users and items from role
	roleUsers: User[] = [];
	roleEcommerceItems: any[] = [];

	// Step 2: Order rows
	orderRows: OrderRow[] = [];
	nextRowId: number = 1;

	// New row form
	selectedItemId: number | null = null;
	selectedUserId: number | null = null;
	newRowQty: number = 1;
	newRowNotes: string = '';

	// Item search
	itemSearchTerm: string = '';
	filteredItems: any[] = [];

	// User search
	userSearchTerm: string = '';
	filteredUsers: User[] = [];

	// Order notes
	orderNotes: string = '';

	// Summary
	itemSummaries: ItemSummary[] = [];
	userSummaries: UserSummary[] = [];

	async ngOnInit(): Promise<void> {
		await this.loadRoles();
	}

	async loadRoles(): Promise<void> {
		try {
			const rolesResponse = await this.rest_role.search({ limit: 99999 });
			this.roleList = rolesResponse.data;
		} catch (error) {
			this.rest.showError(error);
		}
	}

	async onRoleSelected(): Promise<void> {
		if (!this.selectedRoleId) {
			this.roleUsers = [];
			this.roleEcommerceItems = [];
			this.orderRows = [];
			this.resetNewRowForm();
			return;
		}

		this.isLoadingRole = true;

		try {
			// Load role users
			const roleUsersResponse = await this.rest_role_user.search({
				role_id: this.selectedRoleId,
				limit: 99999
			});
			const roleUsers = roleUsersResponse.data;

			// Get user IDs
			const userIds = roleUsers.map(ru => ru.user_id);

			// Load users
			if (userIds.length > 0) {
				const usersResponse = await this.rest_user.search({
					'id,': userIds,
					limit: 99999
				});
				this.roleUsers = usersResponse.data;
			} else {
				this.roleUsers = [];
			}

			// Load role ecommerce items
			const roleEcommerceItemsResponse = await this.rest_role_ecommerce_item.search({
				role_id: this.selectedRoleId,
				limit: 99999
			});
			const roleEcommerceItems = roleEcommerceItemsResponse.data;

			// Get ecommerce item IDs
			const ecommerceItemIds = roleEcommerceItems.map(rei => rei.ecommerce_item_id);

			// Load ecommerce items
			if (ecommerceItemIds.length > 0) {
				const ecommerceItemsResponse = await this.rest_ecommerce_item.search({
					'id,': ecommerceItemIds,
					limit: 99999
				});
				this.roleEcommerceItems = ecommerceItemsResponse.data;
			} else {
				this.roleEcommerceItems = [];
			}

			// Reset order rows when role changes
			this.orderRows = [];
			this.resetNewRowForm();

			// Initialize filtered lists
			this.filteredItems = [...this.roleEcommerceItems];
			this.filteredUsers = [...this.roleUsers];

			this.rest.showSuccess(`Cargados ${this.roleUsers.length} usuarios y ${this.roleEcommerceItems.length} items`);

		} catch (error) {
			this.rest.showError(error);
		} finally {
			this.isLoadingRole = false;
		}
	}

	onItemSearchChange(): void {
		if (!this.itemSearchTerm.trim()) {
			this.filteredItems = [...this.roleEcommerceItems];
			return;
		}

		const term = this.itemSearchTerm.toLowerCase();
		this.filteredItems = this.roleEcommerceItems.filter(item => {
			const code = (item.code || '').toLowerCase();
			const name = (item.name || '').toLowerCase();
			return code.includes(term) || name.includes(term);
		});
	}

	onUserSearchChange(): void {
		if (!this.userSearchTerm.trim()) {
			this.filteredUsers = [...this.roleUsers];
			return;
		}

		const term = this.userSearchTerm.toLowerCase();
		this.filteredUsers = this.roleUsers.filter(user => {
			const code = (user.code || '').toLowerCase();
			const name = (user.name || '').toLowerCase();
			return code.includes(term) || name.includes(term);
		});
	}

	addRow(): void {
		if (!this.selectedItemId || !this.selectedUserId) {
			this.rest.showError('Debe seleccionar un item y un usuario');
			return;
		}

		if (this.newRowQty <= 0) {
			this.rest.showError('La cantidad debe ser mayor a 0');
			return;
		}

		// Convert to numbers to ensure type match
		const itemId = Number(this.selectedItemId);
		const userId = Number(this.selectedUserId);

		// Find the item and user
		const item = this.roleEcommerceItems.find(i => i.id === itemId);
		const user = this.roleUsers.find(u => u.id === userId);

		if (!item || !user) {
			this.rest.showError('Item o usuario no encontrado');
			return;
		}

		// Add the row
		const newRow: OrderRow = {
			id: this.nextRowId++,
			ecommerce_item_id: itemId,
			ecommerce_item: item,
			user_id: userId,
			user: user,
			qty: this.newRowQty,
			notes: this.newRowNotes || ''
		};

		this.orderRows.push(newRow);
		this.calculateSummaries();
		this.resetNewRowForm();
		this.rest.showSuccess('Fila agregada');
	}

	removeRow(index: number): void {
		this.orderRows.splice(index, 1);
		this.calculateSummaries();
	}

	resetNewRowForm(): void {
		this.selectedItemId = null;
		this.selectedUserId = null;
		this.newRowQty = 1;
		this.newRowNotes = '';
		this.itemSearchTerm = '';
		this.userSearchTerm = '';
		this.filteredItems = [...this.roleEcommerceItems];
		this.filteredUsers = [...this.roleUsers];
	}

	calculateSummaries(): void {
		// Calculate item summaries
		const itemMap = new Map<number, number>();
		for (const row of this.orderRows) {
			const current = itemMap.get(row.ecommerce_item_id) || 0;
			itemMap.set(row.ecommerce_item_id, current + row.qty);
		}

		this.itemSummaries = Array.from(itemMap.entries()).map(([ecommerce_item_id, totalQty]) => {
			const item = this.roleEcommerceItems.find(i => i.id === ecommerce_item_id);
			return {
				ecommerce_item_id,
				ecommerce_item: item,
				totalQty
			};
		});

		// Calculate user summaries
		const userMap = new Map<number, number>();
		for (const row of this.orderRows) {
			const current = userMap.get(row.user_id) || 0;
			userMap.set(row.user_id, current + row.qty);
		}

		this.userSummaries = Array.from(userMap.entries()).map(([user_id, totalQty]) => {
			const user = this.roleUsers.find(u => u.id === user_id);
			return {
				user_id,
				user: user!,
				totalQty
			};
		});
	}

	canSave(): boolean {
		return this.orderRows.length > 0;
	}

	async saveOrder(): Promise<void> {
		if (!this.canSave()) {
			this.rest.showError('Debe agregar al menos una fila');
			return;
		}

		try {
			// Group rows by item
			const itemMap = new Map<number, OrderRow[]>();
			for (const row of this.orderRows) {
				if (!itemMap.has(row.ecommerce_item_id)) {
					itemMap.set(row.ecommerce_item_id, []);
				}
				itemMap.get(row.ecommerce_item_id)!.push(row);
			}

			// Build order_items_info
			const order_items_info = Array.from(itemMap.entries()).map(([ecommerce_item_id, rows]) => {
				const user_order_items = rows.map(row => {
					const user_order_item = GetEmpty.user_order_item();
					user_order_item.user_id = row.user_id;
					user_order_item.order_item_id = 0;
					user_order_item.qty = row.qty;
					user_order_item.notes = row.notes || null;
					return user_order_item;
				});

				const totalQty = rows.reduce((sum, row) => sum + row.qty, 0);

				const order_item = GetEmpty.order_item();
				order_item.order_id = 0;
				order_item.ecommerce_item_id = ecommerce_item_id;
				order_item.qty = totalQty;
				order_item.unit_price = null;
				order_item.notes = null;

				return {
					order_item: order_item,
					user_order_items: user_order_items
				};
			});

			const order = GetEmpty.order();
			order.id = 0;
			order.ecommerce_id = this.rest.ecommerce.id;
			order.order_number = null;
			order.status = 'PENDING';
			order.pos_order_id = null;
			order.pos_order_json = null;
			order.order_date = new Date();
			order.notes = this.orderNotes || 'Orden creada manualmente';
			order.created_by_user_id = this.rest.user.id;

			const payload: Order_Info = {
				order: order,
				order_items_info: order_items_info
			};

			// Call backend endpoint order_info.php
			const rest_order_info = new Rest<Order, Order_Info>(this.rest, 'order_info.php');
			const result = await rest_order_info.create(payload);

			this.rest.showSuccess(`Orden #${result.order.id} creada exitosamente con ${order_items_info.length} items`);

			// Reset form
			this.selectedRoleId = null;
			this.roleUsers = [];
			this.roleEcommerceItems = [];
			this.orderRows = [];
			this.orderNotes = '';
			this.itemSummaries = [];
			this.userSummaries = [];
			this.resetNewRowForm();

		} catch (error) {
			this.rest.showError(error);
		}
	}
}
