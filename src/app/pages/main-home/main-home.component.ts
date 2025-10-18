import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { Role } from '../../models/RestModels/Role';
import { RestResponse } from '../../classes/RestResponse';

@Component({
	selector: 'app-main-home',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './main-home.component.html',
	styleUrls: ['./main-home.component.css']
})
export class MainHomeComponent extends BaseComponent implements OnInit {

	rest_role: Rest<Role, Role> = new Rest<Role, Role>(this.rest, 'role.php');
	role_list: Role[] = [];

	ngOnInit(): void
	{
		this.queryParamsObservable.subscribe((params: any) => {

			if( params.has('role_id') )
			{
				this.role_list = [];

				Promise.all([
				this.rest_role.get(params.get('role_id'))
					.then((role: Role) => {
						this.role_list = [role];
					})
					.catch((error: any) => {
						this.rest.showError(error);
					})
			}
			else
			{
				this.rest_role.search({ limit: 999999 })
				.then((response: RestResponse<Role>) => {
					this.role_list = response.data;
				})
				.catch((error: any) => {
					this.rest.showError(error);
				});
			}
		});
	}
}
