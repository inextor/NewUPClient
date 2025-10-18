/*
* From perl operators except lk = LIKE
* Several comparison operators impose string contexts upon their operands.
* These are string equality (eq),
* string inequality (ne),
* greater than (gt),
* less than (lt),
* greater than or equal to (ge),
* less than or equal to (le),
*/

import { ParamMap } from "@angular/router";

export type CsvArray<T> = {
	[K in keyof T]?: any[];
}
export interface CsvNumberArray
{
	[key: string]: number[];
}

export class SearchObject<T>
{
	fields:string[];
	page:number;
	limit:number;
	eq:Partial<T>; //Equals to
	gt:Partial<T>; //Great than
	lt:Partial<T>; //Less than
	ge:Partial<T>; //Great or equal than
	different:Partial<T>; //Different than
	le:Partial<T>; //less or equal than
	lk:Partial<T>; //like
	nn:string[]; //Not nulls
	is_null:string[];
	sort_order:string[]; //Sort order like 'updated_ASC','name_DESC' //Etc
	csv:CsvArray<T>; //Posiblemente String tambien
	//range:CsvNumberArray; //Posiblemente
	start:Partial<T>;
	ends:Partial<T>;


	constructor(fields:string[])
	{
		this.fields = fields.map((i:string)=>''+i);
		this.page = 0;
		this.limit = 20;
		this.eq = {} as Partial<T>;
		this.gt = {} as Partial<T>;
		this.lt = {} as Partial<T>;
		this.ge = {} as Partial<T>;
		this.different = {} as Partial<T>;
		this.le = {} as Partial<T>;
		this.lk = {} as Partial<T>;
		this.nn = [] as string[];
		this.is_null = [];
		this.sort_order = [];
		this.csv = {};
		this.start = {} as Partial<T>;
		this.ends = {} as Partial<T>;
	}

	/**
	 * Returns URLSearchParams for Angular router navigation (internal routing)
	 * Format: eq.field=value, lk.field=value, csv.field=1,2,3
	 */
	getNavigationParams():URLSearchParams
	{
		const params = new URLSearchParams();

		// Add page and limit
		params.set('page', this.page.toString());
		params.set('limit', this.limit.toString());

		// Process comparison operators (eq, gt, lt, etc.)
		const keys = ['eq', 'gt', 'lt', 'ge', 'le', 'different', 'lk', 'start', 'ends'];

		keys.forEach((key: string) => {
			const obj = (this as any)[key] as Partial<T>;
			if (obj && typeof obj === 'object') {
				Object.keys(obj).forEach((field) => {
					const value = (obj as any)[field];
					if (value !== null && value !== undefined) {
						params.set(`${key}.${field}`, String(value));
					}
				});
			}
		});

		// Process CSV arrays
		if (this.csv && typeof this.csv === 'object') {
			Object.keys(this.csv).forEach((field) => {
				const values = (this.csv as any)[field];
				if (Array.isArray(values) && values.length > 0) {
					params.set(`csv.${field}`, values.join(','));
				}
			});
		}

		// Process not null fields
		if (this.nn && this.nn.length > 0) {
			this.nn.forEach((field) => {
				params.set(`nn.${field}`, '1');
			});
		}

		// Process is_null fields
		if (this.is_null && this.is_null.length > 0) {
			this.is_null.forEach((field) => {
				params.set(`is_null.${field}`, '1');
			});
		}

		// Process sort_order
		if (this.sort_order && this.sort_order.length > 0) {
			params.set('sort_order', this.sort_order.join(','));
		}

		return params;
	}

