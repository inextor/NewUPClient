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

export type CsvArray<T> = {
	[K in keyof T]?: any[];
}
export interface CsvNumberArray
{
	[key: string]: number[];
}

export interface SearchObject<T>
{
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
	search_extra:Record<string,string|number|null|Date>
}
