import { Component, OnInit } from '@angular/core';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap, RouterLink } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImagePipe } from '../../pipes/image.pipe';
import { PaginationComponent } from '../../components/pagination/pagination.component';

interface CEcommerceItemInfo {
	ecommerce_item: Ecommerce_Item;
	item_info: any;
}

@Component({
	selector: 'app-list-ecommerce-item',
	imports: [CommonModule, FormsModule, ImagePipe, RouterLink, PaginationComponent],
	templateUrl: './list-ecommerce-item.component.html',
	styleUrl: './list-ecommerce-item.component.css'
})
export class ListEcommerceItemComponent extends BaseComponent implements OnInit {

	rest_item: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'item_info.php');
	rest_ecommerce_item: Rest<Ecommerce_Item,Ecommerce_Item> = new Rest<Ecommerce_Item,Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	ecommerce_item_list: Ecommerce_Item[] = [];
	cecommerce_item_info: CEcommerceItemInfo[] = [];
	searchTerm: string = '';

	ngOnInit(): void
	{
		this.path = '/list-ecommerce-item';

		this.route.queryParamMap.subscribe((params:ParamMap) =>
		{
			let page = params.has('page') ? parseInt( params.get('page')! ) : 0;
			let limit = params.has('limit') ? parseInt( params.get('limit')! ) : 20;

			this.current_page = page;
			this.page_size = limit;

			// Get search term from query params if exists
			if (params.has('name~~')) {
				this.searchTerm = params.get('name~~')!;
			}

			let url_params = this.rest_ecommerce_item.getUrlParams( params );

			//url_params.set('ecommerce_id', ''+this.rest.ecommerce.id);

			this.rest_ecommerce_item.search(url_params)
			.then((response:RestResponse<Ecommerce_Item>) =>
			{
				this.ecommerce_item_list = response.data;
				this.setPages(this.current_page, response.total);
				let ids = response.data.map((i)=>i.item_id);

				// Build search params for items
				let item_search_params: any = { 'id,': ids };

				// If there's a search term, add it to filter by name
				if (this.searchTerm) {
					item_search_params['name~~'] = this.searchTerm;
				}

				return Promise.all([response, this.rest_item.search(item_search_params)]);
			})
			.then(([response, item_response]) =>
			{
				// Filter ecommerce items to only include those with matching item_info
				const matched_item_ids = new Set(item_response.data.map((item: any) => item.item.id));

				this.cecommerce_item_info = response.data
					.filter((ecommerce_item: Ecommerce_Item) => matched_item_ids.has(ecommerce_item.item_id))
					.map((ecommerce_item: Ecommerce_Item) => {
						const item_info = item_response.data.find((item: any) => item.item.id === ecommerce_item.item_id);
						return {
							ecommerce_item: ecommerce_item,
							item_info: item_info
						}
					});
			})
			.catch((error:any) =>
			{
				this.rest.showError(error);
			});
		});
	}

	onSearch(): void {
		this.router.navigate(['/list-ecommerce-item'], { queryParams: { 'name~~': this.searchTerm, 'page': 0 } });
	}
}
