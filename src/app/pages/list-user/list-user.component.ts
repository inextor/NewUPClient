import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../models/RestModels/User';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';

@Component({
	selector: 'app-list-user',
	imports: [CommonModule, RouterLink, FormsModule],
	templateUrl: './list-user.component.html',
	styleUrl: './list-user.component.css'
})
export class ListUserComponent extends BaseComponent implements OnInit {

	rest_user: Rest<User,User> = new Rest<User,User>(this.rest, 'user.php');
	user_list: User[] = [];
	searchTerm: string = '';
	search:string = '';

	search_object:SearchObject<User> = new SearchObject<User>(['name','username','email']);

	ngOnInit(): void {
		this.route.queryParamMap.subscribe((params:ParamMap) =>
		{
			search_object.assign( params );
			this.rest_user.search( search_object.getUrlParams() )
			.then((response:RestResponse<User>) =>
			{
				this.user_list = response.data;
			})
			.catch((error:any) =>
			{
				this.rest.showError(error);
			});
		});
	}

	onSearch(): void {
		this.router.navigate(['/list-user'], { queryParams: { 'name~~': this.search, 'page': 0 } });
	}
}
