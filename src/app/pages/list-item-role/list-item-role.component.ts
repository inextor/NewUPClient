import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Role_Item } from '../../models/RestModels/Role_Item';
import { Role } from '../../models/RestModels/Role';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';
import { GetEmpty } from '../../models/GetEmpty';

interface CItemRoleInfo {
	role_item: Role_Item;
	item: any; // Item info from POS
}

@Component({
	selector: 'app-list-item-role',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './list-item-role.component.html',
	styleUrl: './list-item-role.component.css'
})
export class ListItemRoleComponent extends BaseComponent implements OnInit {

	rest_role_item: Rest<Role_Item,Role_Item> = new Rest<Role_Item,Role_Item>(this.rest, 'role_item.php');
	rest_role: Rest<Role,Role> = new Rest<Role,Role>(this.rest, 'role.php');
	rest_item: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'item_info.php');

	role_item_list: Role_Item[] = [];
	role: Role | null = null;
	role_id: number | null = null;

	added_item_list: CItemRoleInfo[] = [];

	showAddModal = false;
	newItemId: number = 0;
	newQuota = 0;
	newPeriodType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'unlimited' | 'Quota renewal period' = 'unlimited';
	newPeriodQuantity = 0;

	ngOnInit(): void {
		this.route.queryParamMap.subscribe((params:ParamMap) =>
		{
			let page = params.has('page') ? parseInt( params.get('page')! ) : 0;
			let limit = params.has('limit') ? parseInt( params.get('limit')! ) : 20;

			let url_params = this.rest_role_item.getUrlParams( params );

			// Store role_id if present
			if(params.has('role_id')) {
				this.role_id = parseInt(params.get('role_id')!);
			}

			Promise.all([
				this.role_id ? this.rest_role.get(this.role_id.toString()) : Promise.resolve(null),
				this.rest_role_item.search(url_params)
			])
			.then(([role, role_item_response]) =>
			{
				this.role = role;
				this.role_item_list = role_item_response.data;

				// Fetch item info for each role_item
				const itemPromises = this.role_item_list.map(role_item =>
					this.rest_item.get(role_item.item_id)
						.then(item => ({
							role_item: role_item,
							item: item
						}))
						.catch(() => ({
							role_item: role_item,
							item: { id: role_item.item_id, name: 'Item no encontrado' }
						}))
				);

				return Promise.all(itemPromises);
			})
			.then((itemRoleInfos) =>
			{
				this.added_item_list = itemRoleInfos;
			})
			.catch((error:any) =>
			{
				this.rest.showError(error);
			});
		});
	}

	deleteRoleItem(ciri: CItemRoleInfo): void {
		if(!confirm('¿Está seguro de eliminar este artículo del rol?')) {
			return;
		}

		this.rest_role_item.delete(ciri.role_item.id)
			.then(() => {
				this.rest.showSuccess('Artículo eliminado correctamente');
				this.added_item_list = this.added_item_list.filter(ri => ri.role_item.id !== ciri.role_item.id);
			})
			.catch((error:any) => {
				this.rest.showError(error);
			});
	}
}
