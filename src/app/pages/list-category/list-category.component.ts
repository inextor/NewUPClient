import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/RestModels/Category';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';

@Component({
  selector: 'app-list-category',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './list-category.component.html',
  styleUrl: './list-category.component.css'
})
export class ListCategoryComponent extends BaseComponent implements OnInit {

  rest_category: Rest<Category, Category> = new Rest<Category, Category>(this.rest, 'category.php');
  category_list: Category[] = [];
  searchTerm: string = '';

  search_object: SearchObject<Category> = new SearchObject<Category>(['name', 'description']);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.search_object.assignNavigationParams(params);

      this.rest_category.search(this.search_object)
        .then((response: RestResponse<Category>) => {
          this.category_list = response.data;
        })
        .catch((error: any) => {
          this.rest.showError(error);
        });
    });
  }

  onSearch(): void {
    this.router.navigate(['/list-category'], { queryParams: { 'name~~': this.searchTerm, 'page': 0 } });
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '-';

    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return String(date);
    }
  }
}