	/**
	 * Returns URLSearchParams for backend API requests
	 * Format: field=value, field~~=value, field>=value, field,=1,2,3
	 */
	getBackendParams():URLSearchParams
	{
		const params = new URLSearchParams();

		// Process eq (equals) - uses plain field name
		for(let field in this.eq)
		{
			const value = (this.eq as any)[field];
			if( (value !== null && value !== undefined && String(value) !== 'null') || typeof value === 'number' )
			{
				params.set(field, String(value));
			}
		}

		// Process gt (greater than) - uses field>
		for(let field in this.gt)
		{
			const value = (this.gt as any)[field];
			if( value !== null && value !== undefined || typeof value === 'number' )
			{
				params.set(field + '>', String(value));
			}
		}

		// Process lt (less than) - uses field<
		for(let field in this.lt)
		{
			const value = (this.lt as any)[field];
			if( value !== null && value !== undefined || typeof value === 'number' )
			{
				params.set(field + '<', String(value));
			}
		}

		// Process ge (greater or equal) - uses field>~
		for(let field in this.ge)
		{
			const value = (this.ge as any)[field];
			if( value !== null && value !== undefined || typeof value === 'number' )
			{
				params.set(field + '>~', String(value));
			}
		}

		// Process le (less or equal) - uses field<~
		for(let field in this.le)
		{
			const value = (this.le as any)[field];
			if( value !== null && value !== undefined || typeof value === 'number' )
			{
				params.set(field + '<~', String(value));
			}
		}

		// Process csv (comma-separated values) - uses field,
		for(let field in this.csv)
		{
			const values = (this.csv as any)[field];
			if( Array.isArray(values) && values.length > 0 )
			{
				params.set(field + ',', values.join(','));
			}
		}

		// Process different (not equal) - uses field!
		for(let field in this.different)
		{
			const value = (this.different as any)[field];
			if( value !== null && value !== undefined || typeof value === 'number' )
			{
				params.set(field + '!', String(value));
			}
		}

		// Process lk (like) - uses field~~
		for(let field in this.lk)
		{
			const value = (this.lk as any)[field];
			if( value !== null && value !== undefined )
			{
				params.set(field + '~~', String(value));
			}
		}

		// Process start (starts with) - uses field^
		for(let field in this.start)
		{
			const value = (this.start as any)[field];
			if( value !== null && value !== undefined )
			{
				params.set(field + '^', String(value));
			}
		}

		// Process ends (ends with) - uses field$
		for(let field in this.ends)
		{
			const value = (this.ends as any)[field];
			if( value !== null && value !== undefined )
			{
				params.set(field + '$', String(value));
			}
		}

		// Process nn (not null) - uses _NN with comma-separated fields
		if( this.nn && this.nn.length > 0 )
		{
			params.set('_NN', this.nn.join(','));
		}

		// Process is_null - uses _NULL with comma-separated fields
		if( this.is_null && this.is_null.length > 0 )
		{
			params.set('_NULL', this.is_null.join(','));
		}

		// Process page
		if( this.page )
		{
			params.set('page', String(this.page));
		}

		// Process limit
		if( this.limit )
		{
			params.set('limit', String(this.limit));
		}

		// Process sort_order - uses _sort
		if( this.sort_order && this.sort_order.length > 0 )
		{
			params.set('_sort', this.sort_order.join(','));
		}

		return params;
	}

	/**
	 * Assigns values from Angular router ParamMap to this SearchObject
	 * Expects navigation format: eq.field=value, lk.field=value, etc.
	 */
	assignNavigationParams(params:ParamMap):void
	{
		const keys = ['eq','le','lt','ge','gt','csv','lk','nn','start','ends','different'];

		// Process each comparison operator
		keys.forEach((k:string)=>
		{
			// Reset the property
			if(k === 'nn' || k === 'is_null') {
				(this as any)[k] = [];
			} else {
				(this as any)[k] = {};
			}

			// Process each field
			this.fields.forEach((f:string)=>
			{
				let field = k+"."+f;

				if( params.has( field) )
				{
					let value_to_assign = params.get( field );

					if( value_to_assign === 'null' )
					{
						(this as any)[k][ f ] = null;
					}
					else if( value_to_assign === null  || value_to_assign === undefined )
					{
						(this as any)[k][ f ] = null;
					}
					else
					{
						// Handle CSV arrays
						if( k == 'csv' )
						{
							let array = (''+value_to_assign).split(',');
							(this as any).csv[f] = array.length == 1 && array[0] == '' ? [] : array;
						}
						else
						{
							// Try to parse as integer for _id fields
							let z = parseInt(value_to_assign);

							if( /.*_id$/.test( f ) && !Number.isNaN(z) )
							{
								(this as any)[ k ][ f ] = z;
							}
							else
							{
								(this as any)[ k ][ f ] = value_to_assign;
							}
						}
					}
				}
			});
		});

		// Process sort_order
		let s_order = params.get('sort_order');
		this.sort_order = s_order ? s_order.split(',') : [];

		if( this.sort_order.length == 0 )
		{
			this.sort_order.push('id_DESC');
		}

		// Process page
		let page_str:string | null = params.get('page');
		let page = page_str ? parseInt( page_str ) : 0;
		this.page = isNaN( page ) ? 0 : page;

		// Process limit
		let limit_str:string | null = params.get('limit');
		let limit = limit_str ? parseInt( limit_str ) : 20;
		this.limit = isNaN( limit ) ? 20 : limit;
	}

