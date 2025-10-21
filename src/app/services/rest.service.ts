import { Injectable, inject } from '@angular/core';
import { ErrorMessage } from '../classes/ErrorMessage';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RestEndPoint } from '../classes/RestEndPoint';
import { GetEmpty } from '../models/GetEmpty';
import { Ecommerce } from '../models/RestModels/Ecommerce';
import { Role_Info } from '../models/InfoModels/Role_Info';

@Injectable({
	providedIn: 'root'
})
export class RestService implements RestEndPoint{


	error_behavior_subject = new BehaviorSubject<ErrorMessage>(new ErrorMessage('',''));
	public error_observable = this.error_behavior_subject.asObservable();

	public base_url = this.getApiUrl();
	public externalAppBaseUrl = this.getAppBaseUrl();
	public user: any = null;
	public session: any = null;
	public permission: any = null;
	public store: any = null;
	private _bearer: string = '';
	public ecommerce:Ecommerce = GetEmpty.ecommerce();
	public is_menu_open: boolean = false;
	public pos_rest:RestEndPoint = { base_url: 'https://uniformesprofesionales.integranet.xyz/api', bearer: '' };
	public roles_info: Role_Info[] = [];
	public admin_roles: Role_Info[] = [];

	public set bearer(bearer:string)
	{
		this._bearer = bearer;
	}

	public get bearer():string
	{
		if( !this._bearer )
		{
			let session = localStorage.getItem('session');
			if( session )
			{
				let session_obj = JSON.parse(session);
				if( 'bearer_uuid' in session_obj )
					this._bearer = session_obj.bearer_uuid;
				else if( 'bearer' in session_obj )
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

	toggleMenu():boolean {
		return this.is_menu_open = !this.is_menu_open;
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

	/**
	 * Determines the API URL based on the current hostname
	 */
	private getApiUrl(): string
	{
		if (typeof window !== 'undefined')
		{
			const hostname = window.location.hostname;

			if (hostname === 'localhost' || hostname === '127.0.0.1')
			{
				return 'http://localhost/NewUpServer';
			}
			else
			{
				return 'https://uniformesprofesionales.mx/semprainfraestructura/api';
			}
		}
		// Fallback for SSR or build time
		return 'http://localhost/NewUpServer';
	}

	/**
	 * Determines the app base URL for external links
	 */
	private getAppBaseUrl(): string
	{
		if (typeof window !== 'undefined')
		{
			const hostname = window.location.hostname;

			if (hostname === 'localhost' || hostname === '127.0.0.1')
			{
				return 'http://localhost:4200';
			}
			else
			{
				return 'https://uniformesprofesionales.mx/semprainfraestructura';
			}
		}
		// Fallback for SSR or build time
		return 'http://localhost:4200';
	}

	getBaseUrl(): string
	{
		return this.base_url;
	}

	is_logged_in:boolean = false;

	logout() {
		localStorage.removeItem('session');
		localStorage.removeItem('user');
		localStorage.removeItem('roles_info');
		this.user = null;
		this.session = null;
		this.roles_info = [];
		this.admin_roles = [];
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
			const rolesInfoStr = localStorage.getItem('roles_info');

			if (userStr) this.user = JSON.parse(userStr);
			if (sessionStr) this.session = JSON.parse(sessionStr);
			if (permissionStr) this.permission = JSON.parse(permissionStr);
			if (storeStr) this.store = JSON.parse(storeStr);

			if (rolesInfoStr) {
				this.roles_info = JSON.parse(rolesInfoStr);
				// Filter admin roles (where is_admin is true/1)
				this.admin_roles = this.roles_info.filter(ri => ri.role_user.is_admin == 1 || ri.role_user.is_admin === true);
			}

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

	/**
	 * Check if current user is a system ADMIN
	 */
	isSystemAdmin(): boolean {
		return this.user && this.user.type === 'ADMIN';
	}

	/**
	 * Check if current user is admin of any role
	 */
	isRoleAdmin(): boolean {
		return this.admin_roles.length > 0;
	}

	/**
	 * Check if current user is admin of a specific role
	 */
	isAdminOfRole(role_id: number): boolean {
		return this.admin_roles.some(ri => ri.role.id === role_id);
	}

	/**
	 * Check if current user can add users
	 * System admins can always add users
	 * Role admins can only add users if they have at least one admin role
	 */
	canAddUsers(): boolean {
		return this.isSystemAdmin() || this.isRoleAdmin();
	}

	/**
	 * Get all role IDs that the current user is admin of
	 */
	getAdminRoleIds(): number[] {
		return this.admin_roles.map(ri => ri.role.id);
	}

	/**
	 * Check if current user can manage a specific user
	 * System admins can manage everyone
	 * Role admins can only manage users in their admin roles
	 */
	canManageUser(user_roles: number[]): boolean {
		if (this.isSystemAdmin()) {
			return true;
		}

		if (this.isRoleAdmin()) {
			const adminRoleIds = this.getAdminRoleIds();
			// Check if any of the user's roles match admin roles
			return user_roles.some(role_id => adminRoleIds.includes(role_id));
		}

		return false;
	}
}
