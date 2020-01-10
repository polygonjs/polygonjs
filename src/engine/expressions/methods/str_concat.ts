import {BaseMethod} from './_Base';
// import {MethodDependency} from '../MethodDependency'

export class StrConcat extends BaseMethod {
	// str_concat(1,2) => '12'
	// str_concat(1,"a") => '1a'
	// str_concat("a",12, "b", " ", 17) => 'a12b 17'
	static required_arguments(): any[] {
		return [
			// ['string', 'string to get range from'],
			// ['integer', 'range start'],
			// ['integer', 'range size'],
		];
	}

	// find_dependency(index_or_path: number | string): null {
	// 	return null
	// 	// return this.create_dependency_from_index_or_path(index_or_path)
	// }

	async process_arguments(args: any[]): Promise<string> {
		let value = '';

		for (let arg of args) {
			if (arg == null) {
				arg = '';
			}
			value += `${arg}`;
		}

		return value;
	}
}
