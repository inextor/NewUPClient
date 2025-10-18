import { Component, OnInit } from '@angular/core';
import { User } from '../../models/RestModels/User';
import { RestService } from '../../services/rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rest } from '../../classes/Rest';
import { BaseComponent } from '../base/base.component';
import { GetEmpty } from '../../models/GetEmpty';

@Component({
	selector: 'app-save-user',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './save-user.component.html',
	styleUrls: ['./save-user.component.css']
})
export class SaveUserComponent extends BaseComponent implements OnInit {

	rest_user: Rest<User, User> = new Rest<User, User>(this.rest, 'user.php');
	user: User = GetEmpty.user();

	ngOnInit(): void {
		this.route.queryParamMap.subscribe(params => {
			const id = params.get('id');
			let p = id ? this.rest_user.get(id) : Promise.resolve(GetEmpty.user());
			p.then((user) => {
				this.user = user;
			})
			.catch((err) => {
				this.rest.showError(err);
			});
		});
	}

	save() {
		// Validate only name is required
		if (!this.user.name || this.user.name.trim() === '') {
			this.rest.showError('El nombre es requerido');
			return;
		}

		// Set username to null if empty
		if (!this.user.username || this.user.username.trim() === '') {
			this.user.username = null as any;
		}

		// Set code to null if empty
		if (!this.user.code || this.user.code.trim() === '') {
			this.user.code = null;
		}

		// Set password to null if empty
		if (!this.user.password || this.user.password.trim() === '') {
			this.user.password = null;
		}

		this.is_loading = true;
		let promise = this.user.id ? this.rest_user.update(this.user) : this.rest_user.create(this.user);
		promise.then(() => {
			this.is_loading = false;
			this.rest.showSuccess('Usuario guardado correctamente');
			this.router.navigate(['/list-user']);
		})
		.catch((err) => {
			this.is_loading = false;
			this.rest.showError(err);
		});
	}
}
