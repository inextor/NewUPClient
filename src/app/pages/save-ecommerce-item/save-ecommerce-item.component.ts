import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { GetEmpty } from '../../models/GetEmpty';

@Component({
  selector: 'app-save-ecommerce-item',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './save-ecommerce-item.component.html',
  styleUrl: './save-ecommerce-item.component.css'
})
export class SaveEcommerceItemComponent extends BaseComponent implements OnInit {

  rest_ecommerce_item: Rest<Ecommerce_Item, Ecommerce_Item> = new Rest<Ecommerce_Item, Ecommerce_Item>(this.rest, 'ecommerce_item.php');
  ecommerce_item: Ecommerce_Item = GetEmpty.ecommerce_item();

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.rest_ecommerce_item.get(id)
          .then((item) => {
            this.ecommerce_item = item;
          })
          .catch((err) => {
            this.rest.showError(err);
          });
      }
    });
  }

  save() {
    let promise = this.ecommerce_item.id ? this.rest_ecommerce_item.update(this.ecommerce_item) : this.rest_ecommerce_item.create(this.ecommerce_item);
    promise.then(() => {
      this.rest.showSuccess('Artículo guardado correctamente');
      this.router.navigate(['/list-ecommerce-item']);
    })
    .catch((err) => {
      this.rest.showError(err);
    });
  }
}
