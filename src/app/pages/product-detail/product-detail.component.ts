import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { Cart } from '../../models/RestModels/Cart';
import { Rest } from '../../classes/Rest';
import { RestResponse } from '../../classes/RestResponse';
import { ImagePipe } from '../../pipes/image.pipe';
import { ProductSizeRanges } from '../../classes/ProductSizeRanges';

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
	imports: [CommonModule, FormsModule, ImagePipe],
	templateUrl: './product-detail.component.html',
	styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent extends BaseComponent implements OnInit {
	ecommerce_item_id: number | null = null;
	ecommerce_item: Ecommerce_Item | null = null;
	item_info: ItemInfo | null = null;
	mainImageId: number | null = null;
	additionalImageIds: number[] = [];

	// Size selection
	availableSizes: string[] = [];
	sizeQuantities: { [size: string]: number } = {};
	showSizeModal: boolean = false;
	pendingEcommerceItemId: number | null = null;

	rest_item: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'item_info.php');
	rest_ecommerce_item: Rest<Ecommerce_Item,Ecommerce_Item> = new Rest<Ecommerce_Item,Ecommerce_Item>(this.rest, 'ecommerce_item.php');
	rest_item_image: Rest<any,any> = new Rest<any,any>(this.rest.pos_rest, 'item_image.php');
	rest_cart: Rest<Cart,Cart> = new Rest<Cart,Cart>(this.rest, 'cart.php');

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
			// Start with main image
			const imageIds: number[] = [];

			if (this.mainImageId) {
				imageIds.push(this.mainImageId);
			}

			// Add additional images from item_image
			if (item_image_response.data && item_image_response.data.length > 0) {
				const additionalIds = item_image_response.data.map((img: any) => img.image_id);
				imageIds.push(...additionalIds);
			}

			this.additionalImageIds = imageIds;

			// Parse available sizes from ecommerce_item.sizes
			if (this.ecommerce_item?.sizes) {
				// Map size category to ProductSizeRanges
				switch (this.ecommerce_item.sizes) {
					case 'pantalon dama':
						this.availableSizes = [...ProductSizeRanges.PANTALON_DAMA];
						break;
					case 'pantalon caballero':
						this.availableSizes = [...ProductSizeRanges.PANTALON_CABALLERO];
						break;
					case 'camisa':
						this.availableSizes = [...ProductSizeRanges.CAMISAS_CHALECOS_SUDADERAS_CHAMARRAS];
						break;
					case 'calzado':
						this.availableSizes = [...ProductSizeRanges.CALZADO];
						break;
					case 'unico':
						this.availableSizes = [];
						break;
				}

				// Initialize size quantities to 0
				this.sizeQuantities = {};
				this.availableSizes.forEach(size => {
					this.sizeQuantities[size] = 0;
				});
			}
		})
		.catch((error: any) => {
			this.rest.showError(error);
		});
	}

	setMainImage(imageId: number): void {
		this.mainImageId = imageId;
	}

	openSizeModal(ecommerce_item_id: number): void {
		// If size is 'unico' or no sizes available, add directly
		if (!this.ecommerce_item?.sizes || this.ecommerce_item.sizes === 'unico') {
			// Add single item to cart without size selection
			const cart_item: Cart = {
				id: 0,
				user_id: this.rest.user?.id || 0,
				qty: 1,
				ecommerce_item_id: ecommerce_item_id,
				size: 'unico'
			};

			this.rest_cart.create(cart_item)
				.then(() => {
					this.rest.showSuccess('Producto agregado al carrito');
				})
				.catch((error: any) => {
					this.rest.showError(error);
				});
			return;
		}

		// Open modal for size selection
		this.pendingEcommerceItemId = ecommerce_item_id;
		this.showSizeModal = true;
	}

	closeSizeModal(): void {
		this.showSizeModal = false;
		this.pendingEcommerceItemId = null;
	}

	confirmAddToCart(): void {
		// Get sizes with quantities > 0
		const selectedSizes = Object.entries(this.sizeQuantities)
			.filter(([size, qty]) => qty > 0)
			.map(([size, qty]) => ({ size, quantity: qty }));

		if (selectedSizes.length === 0) {
			this.rest.showError('Por favor seleccione al menos una talla');
			return;
		}

		if (!this.pendingEcommerceItemId) {
			return;
		}

		// Create cart items for each selected size
		const promises = selectedSizes.map(({ size, quantity }) => {
			const cart_item: Cart = {
				id: 0,
				user_id: this.rest.user?.id || 0,
				qty: quantity,
				ecommerce_item_id: this.pendingEcommerceItemId!,
				size: size
			};
			return this.rest_cart.create(cart_item);
		});

		Promise.all(promises)
			.then(() => {
				this.rest.showSuccess(`Producto agregado al carrito: ${selectedSizes.length} talla(s)`);

				// Reset quantities after adding to cart
				this.availableSizes.forEach(size => {
					this.sizeQuantities[size] = 0;
				});

				// Close modal
				this.closeSizeModal();
			})
			.catch((error: any) => {
				this.rest.showError(error);
			});
	}

	addToCart(ecommerce_item_id: number): void {
		this.openSizeModal(ecommerce_item_id);
	}
}
