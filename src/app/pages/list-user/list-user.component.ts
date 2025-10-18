import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../models/RestModels/User';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';

@Component({
  selector: 'app-list-user',
  imports: [CommonModule, RouterLink],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.css'
})
export class ListUserComponent extends BaseComponent implements OnInit {

  rest_user: Rest<User,User> = new Rest<User,User>(this.rest, 'user.php');
  user_list: User[] = [];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params:ParamMap) =>
    {
      let page = params.has('page') ? parseInt( params.get('page')! ) : 0;
      let limit = params.has('limit') ? parseInt( params.get('limit')! ) : 20;

      let url_params = this.rest_user.getUrlParams( params );

      this.rest_user.search(url_params).then((response:RestResponse<User>) =>
      {
        this.user_list = response.data;
      })
      .catch((error:any) =>
      {
        this.rest.showError(error);
      });
    });
  }
}
