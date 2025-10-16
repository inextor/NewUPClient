import { Component, Injector } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RestEndPoint } from '../../classes/RestEndPoint';

@Component({
  selector: 'app-base',
  imports: [],
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent {

	public rest: RestService;
	public is_loading: boolean = false;
	public router: Router;
    public route: ActivatedRoute;

	constructor(public injector: Injector)
	{
		this.rest = this.injector.get(RestService);
		this.router = this.injector.get(Router);
		this.route = injector.get(ActivatedRoute);
	}
}
