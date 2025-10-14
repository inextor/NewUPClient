import { Ecommerce } from '../RestModels/Ecommerce';

export function ecommerce(): Ecommerce {
	return {
		id: 0, 
		name: '', 
		pos_id: 0, 
		pos_session_id: null, 
		pos_main_user_id: 0, 
		color: '', 
		banner_image_id: null, 
		font_color: '', 
		logo_image_id: null, 
	};
}
