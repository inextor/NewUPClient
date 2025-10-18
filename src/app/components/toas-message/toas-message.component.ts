import { Component, OnInit, OnDestroy } from '@angular/core';
import { ErrorMessage } from '../../classes/ErrorMessage';
import { RestService } from '../../services/rest.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toas-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toas-message.component.html',
  styleUrl: './toas-message.component.css'
})
export class ToasMessageComponent implements OnInit, OnDestroy {

	constructor(public rest: RestService) { }

	ngOnInit(): void {
		this.subs = this.rest.error_observable.subscribe((error) => {
			if (error.message)
				this.addError(error);
		});
	}

	ngOnDestroy(): void {
		this.subs.unsubscribe();
	}

	subs !: Subscription;
	errors: ErrorMessage[] = [];

	addError(error: ErrorMessage) {
		this.errors.push(error);
		if (error.auto_hide)
			setTimeout(() => this.removeError(error), 5000);
	}

	removeError(error: ErrorMessage) {
		let index = this.errors.indexOf(error);
		if (index > -1)
			this.errors.splice(index, 1);
	}

}
