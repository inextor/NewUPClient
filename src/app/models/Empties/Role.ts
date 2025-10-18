import { Role } from '../RestModels/Role';

export function role(): Role {
	return {
		id: 0,
		ecommerce_id: 0,
		name: '',
		created: new Date(),
		updated: new Date(),
	};
}
