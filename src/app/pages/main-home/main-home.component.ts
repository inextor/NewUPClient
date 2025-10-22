import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ParamMap } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { Role } from '../../models/RestModels/Role';
import { RestResponse } from '../../classes/RestResponse';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { ItemCatalogComponent } from '../../components/item-catalog/item-catalog.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

interface CEcommerceItemInfo {
	ecommerce_item: Ecommerce_Item;
	item_info: any;
}


@Component({
	selector: 'app-main-home',
	standalone: true,
	imports: [CommonModule, RouterLink, ItemCatalogComponent, PaginationComponent],
	templateUrl: './main-home.component.html',
	styleUrls: ['./main-home.component.css']
})
export class MainHomeComponent extends BaseComponent implements OnInit {

	rest_role: Rest<Role, Role> = new Rest<Role, Role>(this.rest, 'role.php');
	rest_item: Rest<any, any> = new Rest<any, any>(this.rest.pos_rest, 'item_info.php');
	rest_ecommerce_item: Rest<Ecommerce_Item, Ecommerce_Item> = new Rest<Ecommerce_Item, Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	rest_role_ecommerce_item: Rest<any, any> = new Rest<any, any>(this.rest, 'role_ecommerce_item.php');

	role_list: Role[] = [];
	ecommerce_item_list: Ecommerce_Item[] = [];
	cecommerce_item_list: CEcommerceItemInfo[] = [];

	ngOnInit(): void {
		this.path = '/';

		this.getParamsAndQueriesObservable().subscribe((params: any) => {
			const page = params.query.has('page') ? parseInt(params.query.get('page')!) : 0;
			const limit = params.query.has('limit') ? parseInt(params.query.get('limit')!) : 100;

			this.current_page = page;
			this.page_size = limit;

			if (params.query.has('role_id')) {
				// Fetch single role and its items
				const role_id = params.query.get('role_id');

				this.rest_role.get(role_id)
					.then((role: Role) => {
						this.role_list = [role];

						// Fetch items for this role using role_item relationship with pagination
						return this.rest_role_ecommerce_item.search({
							role_id: role_id,
							limit: limit,
							page: page
						});
					})
					.then((role_ecommerce_item_response: any) => {
						// Get ecommerce_item IDs from role_ecommerce_item
						const ecommerce_item_ids = role_ecommerce_item_response.data.map((rei: any) => rei.ecommerce_item_id);

						if (ecommerce_item_ids.length === 0) {
							this.cecommerce_item_list = [];
							this.setPages(this.current_page, 0);
							return;
						}

						// Fetch ecommerce_items for these ecommerce_item_ids
						return Promise.all([
							role_ecommerce_item_response,
							this.rest_ecommerce_item.search({ 'id,': ecommerce_item_ids, limit: 999999 })
						]);
					})
					.then((result: any) => {
						if (!result) return;

						const [role_ecommerce_item_response, ecommerce_item_response] = result;

						this.ecommerce_item_list = ecommerce_item_response.data;
						const item_ids = ecommerce_item_response.data.map((i: any) => i.item_id);

						// Set pagination
						this.setPages(this.current_page, role_ecommerce_item_response.total);

						// Fetch full item info
						return Promise.all([ecommerce_item_response, this.rest_item.search({ 'id,': item_ids })]);
					})
					.then((result: any) => {
						if (!result) return;

						const [ecommerce_item_response, item_response] = result;
						this.cecommerce_item_list = ecommerce_item_response.data
							.map((ecommerce_item: Ecommerce_Item) => {
								// Find the matching item_info by item_id
								const matching_item_info = item_response.data.find((item_info: any) => item_info.item.id === ecommerce_item.item_id);
								return {
									ecommerce_item: ecommerce_item,
									item_info: matching_item_info
								}
							})
							.filter((ceii: CEcommerceItemInfo) => ceii.item_info !== undefined);
					})
					.catch((error: any) => {
						this.rest.showError(error);
					});
			}
			else {
				// Fetch all roles (no items)
				this.rest_role.search({ limit: 999999 })
					.then((response: RestResponse<Role>) => {
						this.role_list = response.data;
					})
					.catch((error: any) => {
						this.rest.showError(error);
					});

				// Clear items list and pagination
				this.cecommerce_item_list = [];
				this.setPages(0, 0);
			}
		});
	}
}
