import { User_Role } from '../RestModels/User_Role';

export function user_role(): User_Role {
	return {
		id: 0, 
		user_id: 0, 
		role_id: 0, 
		is_admin: 0, 
		created: new Date(), 
		updated: new Date(), 
	};
}
