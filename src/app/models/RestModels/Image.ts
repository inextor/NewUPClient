export interface Image {
	content_type?: string | null;
	created?: Date | string;
	filename?: string | null;
	height?: number | null;
	id?: number | null;
	is_private?: number | null;
	original_filename?: string | null;
	size?: number | null;
	uploader_user_id?: number | null;
	width?: number | null;
}
