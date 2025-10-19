import { Role_Ecommerce_Item } from '../RestModels/Role_Ecommerce_Item';

export function role_ecommerce_item(): Role_Ecommerce_Item {
	return {
		id: 0,
		ecommerce_item_id: 0,
		role_id: 0,
		created: new Date(),
		updated: new Date(),
		quota: 0,
		period_type: 'daily',
		period_quantity: 0,
	};
}
