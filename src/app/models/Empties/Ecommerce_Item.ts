import { Ecommerce_Item } from '../RestModels/Ecommerce_Item';

export function ecommerce_item(): Ecommerce_Item {
	return {
		id: 0,
		code: null,
		item_id: 0,
		ecommerce_id: 0,
		name: '',
		created: new Date(),
		updated: new Date(),
		category_name: null,
		price: 0,
		category_id: null,
		sizes: '',
	};
}
