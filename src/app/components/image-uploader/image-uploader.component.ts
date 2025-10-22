import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestService } from '../../services/rest.service';
import { Image } from '../../models/RestModels/Image';

@Component({
	selector: 'app-image-uploader',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './image-uploader.component.html',
	styleUrls: ['./image-uploader.component.css']
})
export class ImageUploaderComponent implements OnInit {

	constructor(public rest: RestService) { }

	@Input() width: number = 150;
	@Input() height: number = 150;
	@Input() image?: number | null = null;
	@Output() imageChange = new EventEmitter<number | null>();
	@Input() displayUploadedImageName = true;
	@Input() displayUploadedImage = true;
	@Input() container_classes: any = { 'avatar': true, 'avatar-4by3': true };
	@Input() image_classes: any = { 'avatar-img': true, 'rounded': true };
	@Input() max_height: number = 0;
	@Input() max_width: number = 0;
	@Input() can_be_deleted = false;

	ngOnInit(): void {
	}

	uploadImage(evt: any) {
		if (evt.target.files.length) {
			console.log('File selected:', evt.target.files[0]);
			this.rest.uploadImage(evt.target.files[0], false, this.max_width, this.max_height)
				.then((imageData: Image) => {
					if (this.displayUploadedImage) {
						this.image = imageData.id || null;
					}
					this.imageChange.emit(imageData.id || null);
					this.rest.showSuccess('Imagen subida correctamente');
				})
				.catch((error: any) => {
					this.rest.showError(error);
				});
		}
	}

	onDelete(evt: Event) {
		evt.preventDefault();
		evt.stopPropagation();
		this.imageChange.emit(null);
		this.image = null;
	}
}
