import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagePipe } from '../../pipes/image.pipe';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';

interface CEcommerceItemInfo {
	ecommerce_item: Ecommerce_Item;
	item_info: any;
}

@Component({
	selector: 'app-item-catalog',
	standalone: true,
	imports: [CommonModule, ImagePipe],
	templateUrl: './item-catalog.component.html',
	styleUrl: './item-catalog.component.css'
})
export class ItemCatalogComponent {
	@Input() items: CEcommerceItemInfo[] = [];
	@Input() title: string = 'Artículos';
}
