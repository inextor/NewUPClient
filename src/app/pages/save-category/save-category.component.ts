import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { Category } from '../../models/RestModels/Category';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GetEmpty } from '../../models/GetEmpty';

@Component({
	selector: 'app-save-category',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './save-category.component.html',
	styleUrls: ['./save-category.component.css']
})
export class SaveCategoryComponent extends BaseComponent implements OnInit {

	rest_category: Rest<Category, Category> = new Rest<Category, Category>(this.rest, 'category.php');
	category: Category = GetEmpty.category();

	ngOnInit(): void
	{
		this.route.paramMap.subscribe(params => {
			const id = params.get('id');
			let p = id ? this.rest_category.get(id) : Promise.resolve(GetEmpty.category());
			p.then((category) => {
				this.category = category;
				// Set ecommerce_id for new categories
				if(!this.category.id) {
					this.category.ecommerce_id = this.rest.ecommerce.id;
				}
			})
			.catch((err) =>
			{
				this.rest.showError(err);
			});
		});
	}

	save() {
		let promise = this.category.id ? this.rest_category.update(this.category) : this.rest_category.create(this.category);
		promise.then(() => {
			this.rest.showSuccess('Categoría guardada correctamente');
			this.router.navigate(['/list-category']);
		})
		.catch((err) => {
			this.rest.showError(err);
		});
	}
}
