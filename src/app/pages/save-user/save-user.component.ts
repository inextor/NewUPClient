import { Component, OnInit } from '@angular/core';
import { User } from '../../models/RestModels/User';
import { RestService } from '../../services/rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rest } from '../../classes/Rest';
import { BaseComponent, ParamsAndQueriesMap } from '../base/base.component';
import { GetEmpty } from '../../models/GetEmpty';

@Component({
	selector: 'app-save-user',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './save-user.component.html',
	styleUrls: ['./save-user.component.css']
})
export class SaveUserComponent extends BaseComponent implements OnInit {

	rest_user = new Rest<User,User>(this.rest, 'user');

	user: User = {
			id: 0,
			name: '',
			username: '',
			password: '',
			type: 'USER',
			ecommerce_id: 0,
			created: '',
			updated: '',
			code: null
	};

	ngOnInit(): void {
		this.getParamsAndQueriesObservable().subscribe
		({
			next: (response: ParamsAndQueriesMap) => {

				let p = response.query.has('id')
					? this.rest_user.get(response.query.get('id') as string)
					: Promise.resolve(GetEmpty.user());

				p.then(response => {
					this.user = response;
				});
			}
		});
	}

	saveUser() {
		this.is_loading = true;
		if (this.user.id) {
			this.rest_user.create(this.user).then(response => {
				this.is_loading = false;
				this.router.navigate(['/list-user']);
			});
		} else {
			this.rest_user.update(this.user).then(response => {
				this.is_loading = false;
				this.router.navigate(['/list-user']);
			});
		}
	}
}
