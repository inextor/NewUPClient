export class ErrorMessage
{
	count:number;
	message:string;
	type:string;
	msg_button:string;
	color:string;
	auto_hide:boolean = true;
	constructor(message:string,type:string, auto_hide:boolean=true)
	{
		this.message	= message;
		this.type	= type;
		this.count = 0;
		this.auto_hide = auto_hide;

		if( type == 'alert-success')
		{
			this.msg_button = '✔️';
			this.color = 'green';
		}
		else
		{
			this.msg_button = '✖';
			this.color = 'red';
		}
	}
}

