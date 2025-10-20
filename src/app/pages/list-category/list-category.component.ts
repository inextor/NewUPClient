import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/RestModels/Category';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { RouterModule } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';

@Component({
  selector: 'app-list-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-category.component.html',
  styleUrl: './list-category.component.css'
})
export class ListCategoryComponent extends BaseComponent implements OnInit {

  rest_category: Rest<Category, Category> = new Rest<Category, Category>(this.rest, 'category.php');
  category_list: Category[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  async loadCategories(): Promise<void> {
    this.isLoading = true;
    try {
      const response: RestResponse<Category> = await this.rest_category.search({
        ecommerce_id: this.rest.ecommerce.id,
        limit: 99999
      });
      this.category_list = response.data;
    } catch (error) {
      this.rest.showError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteCategory(category: Category): Promise<void> {
    if (!confirm(`¿Está seguro de eliminar la categoría "${category.name}"?`)) {
      return;
    }

    try {
      await this.rest_category.delete(category.id);
      this.rest.showSuccess('Categoría eliminada correctamente');
      this.loadCategories();
    } catch (error) {
      this.rest.showError(error);
    }
  }
}
