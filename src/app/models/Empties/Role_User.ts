import { Role_User } from '../RestModels/Role_User';

export function role_user(): Role_User {
	return {
		id: 0, 
		user_id: 0, 
		role_id: 0, 
		is_admin: 0, 
		created: new Date(), 
		updated: new Date(), 
	};
}
