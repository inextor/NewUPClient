import { DataRelation } from './DataRelation';
import { SearchObject } from './SearchObject';
import { RestResponse } from "./RestResponse";
import { RestService } from '../services/rest.service';
import { RestEndPoint } from './RestEndPoint';
import { ParamMap } from '@angular/router';

export class Rest<T,U>
{
	bearer:string = '';

	constructor(private rest:RestEndPoint,private path:string)
	{
	}

	get(id:number|string):Promise<any>
	{
		let bearer = this.rest.bearer;

		const url = `${this.rest.base_url}/${this.path}?id=${id}`;
		let options = { method: 'GET', headers: { 'Authorization': `Bearer ${this.bearer}` } };
		return fetch(url, options )
			.then(this.getJsonLambda())
	}

	search(p: URLSearchParams | Object):Promise<RestResponse<U>>
	{
		const params = p instanceof URLSearchParams ? p : this.getUrlParams(p);
		const url = new URL(`${this.rest.base_url}/${this.path}`);
		url.search = params.toString(); // Handles '?' and encoding

		let options = { method: 'GET', headers: { 'Authorization': `Bearer ${this.bearer}` } };

		return fetch(url, options )
			.then(this.getJsonLambda())
	}

	getUrlParams(obj:any):URLSearchParams
	{
		const params = new URLSearchParams();

		if (obj && typeof obj === 'object' && 'keys' in obj && Array.isArray(obj.keys)) {
			(obj as ParamMap).keys.forEach((key: string) => {
				const value = (obj as ParamMap).get(key);
				if (value !== null) {
					params.set(key, value);
				}
			});
		} else {
			if (obj === null || obj === undefined) {
				obj = {};
			}
			for (const key in obj)
			{
				if (obj.hasOwnProperty(key))
				{
					params.set(key, String(obj[key]));
				}
			}
		}
		return params;
	}

	getJsonLambda()
	{
		return (response:any) =>
		{
			if( !response.ok )
			{
				return response.json().then((data:any) =>
				{
					if(typeof data == 'object' && 'error' in data )
					{
						throw data.error;
					}
					else if( typeof data == 'string' )
					{
						throw new Error(data);
					}

					throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
				})
			}

			return response.json();
		};
	}

	async searchWithRelations(searchObject: Partial<SearchObject<T>>, relations: DataRelation<any>[]): Promise<RestResponse<any>>
	{
		const mainResponse = await this.search(searchObject);
		const relatedDataPromises: Record<string, Promise<RestResponse<any>>> = {};

		for (const relation of relations) {
			const name = relation.name || relation.rest.path;
			const sourceData = relation.source_obj
				? mainResponse.data.map((i: any) => i[relation.source_obj as string])
				: mainResponse.data;

			const csv = this.getRelationCsv(sourceData, relation);

			if (csv.length === 0) {
				relatedDataPromises[name] = Promise.resolve({ total: 0, data: [] });
				continue;
			}

			const csvObj: any = {
				csv: { [relation.target_field]: csv },
				limit: 999999
			};

			if (relation.relations?.length) {
				relatedDataPromises[name] = relation.rest.searchWithRelations(csvObj, relation.relations);
			} else {
				relatedDataPromises[name] = relation.rest.search(csvObj);
			}
		}

		const relatedDataResponses = await this.promiseAllObject(relatedDataPromises);

		const resultData = mainResponse.data.map((mainItem: any) => {
			const newItem: any = { [this.path]: mainItem };

			for (const relation of relations) {
				const name = relation.name || relation.rest.path;
				const relatedData = relatedDataResponses[name].data;

				if (relation.is_multiple) {
					// Handle one-to-many relationships if needed
				} else {
					const find = relatedData.find((relatedItem: any) => {
						const sourceValue = mainItem[relation.source_field];
						if (relation.target_obj) {
							return relatedItem[relation.target_obj][relation.target_field] == sourceValue;
						}
						return relatedItem[relation.target_field] == sourceValue;
					}) || null;
					newItem[name] = find;
				}
			}
			return newItem;
		});

		return {
			total: mainResponse.total,
			data: resultData
		} as RestResponse<U>;
	}

	private getRelationCsv(data: any[], relation: DataRelation<any>): (string | number)[] {
		return data.reduce((acc: (string | number)[], current: any) => {
			const value = current[relation.source_field];
			if (value != null && !acc.includes(value)) {
				acc.push(value);
			}
			return acc;
		}, []);
	}

	private async promiseAllObject<T>(obj: Record<string, Promise<any>>): Promise<Record<string, any>> {
		const keys = Object.keys(obj);
		const promises = Object.values(obj);
		const results = await Promise.all(promises);
		return keys.reduce((acc, key, i) => {
			acc[key] = results[i];
			return acc;
		}, {} as Record<string, T>);
	}

	public create(z:Partial<U>):Promise<U>
	{
		const url = `${this.rest.base_url}/${this.path}`;

		let headers = {
			'Authorization': `Bearer ${this.bearer}`,
			'Content-Type': 'application/json'
		};

		let method = 'POST';
		let body = JSON.stringify(z);
		let options = { method, headers , body };

		return fetch(url, options ).then(this.getJsonLambda())
	}

	public update(z:Partial<U>):Promise<U>
	{
		const url = `${this.rest.base_url}/${this.path}`;

		let headers = {
			'Authorization': `Bearer ${this.bearer}`,
			'Content-Type': 'application/json'
		};

		let method = 'PUT';
		let body = JSON.stringify(z);
		let options = { method, headers , body };

		return fetch(url, options ).then(this.getJsonLambda())
	}

	delete(id:any):Promise<any>
	{
		const url = `${this.rest.base_url}/${this.path}/${id}`;
		let headers = {
			'Authorization': `Bearer ${this.bearer}`,
			'Content-Type': 'application/json'
		};

		let method = 'DELETE';
		let body = JSON.stringify({id:''+id});
		let options = { method, headers , body };

		return fetch(url, options ).then(this.getJsonLambda())
	}

	postOne(data:any):Promise<any>
	{
		const url = `${this.rest.base_url}/${this.path}`;
		let options = { method: 'POST', headers: { 'Authorization': `Bearer ${this.bearer}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
		return fetch(url, options )
			.then(this.getJsonLambda())
	}
}
