import { Rest } from "./Rest";

export interface DataRelation<T>
{
	rest:Rest<T,any>;
	source_field:string;
	target_field:keyof T;
	is_multiple?:boolean;
	name?:string;
	relations?:DataRelation<any>[];
	source_obj?:string;
	target_obj?:string;
}

