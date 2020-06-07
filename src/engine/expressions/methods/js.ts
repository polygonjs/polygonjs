import {BaseMethod} from './_Base';

export class JsExpression extends BaseMethod {
	private _function: Function | undefined;

	static required_arguments() {
		return [['string', 'javascript expression']];
	}

	async process_arguments(args: any[]): Promise<any> {
		let val: any = 0;
		if (args.length == 1) {
			const arg = args[0];
			this._function = this._function || this._create_function(arg);
			if (this._function) {
				try {
					val = this._function();
				} catch (e) {}
			}
		}
		return val;
	}

	private _create_function(content: string) {
		return new Function(`return ${content}`);
	}
}
