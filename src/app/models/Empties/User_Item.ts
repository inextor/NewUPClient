import { User_Item } from '../RestModels/User_Item';

export function user_item(): User_Item {
	return {
		id: 0, 
		user_id: 0, 
		order_id: null, 
		delivered_timestamp: null, 
		created: new Date(), 
		updated: new Date(), 
	};
}
