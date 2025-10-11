import { Session } from '../RestModels/Session';

export function session(): Session {
	return {
		id: '', 
		user_id: null, 
		status: 'ACTIVE', 
		created: new Date(), 
		updated: null, 
	};
}
