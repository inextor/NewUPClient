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

	constructor(public injector: Injector)
	{
		this.rest = this.injector.get(RestService);
		this.router = this.injector.get(Router);
		this.route = injector.get(ActivatedRoute);
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
