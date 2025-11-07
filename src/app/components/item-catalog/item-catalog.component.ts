import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImagePipe } from '../../pipes/image.pipe';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';

interface CEcommerceItemInfo {
	ecommerce_item: Ecommerce_Item;
	item_info: any;
}

@Component({
	selector: 'app-item-catalog',
	standalone: true,
	imports: [CommonModule, ImagePipe, FormsModule],
	templateUrl: './item-catalog.component.html',
	styleUrl: './item-catalog.component.css'
})
export class ItemCatalogComponent implements OnInit, OnChanges {
	@Input() items: CEcommerceItemInfo[] = [];
	@Input() title: string = 'Artículos';

	filteredItems: CEcommerceItemInfo[] = [];
	categories: string[] = [];
	selectedCategory: string = '';

	constructor(private router: Router) {}

	ngOnInit(): void {
		this.extractCategories();
		this.filterItems();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['items']) {
			this.extractCategories();
			this.filterItems();
		}
	}

	extractCategories(): void {
		const categorySet = new Set<string>();
		this.items.forEach(ceii => {
			const categoryName = ceii.item_info?.category_info?.category?.name;
			if (categoryName) {
				categorySet.add(categoryName);
			}
		});
		this.categories = Array.from(categorySet).sort();
	}

	filterItems(): void {
		if (!this.selectedCategory) {
			this.filteredItems = this.items;
		} else {
			this.filteredItems = this.items.filter(ceii =>
				ceii.item_info?.category_info?.category?.name === this.selectedCategory
			);
		}
	}

	navigateToProduct(ecommerce_item_id: number): void {
		this.router.navigate(['/product-detail', ecommerce_item_id]);
	}
}
