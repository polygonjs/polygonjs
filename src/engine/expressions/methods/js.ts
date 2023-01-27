/**
 * The js expression allows to execute a javascript expression. This is very useful when you have specific requirements that are not addressed by the expressions available here.
 *
 * @remarks
 * It takes 1 arguments.
 *
 * `js(js_expression)`
 *
 * - `js_expression` is a a string
 *
 * ## Usage
 *
 * - `js('Date.now()')` - returns the current time.
 *
 */
import {BaseMethod} from './_Base';
export class JsExpression extends BaseMethod {
	private _function: Function | undefined;

	static override requiredArguments() {
		return [['string', 'javascript expression']];
	}

	override async processArguments(args: any[]): Promise<any> {
		let val: any = 0;
		if (args.length == 1) {
			const arg = args[0];
			this._function = this._function || this._create_function(arg);
			if (this._function) {
				try {
					val = this._function(this.param.scene(), this.param.node, this.param);
				} catch (e) {
					console.warn(`expression error`);
					console.warn(e);
				}
			}
		}
		return val;
	}

	private _create_function(content: string) {
		return new Function('scene', 'node', 'param', `return ${content}`);
	}
}
