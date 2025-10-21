import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { Rest } from '../../classes/Rest';
import { RestResponse } from '../../classes/RestResponse';
import { ImagePipe } from '../../pipes/image.pipe';

interface ItemInfo {
	item: {
		id: number;
		name: string;
		description: string | null;
		image_id: number | null;
	};
	category: {
		id: number;
		name: string;
	} | null;
	prices: Array<{
		id: number;
		price: number;
		currency_id: string;
	}>;
	attributes: any[];
	records: any[];
	options: any[];
	exceptions: any[];
	serials: any[];
}

@Component({
	selector: 'app-product-detail',
	standalone: true,
	imports: [CommonModule, ImagePipe],
	templateUrl: './product-detail.component.html',
	styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent extends BaseComponent implements OnInit {
	ecommerce_item_id: number | null = null;
	ecommerce_item: Ecommerce_Item | null = null;
	item_info: ItemInfo | null = null;
	mainImageId: number | null = null;
	additionalImageIds: number[] = [];

	rest_item: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'item_info.php');
	rest_ecommerce_item: Rest<Ecommerce_Item,Ecommerce_Item> = new Rest<Ecommerce_Item,Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	rest_item_image: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'item_image.php');

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			const id = params.get('ecommerce_item_id');
			if (id) {
				this.ecommerce_item_id = +id;
				this.fetchProductDetails();
			}
		});
	}

	fetchProductDetails(): void {
		if (!this.ecommerce_item_id) {
			return;
		}

		this.rest_ecommerce_item.get(this.ecommerce_item_id)
		.then((ecommerce_item: Ecommerce_Item) => {
			this.ecommerce_item = ecommerce_item;

			// Fetch item_info from POS API using item_id
			return this.rest_item.get(this.ecommerce_item.item_id);
		})
		.then((item_info: ItemInfo) => {
			this.item_info = item_info;

			// Set main image from item.image_id
			if (this.item_info.item.image_id) {
				this.mainImageId = this.item_info.item.image_id;
			}

			// Fetch additional images for this item
			return this.rest_item_image.search({ 'item_id': this.item_info.item.id });
		})
		.then((item_image_response: RestResponse<any>) => {
			// Extract image_id from each item_image
			if (item_image_response.data && item_image_response.data.length > 0) {
				this.additionalImageIds = item_image_response.data.map((img: any) => img.image_id);
			}
		})
		.catch((error: any) => {
			this.rest.showError(error);
		});
	}

	setMainImage(imageId: number): void {
		this.mainImageId = imageId;
	}

	addToCart(ecommerce_item_id: number): void {
		// TODO: Implement add to cart logic
		console.log('Adding item to cart:', ecommerce_item_id);
		this.rest.showSuccess('Producto agregado al carrito');
	}
}
