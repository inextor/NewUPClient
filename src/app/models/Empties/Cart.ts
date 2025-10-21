import { Cart } from '../RestModels/Cart';

export function cart(): Cart {
	return {
		id: 0, 
		user_id: 0, 
		qty: 0, 
		ecommerce_item: 0, 
		variation: null, 
	};
}
