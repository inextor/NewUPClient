import { Injectable } from '@angular/core';
import { ErrorMessage } from '../classes/ErrorMessage';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class RestService {


	error_behavior_subject = new BehaviorSubject<ErrorMessage>(new ErrorMessage('',''));
	public error_observable = this.error_behavior_subject.asObservable();

	private base_url = environment.base_url;
	public user: any = null;
	public session: any = null;
	public permission: any = null;
	public store: any = null;

	constructor(private route: ActivatedRoute)
	{
		this.is_logged_in = localStorage.getItem('session') !== null;

		route.params.subscribe((_params:any) =>
		{
			document.body.style.backgroundColor = '#ffffff';
		});

		route.queryParams.subscribe((_params:any) =>
		{
			document.body.style.backgroundColor = '#ffffff';
		});
	}

	getBaseUrl(): string
	{
		return this.base_url;
	}

	is_logged_in:boolean = false;

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
