import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Role_Item } from '../../models/RestModels/Role_Item';
import { Role } from '../../models/RestModels/Role';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { GetEmpty } from '../../models/GetEmpty';

@Component({
	selector: 'app-save-role-item',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './save-role-item.component.html',
	styleUrl: './save-role-item.component.css'
})
export class SaveRoleItemComponent extends BaseComponent implements OnInit {

	rest_role_item: Rest<Role_Item, Role_Item> = new Rest<Role_Item, Role_Item>(this.rest, 'role_item.php');
	rest_role: Rest<Role, Role> = new Rest<Role, Role>(this.rest, 'role.php');

	role_item: Role_Item = GetEmpty.role_item();
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

		// Load role_item if editing
		this.route.queryParamMap.subscribe(params => {
			const id = params.get('id');
			const item_id = params.get('item_id');

			if (item_id) {
				this.role_item.item_id = parseInt(item_id);
			}

			let p = id ? this.rest_role_item.get(id) : Promise.resolve(GetEmpty.role_item());
			p.then((role_item) => {
				this.role_item = role_item;
				// Preserve item_id from query param if it was set
				if (item_id && !this.role_item.item_id) {
					this.role_item.item_id = parseInt(item_id);
				}
			})
			.catch((err) => {
				this.rest.showError(err);
			});
		});
	}

	save() {
		// Validate required fields
		if (!this.role_item.item_id) {
			this.rest.showError('El ID del artículo es requerido');
			return;
		}

		if (!this.role_item.role_id) {
			this.rest.showError('Debe seleccionar un rol');
			return;
		}

		this.is_loading = true;
		let promise = this.role_item.id ? this.rest_role_item.update(this.role_item) : this.rest_role_item.create(this.role_item);
		promise.then(() => {
			this.is_loading = false;
			this.rest.showSuccess('Relación rol-artículo guardada correctamente');
			this.router.navigate(['/list-role-item'], { queryParams: { item_id: this.role_item.item_id } });
		})
		.catch((err) => {
			this.is_loading = false;
			this.rest.showError(err);
		});
	}

	cancel() {
		if (this.role_item.item_id) {
			this.router.navigate(['/list-role-item'], { queryParams: { item_id: this.role_item.item_id } });
		} else {
			this.router.navigate(['/list-role-item']);
		}
	}
}
