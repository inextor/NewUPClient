import { Component, Injector } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RestEndPoint } from '../../classes/RestEndPoint';
import { combineLatest, mergeMap, Observable, of, startWith } from 'rxjs';

export interface ParamsAndQueriesMap
{
	param:ParamMap;
	query:ParamMap;
}

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

	// Pagination properties
	public current_page: number = 0;
	public path: string = '';
	public total_pages: number = 0;
	public total_items: number = 0;
	public pages: number[] = [];
	public page_size: number = 20;

	constructor(public injector: Injector)
	{
		this.rest = this.injector.get(RestService);
		this.router = this.injector.get(Router);
		this.route = injector.get(ActivatedRoute);
	}

	setPages(current_page: number, totalItems: number): void
	{
		this.current_page = current_page;
		this.pages = [];
		this.total_items = totalItems;

		if ((this.total_items % this.page_size) > 0)
		{
			this.total_pages = Math.floor(this.total_items / this.page_size) + 1;
		}
		else
		{
			this.total_pages = this.total_items / this.page_size;
		}

		for (let i = this.current_page - 5; i < this.current_page + 5; i++)
		{
			if (i >= 0 && i < this.total_pages)
			{
				this.pages.push(i);
			}
		}

		this.is_loading = false;
	}

	private _getQueryParamObservable():Observable<ParamMap[]>
	{
		let p:ParamMap = {
			has:(_prop)=>false,
			keys:[],
			get:(_value:string)=>{ return null},
			getAll:()=>{ return []},
		};

		return combineLatest
		([
			this.route.queryParamMap.pipe(startWith(p)),
			this.route.paramMap
		])
	}


	getParamsAndQueriesObservable():Observable<ParamsAndQueriesMap>
	{
		return this._getQueryParamObservable().pipe
		(
			mergeMap
			(
				(response)=>of({query: response[0], param: response[1]})
			)
		);
	}
}
