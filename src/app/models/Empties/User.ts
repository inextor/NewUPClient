import { User } from '../RestModels/User';

export function user(): User {
	return {
		id: 0, 
		type: 'USER', 
		ecommerce_id: 0, 
		name: '', 
		username: null, 
		password: null, 
		created: new Date(), 
		updated: new Date(), 
		code: null, 
	};
}
