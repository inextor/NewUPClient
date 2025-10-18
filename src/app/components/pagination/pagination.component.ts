import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-pagination',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './pagination.component.html',
	styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnInit {

	@Input() path: string = '';
	@Input() total_pages: number = 1;
	@Input() current_page: number = 0;
	@Input() pages: number[] = [];
	@Input() search_object: any;
	@Output() selectedPage = new EventEmitter<number>();

	constructor(public router: Router, public route: ActivatedRoute) {
	}

	ngOnInit() {
	}

	gotoPage(page: number) {
		if (this.path == null) {
			this.selectedPage.emit(page);
		}
		else {
			let array: string[] = [this.path];

			if (this.path.lastIndexOf('/') !== 0) {
				let foo = this.path.split('/');
				foo[0] = '/' + foo[0];

				array.splice(0, 1, ...foo);
			}

			let params = { page: page }
			this.router.navigate(array, { queryParams: params, queryParamsHandling: "merge" });
		}
	}
}
