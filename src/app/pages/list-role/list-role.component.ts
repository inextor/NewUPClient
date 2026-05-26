import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../../models/RestModels/Role';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap, RouterModule } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';


@Component({
	selector: 'app-list-role',
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './list-role.component.html',
	styleUrl: './list-role.component.css'
})
export class ListRoleComponent extends BaseComponent implements OnInit {

	rest_role: Rest<Role,Role> = new Rest<Role,Role>(this.rest, 'role.php');
	role_list: Role[] = [];

	ngOnInit(): void {

		this.getParamsAndQueriesObservable()
		.subscribe((response) =>
		{
			const queryObj: any = {};
			response.query.keys.forEach(key => {
				queryObj[key] = response.query.get(key);
			});

			// Scope query to current ecommerce
			queryObj['ecommerce_id'] = this.rest.ecommerce.id;

			this.rest_role.search(queryObj).then((response:RestResponse<Role>) =>
			{
				this.role_list = response.data;
			})
			.catch((error:any) =>
			{
				this.rest.showError(error);
			});
		});
	}
}
