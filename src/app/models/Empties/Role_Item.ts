import { Role_Item } from '../RestModels/Role_Item';

export function role_item(): Role_Item {
	return {
		id: 0, 
		item_id: 0, 
		role_id: 0, 
		created: new Date(), 
		updated: new Date(), 
	};
}
