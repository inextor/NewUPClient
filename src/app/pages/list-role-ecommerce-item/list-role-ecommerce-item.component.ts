import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Role_Ecommerce_Item } from '../../models/RestModels/Role_Ecommerce_Item';
import { Role } from '../../models/RestModels/Role';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';
import { GetEmpty } from '../../models/GetEmpty';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';

interface CRoleItemInfo {
	role_ecommerce_item: Role_Ecommerce_Item;
	role: Role;
}

@Component({
	selector: 'app-list-role-ecommerce-item',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './list-role-ecommerce-item.component.html',
	styleUrl: './list-role-ecommerce-item.component.css'
})
export class ListRoleEcommerceItemComponent extends BaseComponent implements OnInit {

	rest_role_ecommerce_item: Rest<Role_Ecommerce_Item,Role_Ecommerce_Item> = new Rest<Role_Ecommerce_Item,Role_Ecommerce_Item>(this.rest, 'role_ecommerce_item.php');
	rest_role: Rest<Role,Role> = new Rest<Role,Role>(this.rest, 'role.php');
	rest_item: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'item_info.php');

	role_ecommerce_item_list: Role_Ecommerce_Item[] = [];
	role_list: Role[] = [];
	ecommerce_item_id: number | null = null;
	item_info: any = null;

	added_role_list: CRoleItemInfo[] = [];

	showAddModal = false;
	newRoleName = '';
	newQuota = 0;
	newPeriodType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'unlimited' | 'Quota renewal period' = 'unlimited';
	newPeriodQuantity = 0;

	showEditModal = false;
	editingRoleItem: CRoleItemInfo | null = null;
	editRoleName = '';
	editQuota = 0;
	editPeriodType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'unlimited' | 'Quota renewal period' = 'unlimited';
	editPeriodQuantity = 0;
    rest_ecommerce_item: Rest<Ecommerce_Item,Ecommerce_Item> = new Rest<Ecommerce_Item,Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	ngOnInit(): void {
		this.route.queryParamMap.subscribe((params:ParamMap) =>
		{
			let page = params.has('page') ? parseInt( params.get('page')! ) : 0;
			let limit = params.has('limit') ? parseInt( params.get('limit')! ) : 20;

			let url_params = this.rest_role_ecommerce_item.getUrlParams( params );


			// Store ecommerce_item_id if present
			if(params.has('ecommerce_item_id')) {
				this.ecommerce_item_id = parseInt(params.get('ecommerce_item_id')!);
			}

			Promise.all([
				this.rest_ecommerce_item.get( this.ecommerce_item_id! ),
				this.rest_role_ecommerce_item.search(url_params),
				this.rest_role.search({limit: 999999})
			])
			.then(([ecommerce_item, role_ecommerce_item_response, role_response]) =>
			{
				return Promise.all([
					this.rest_item.get(ecommerce_item.item_id as number),
					role_ecommerce_item_response,
					role_response
				]);
			})
			.then(([item_info, role_ecommerce_item_response, role_response]) =>
			{
				this.item_info = item_info;
				this.role_ecommerce_item_list = role_ecommerce_item_response.data;
				this.role_list = role_response.data;

				this.added_role_list = this.role_ecommerce_item_list
				.map(role_ecommerce_item =>
				{
					let role = this.role_list.find(r => r.id === role_ecommerce_item.role_id) as Role;
					return {
						role_ecommerce_item: role_ecommerce_item,
						role: role
					}
				});
			})
			.catch((error:any) =>
			{
				this.rest.showError(error);
			});
		});
	}

	deleteRoleItem(crii: CRoleItemInfo): void {
		if(!confirm('¿Está seguro de eliminar este rol del artículo?')) {
			return;
		}

		this.rest_role_ecommerce_item.delete(crii.role_ecommerce_item.id)
			.then(() => {
				this.rest.showSuccess('Rol eliminado correctamente');
				this.added_role_list = this.added_role_list.filter(ri => ri.role_ecommerce_item.id !== crii.role_ecommerce_item.id);
			})
			.catch((error:any) => {
				this.rest.showError(error);
			});
	}

	openAddModal(): void {
		this.showAddModal = true;
		this.newRoleName = '';
		this.newQuota = 0;
		this.newPeriodType = 'unlimited';
		this.newPeriodQuantity = 0;
	}

	closeAddModal(): void {
		this.showAddModal = false;
		this.newRoleName = '';
		this.newQuota = 0;
		this.newPeriodType = 'unlimited';
		this.newPeriodQuantity = 0;
	}

	async addRoleToItem(): Promise<void> {
		if(!this.ecommerce_item_id) {
			this.rest.showError('No item ID provided');
			return;
		}

		if(!this.newRoleName.trim()) {
			this.rest.showError('El nombre del rol es requerido');
			return;
		}

		try {
			// Check if role exists
			let role = this.role_list.find(r => r.name === this.newRoleName);

			// If role doesn't exist, create it
			if(!role) {
				const newRole = GetEmpty.role();
				newRole.name = this.newRoleName as any;
				newRole.ecommerce_id = this.rest.ecommerce.id;
				role = await this.rest_role.create(newRole);
				this.role_list.push(role);
			}

			// Check if role is already assigned to this item
			const roleAlreadyAssigned = this.added_role_list.some(crii => crii.role.id === role!.id);
			if(roleAlreadyAssigned) {
				this.rest.showError('Este rol ya está asignado al artículo');
				return;
			}

			// Create role_ecommerce_item relationship
			const newRoleItem = GetEmpty.role_ecommerce_item();
			newRoleItem.ecommerce_item_id = this.ecommerce_item_id;
			newRoleItem.role_id = role.id;
			newRoleItem.quota = this.newQuota;
			newRoleItem.period_type = this.newPeriodType;
			newRoleItem.period_quantity = this.newPeriodQuantity;

			const createdRoleItem = await this.rest_role_ecommerce_item.create(newRoleItem);
			this.role_ecommerce_item_list.push(createdRoleItem);
			this.added_role_list.push
			({
				role_ecommerce_item: createdRoleItem,
				role: role
			});

			this.rest.showSuccess('Rol agregado correctamente');
			this.closeAddModal();
		} catch(error) {
			this.rest.showError(error);
		}
	}
	openEditModal(crii: CRoleItemInfo): void {
		this.editingRoleItem = crii;
		this.editRoleName = crii.role.name;
		this.editQuota = crii.role_ecommerce_item.quota;
		this.editPeriodType = crii.role_ecommerce_item.period_type;
		this.editPeriodQuantity = crii.role_ecommerce_item.period_quantity;
		this.showEditModal = true;
	}

	closeEditModal(): void {
		this.showEditModal = false;
		this.editingRoleItem = null;
		this.editRoleName = '';
		this.editQuota = 0;
		this.editPeriodType = 'unlimited';
		this.editPeriodQuantity = 0;
	}

	async updateRoleItem(): Promise<void> {
		if(!this.editingRoleItem) {
			this.rest.showError('No role item selected for editing');
			return;
		}

		try {
			// Update the role_ecommerce_item with new values
			const updatedRoleItem = {...this.editingRoleItem.role_ecommerce_item};
			updatedRoleItem.quota = this.editQuota;
			updatedRoleItem.period_type = this.editPeriodType;
			updatedRoleItem.period_quantity = this.editPeriodQuantity;

			await this.rest_role_ecommerce_item.update(updatedRoleItem);

			// Update the local list
			const index = this.added_role_list.findIndex(ri => ri.role_ecommerce_item.id === updatedRoleItem.id);
			if(index !== -1) {
				this.added_role_list[index].role_ecommerce_item = updatedRoleItem;
			}

			this.rest.showSuccess('Rol actualizado correctamente');
			this.closeEditModal();
		} catch(error) {
			this.rest.showError(error);
		}
	}
}
