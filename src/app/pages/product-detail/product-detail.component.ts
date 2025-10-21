import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { Rest } from '../../classes/Rest';
import { RestResponse } from '../../classes/RestResponse';
import { ImagePipe } from '../../pipes/image.pipe';

interface ItemInfo {
	id: number;
	name: string;
	description: string | null;
	image_id: number | null;
	images: Array<{
		attachment_id: number;
		file_id: number;
	}>;
}

interface ProductAttachment {
	attachment_id: number;
	title: string;
	description: string;
	url: string;
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
	attachments: ProductAttachment[] = [];

	rest_item: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'item_info.php');
	rest_ecommerce_item: Rest<Ecommerce_Item,Ecommerce_Item> = new Rest<Ecommerce_Item,Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	rest_attachment: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'attachment.php');

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

			// Set main image
			if (this.item_info.image_id) {
				this.mainImageId = this.item_info.image_id;
			}

			// Set additional images from item_info.images
			if (this.item_info.images && this.item_info.images.length > 0) {
				this.additionalImageIds = this.item_info.images.map(img => img.file_id);
			}

			// Fetch attachments for this item
			this.fetchAttachments();
		})
		.catch((error: any) => {
			this.rest.showError(error);
		});
	}

	fetchAttachments(): void {
		if (!this.ecommerce_item) {
			return;
		}

		// Search for attachments related to this item using ecommerce_item.item_id
		this.rest_attachment.search({ 'item_id': this.ecommerce_item.item_id })
		.then((response: RestResponse<ProductAttachment>) => {
			this.attachments = response.data;
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
