import { Order_Item } from '../RestModels/Order_Item';

export function order_item(): Order_Item {
	return {
		id: 0,
		order_id: 0,
		ecommerce_item_id: 0,
		quantity: 0,
		unit_price: null,
		notes: null,
		created: new Date(),
		updated: new Date(),
	};
}
