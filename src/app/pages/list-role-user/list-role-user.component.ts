import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role_User } from '../../models/RestModels/Role_User';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';

@Component({
  selector: 'app-list-role-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-role-user.component.html',
  styleUrl: './list-role-user.component.css'
})
export class ListRoleUserComponent extends BaseComponent implements OnInit {

  rest_role_user: Rest<Role_User,Role_User> = new Rest<Role_User,Role_User>(this.rest, 'role_user.php');
  role_user_list: Role_User[] = [];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params:ParamMap) =>
    {
      let page = params.has('page') ? parseInt( params.get('page')! ) : 0;
      let limit = params.has('limit') ? parseInt( params.get('limit')! ) : 20;

      let url_params = this.rest_role_user.getUrlParams( params );

      this.rest_role_user.search(url_params).then((response:RestResponse<Role_User>) =>
      {
        this.role_user_list = response.data;
      })
      .catch((error:any) =>
      {
        this.rest.showError(error);
      });
    });
  }
}