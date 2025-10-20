import { Category } from '../RestModels/Category';

export function category(): Category {
	return {
		id: 0,
		ecommerce_id: 0,
		name: '',
		description: null,
		created: new Date(),
		updated: new Date(),
	};
}
