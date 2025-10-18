import { Injectable, inject } from '@angular/core';
import { ErrorMessage } from '../classes/ErrorMessage';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RestEndPoint } from '../classes/RestEndPoint';
import { GetEmpty } from '../models/GetEmpty';
import { Ecommerce } from '../models/RestModels/Ecommerce';

@Injectable({
	providedIn: 'root'
})
export class RestService implements RestEndPoint{


	error_behavior_subject = new BehaviorSubject<ErrorMessage>(new ErrorMessage('',''));
	public error_observable = this.error_behavior_subject.asObservable();

	public base_url = 'http://localhost/NewUpServer'//environment.base_url;
	public user: any = null;
	public session: any = null;
	public permission: any = null;
	public store: any = null;
	private _bearer: string = '';
	public ecommerce:Ecommerce = GetEmpty.ecommerce();
	public is_menu_open: boolean = false;
	public pos_rest:RestEndPoint = { base_url: 'https://uniformesprofesionales.integranet.xyz/api', bearer: '' };

	public set bearer(bearer:string)
	{
		this._bearer = bearer;
	}

	public get bearer():string
	{
		if( this._bearer == '' )
		{
			let session = localStorage.getItem('session');
			if( session )
			{
				let session_obj = JSON.parse(session);
				if( 'bearer' in session_obj )
					this._bearer = session_obj.bearer;
			}
		}
		return this._bearer;
	}


	constructor(private route: ActivatedRoute, private router: Router)
	{
		route.params.subscribe((_params:any) =>
		{
			document.body.style.backgroundColor = '#ffffff';
		});

		route.queryParams.subscribe((_params:any) =>
		{
			document.body.style.backgroundColor = '#ffffff';
		});

		this.loadEcommerceData();
	}

	toggleMenu() {
		this.is_menu_open = !this.is_menu_open;
	}

	loadEcommerceData(): void
	{
		if (typeof localStorage !== 'undefined')
		{
			const ecommerceStr = localStorage.getItem('ecommerce');
			if (ecommerceStr)
			{
				this.ecommerce = JSON.parse(ecommerceStr);
			}
			else
			{
				// Simulate fetching from backend
				const hardcodedEcommerce: Ecommerce = {
					id: 1,
					name: 'My Ecommerce',
					pos_id: 1,
					pos_session_id: '1',
					pos_main_user_id: 1,
					color: '#333333',
					banner_image_id: null,
					font_color: '#FFFFFF',
					logo_image_id: null
				};
				this.ecommerce = hardcodedEcommerce;
				localStorage.setItem('ecommerce', JSON.stringify(hardcodedEcommerce));
			}
		}
	}

	getBaseUrl(): string
	{
		return this.base_url;
	}

	is_logged_in:boolean = false;

	logout() {
		localStorage.removeItem('session');
		localStorage.removeItem('user');
		this.user = null;
		this.session = null;
		this.is_logged_in = false;
		this.router.navigate(['/login']);
	}

	loadAuthDataFromLocalStorage(): void
	{
		if (typeof localStorage !== 'undefined')
		{
			const userStr = localStorage.getItem('user');
			const sessionStr = localStorage.getItem('session');
			const permissionStr = localStorage.getItem('permission');
			const storeStr = localStorage.getItem('store');

			if (userStr) this.user = JSON.parse(userStr);
			if (sessionStr) this.session = JSON.parse(sessionStr);
			if (permissionStr) this.permission = JSON.parse(permissionStr);
			if (storeStr) this.store = JSON.parse(storeStr);

			this.is_logged_in = this.session !== null;
		}
	}

	getErrorString(error:any):string
	{
		if( error instanceof Error )
		{
			return error.message;
		}
		if (error == null || error === undefined)
			return 'Error desconocido';

		if (typeof error === "string")
			return error;

		if( 'error' in error )
		{
			if( typeof(error.error) == 'string' )
			{
				return error.error;
			}

			if( error.error && 'error' in error.error && error.error.error )
			{
				return error.error.error;
			}
		}
		return 'Error desconocido';
	}

	showSuccess(message: string)
	{
		this.showErrorMessage(new ErrorMessage(message, 'alert-success', true));
	}

	showError(error: any, auto_hide:boolean = true)
	{
		console.log('Error to display is', error);

		if( error instanceof ErrorMessage )
		{
			this.showErrorMessage(error);
			return;
		}
		let str_error = this.getErrorString(error);

		this.showErrorMessage(new ErrorMessage(str_error, 'alert-danger', auto_hide));
	}


	showErrorMessage(error: ErrorMessage)
	{
		this.error_behavior_subject.next(error);
	}

	externalPost(url: string, data: any): Promise<Blob> {
		return fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.blob();
		});
	}
}
