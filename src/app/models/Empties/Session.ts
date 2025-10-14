import { Session } from '../RestModels/Session';

export function session(): Session {
	return {
		id: 0, 
		bearer_uuid: '', 
		user_id: null, 
		status: 'ACTIVE', 
		created: new Date(), 
		updated: null, 
	};
}
