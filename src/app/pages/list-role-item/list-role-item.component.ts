import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role_Item } from '../../models/RestModels/Role_Item';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';

@Component({
  selector: 'app-list-role-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-role-item.component.html',
  styleUrl: './list-role-item.component.css'
})
export class ListRoleItemComponent extends BaseComponent implements OnInit {

  rest_role_item: Rest<Role_Item,Role_Item> = new Rest<Role_Item,Role_Item>(this.rest, 'role_item.php');
  role_item_list: Role_Item[] = [];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params:ParamMap) =>
    {
      let page = params.has('page') ? parseInt( params.get('page')! ) : 0;
      let limit = params.has('limit') ? parseInt( params.get('limit')! ) : 20;

      let url_params = this.rest_role_item.getUrlParams( params );

      this.rest_role_item.search(url_params).then((response:RestResponse<Role_Item>) =>
      {
        this.role_item_list = response.data;
      })
      .catch((error:any) =>
      {
        this.rest.showError(error);
      });
    });
  }
}