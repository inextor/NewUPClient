import { User } from '../RestModels/User';

export function user(): User {
	return {
		id: 0, 
		type: 'USER', 
		ecommerce_id: 0, 
		name: '', 
		password: null, 
		created: 0, 
		updated: 0, 
		code: null, 
	};
}
