import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';

// Simplified interfaces for product detail - can be expanded later
interface ProductImage {
	id: number;
	url: string;
}

interface ProductAttachment {
	attachment_id: number;
	title: string;
	description: string;
	url: string;
}

interface ProductItem {
	id: number;
	name: string;
	description: string | null;
	image_id: number | null;
}

interface ProductCategory {
	id: number;
	name: string;
}

interface ProductPrice {
	price: number;
}

interface ProductInfo {
	item: ProductItem;
	category: ProductCategory | null;
	price: ProductPrice | null;
	image_url: string | null;
	images: ProductImage[];
}

@Component({
	selector: 'app-product-detail',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './product-detail.component.html',
	styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent extends BaseComponent implements OnInit {
	item_id: number | null = null;
	product: ProductInfo | null = null;
	mainImage: string | undefined;
	attachments: ProductAttachment[] = [];

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			const id = params.get('item_id');
			if (id) {
				this.item_id = +id;
				this.fetchProductDetails();
			}
		});
	}

	fetchProductDetails(): void {
		// TODO: Implement product fetch logic
		// This will be implemented when we discuss functionality
		console.log('Fetching product details for item_id:', this.item_id);

		// Placeholder for testing layout
		if (this.item_id) {
			// Example structure - replace with actual API call
			this.product = {
				item: {
					id: this.item_id,
					name: 'Producto de Ejemplo',
					description: 'Descripción del producto aquí...',
					image_id: null
				},
				category: {
					id: 1,
					name: 'Categoría de Ejemplo'
				},
				price: {
					price: 99.99
				},
				image_url: null,
				images: []
			};
		}
	}

	fetchAttachments(): void {
		// TODO: Implement attachments fetch logic
		console.log('Fetching attachments for item_id:', this.item_id);
	}

	fetchProductImages(): void {
		// TODO: Implement images fetch logic
		console.log('Fetching images for item_id:', this.item_id);
	}

	setMainImage(image: string): void {
		this.mainImage = image;
	}

	addToCart(item_id: number): void {
		// TODO: Implement add to cart logic
		console.log('Adding item to cart:', item_id);
		this.rest.showSuccess('Producto agregado al carrito');
	}
}
