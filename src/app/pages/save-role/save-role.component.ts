import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { Role } from '../../models/RestModels/Role';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GetEmpty } from '../../models/GetEmpty';
import { ImageUploaderComponent } from '../../components/image-uploader/image-uploader.component';

@Component({
	selector: 'app-save-role',
	standalone: true,
	imports: [CommonModule, FormsModule, ImageUploaderComponent],
	templateUrl: './save-role.component.html',
	styleUrls: ['./save-role.component.css']
})
export class SaveRoleComponent extends BaseComponent implements OnInit {

	rest_role: Rest<Role, Role> = new Rest<Role, Role>(this.rest, 'role.php');
	role: Role = GetEmpty.role();

	ngOnInit(): void
	{
		this.route.paramMap.subscribe(params => {
			const id = params.get('id');
			let p = id ? this.rest_role.get(id) : Promise.resolve(GetEmpty.role());
			p.then((role) => {
				this.role = role;
				// Set ecommerce_id for new roles
				if(!this.role.id) {
					this.role.ecommerce_id = this.rest.ecommerce.id;
				}
			})
			.catch((err) =>
			{
				this.rest.showError(err);
			});
		});
	}

	save() {
		let promise = this.role.id ? this.rest_role.update(this.role) : this.rest_role.create(this.role);
		promise.then(() => {
			this.rest.showSuccess('Rol guardado correctamente');
			this.router.navigate(['/list-role']);
		})
		.catch((err) => {
			this.rest.showError(err);
		});
	}
}
