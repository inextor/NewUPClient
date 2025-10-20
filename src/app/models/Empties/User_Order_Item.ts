import { User_Order_Item } from '../RestModels/User_Order_Item';

export function user_order_item(): User_Order_Item {
	return {
		id: 0,
		order_item_id: 0,
		user_id: 0,
		qty: 0,
		notes: null,
		delivery_timestamp: null,
		created: new Date(),
		updated: new Date(),
	};
}