	/* to return the url params

	getParamsFromSearch(searchObj:Partial<SearchObject<U>>):HttpParams
	{
		let params = new HttpParams();

		if( searchObj.search_extra )
		{
			for( let i in searchObj.search_extra)
			{
				if( searchObj.search_extra[i] === null || searchObj.search_extra[i] === '' || searchObj.search_extra[i] === undefined )
					continue;
				let tmp_val = searchObj.search_extra[i];
				if( tmp_val instanceof Date )
				{

					params = params.set(i,tmp_val.toISOString().substring(0,19).replace('T',' '));
				}
				else
				{
					params = params.set(i,''+tmp_val );
				}
			}
		}

		for(let i in searchObj.eq )
		{
			if( searchObj.eq[i] === null || searchObj.eq[i] === undefined )
				continue;

			if( (searchObj.eq[i] && ''+searchObj.eq[i] !== 'null' ) || typeof searchObj.eq[i] == 'number' )
			{
				params = params.set(i,''+this.getString( searchObj.eq[i], i ) );
			}
		}

		for(let i in searchObj.gt )
			if( searchObj.gt[i] || typeof searchObj.gt[i] == 'number' )
				params = params.set(i+'>',''+this.getString( searchObj.gt[i], i ));

		for(let i in searchObj.lt )
			if( searchObj.lt[i] || typeof searchObj.lt[i] == 'number' )
				params = params.set(i+'<',''+this.getString( searchObj.lt[i], i ) );

		for(let i in searchObj.ge )
			if( searchObj.ge[i] || typeof searchObj.ge[i] == 'number' )
				params = params.set(i+'>~',''+this.getString( searchObj.ge[i], i ) );

		for(let i in searchObj.le )
			if( searchObj.le[i] || typeof searchObj.le[i] == 'number' )
				params = params.set(i+'<~',''+this.getString( searchObj.le[i], i ) );

		for(let i in searchObj.csv )
			if( Array.isArray( searchObj.csv[i] ) && searchObj.csv[i].length > 0 )
				params = params.set(i+',',''+searchObj.csv[i].join(','));

		for(let i in searchObj.different )
			if( searchObj.different[i] || typeof searchObj.different[i] == 'number' )
				params = params.set(i+'!',''+this.getString( searchObj.different[i], i ) );

		for(let i in searchObj.lk )
			if( searchObj.lk[i] )
				params = params.set(i+'~~',''+searchObj.lk[i] );

		for(let i in searchObj.start )
		{
			if( searchObj.start[i] )
				params = params.set(i+'^',''+searchObj.start[i] );
		}

		for(let i in searchObj.ends )
		{
			params = params.set(i+'$',''+searchObj.ends[i] );
		}

		if( searchObj?.nn?.length )
		{
			params = params.set('_NN',searchObj.nn.join(','));
		}

		if( searchObj?.is_null?.length )
		{
			params = params.set('_NULL',searchObj.is_null.join(','));
		}

		if( searchObj.page )
		{
			params = params.set( 'page', ''+searchObj.page );
		}

		if( searchObj.limit )
		{
			params = params.set( 'limit', ''+searchObj.limit );
		}

		if( searchObj.sort_order && searchObj.sort_order )
		{
			params = params.set('_sort',searchObj.sort_order.join(','));
		}
		return params;
	}
	*/
}
