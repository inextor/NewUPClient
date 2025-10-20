import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Role_Ecommerce_Item } from '../../models/RestModels/Role_Ecommerce_Item';
import { Role } from '../../models/RestModels/Role';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { GetEmpty } from '../../models/GetEmpty';

@Component({
	selector: 'app-save-role-ecommerce-item',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './save-role-ecommerce-item.component.html',
	styleUrl: './save-role-ecommerce-item.component.css'
})
export class SaveRoleEcommerceItemComponent extends BaseComponent implements OnInit {

	rest_role_ecommerce_item: Rest<Role_Ecommerce_Item, Role_Ecommerce_Item> = new Rest<Role_Ecommerce_Item, Role_Ecommerce_Item>(this.rest, 'role_ecommerce_item.php');
	rest_role: Rest<Role, Role> = new Rest<Role, Role>(this.rest, 'role.php');

	role_ecommerce_item: Role_Ecommerce_Item = GetEmpty.role_ecommerce_item();
	role_list: Role[] = [];

	ngOnInit(): void {
		// Load all roles for the dropdown
		this.rest_role.search({ limit: 999999 })
			.then(response => {
				this.role_list = response.data;
			})
			.catch(err => {
				this.rest.showError(err);
			});

		// Load role_ecommerce_item if editing
		this.route.queryParamMap.subscribe(params => {
			const id = params.get('id');
			const ecommerce_item_id = params.get('ecommerce_item_id');

			if (ecommerce_item_id) {
				this.role_ecommerce_item.ecommerce_item_id = parseInt(ecommerce_item_id);
			}

			let p = id ? this.rest_role_ecommerce_item.get(id) : Promise.resolve(GetEmpty.role_ecommerce_item());
			p.then((role_ecommerce_item) => {
				this.role_ecommerce_item = role_ecommerce_item;
				// Preserve ecommerce_item_id from query param if it was set
				if (ecommerce_item_id && !this.role_ecommerce_item.ecommerce_item_id) {
					this.role_ecommerce_item.ecommerce_item_id = parseInt(ecommerce_item_id);
				}
			})
			.catch((err) => {
				this.rest.showError(err);
			});
		});
	}

	save() {
		// Validate required fields
		if (!this.role_ecommerce_item.ecommerce_item_id) {
			this.rest.showError('El ID del artículo es requerido');
			return;
		}

		if (!this.role_ecommerce_item.role_id) {
			this.rest.showError('Debe seleccionar un rol');
			return;
		}

		this.is_loading = true;
		let promise = this.role_ecommerce_item.id ? this.rest_role_ecommerce_item.update(this.role_ecommerce_item) : this.rest_role_ecommerce_item.create(this.role_ecommerce_item);
		promise.then(() => {
			this.is_loading = false;
			this.rest.showSuccess('Relación rol-artículo guardada correctamente');
			this.router.navigate(['/list-role-ecommerce-item'], { queryParams: { ecommerce_item_id: this.role_ecommerce_item.ecommerce_item_id } });
		})
		.catch((err) => {
			this.is_loading = false;
			this.rest.showError(err);
		});
	}

	cancel() {
		if (this.role_ecommerce_item.ecommerce_item_id) {
			this.router.navigate(['/list-role-ecommerce-item'], { queryParams: { ecommerce_item_id: this.role_ecommerce_item.ecommerce_item_id } });
		} else {
			this.router.navigate(['/list-role-ecommerce-item']);
		}
	}
}
