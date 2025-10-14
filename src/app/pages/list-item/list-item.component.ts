import { Component, OnInit } from '@angular/core';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';

interface CEcommerceItemInfo {
	ecommerce_item: Ecommerce_Item;
}

@Component({
	selector: 'app-list-item',
	imports: [],
	templateUrl: './list-item.component.html',
	styleUrl: './list-item.component.css'
})
export class ListItemComponent extends BaseComponent implements OnInit {

	rest_ecommerce_item: Rest<Ecommerce_Item,Ecommerce_Item> = new Rest<Ecommerce_Item,Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	ecommerce_item_list: Ecommerce_Item[] = [];

	ngOnInit(): void
	{
		this.route.queryParamMap.subscribe((params:ParamMap) =>
		{
			let page = params.has('page') ? parseInt( params.get('page')! ) : 0;
			let limit = params.has('limit') ? parseInt( params.get('limit')! ) : 20;


			let url_params = this.rest_ecommerce_item.getUrlParams( params );

			//url_params.set('ecommerce_id', ''+this.rest.ecommerce.id);

			this.rest_ecommerce_item.search(url_params).then((response:RestResponse<Ecommerce_Item>) =>
			{
				this.ecommerce_item_list = response.data;
			})
			.catch((error:any) =>
			{
				this.rest.showError(error);
			});
		});
	}
}
