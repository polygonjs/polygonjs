import {BaseMethod} from './_Base';
// import {MethodDependency} from '../MethodDependency'

export class StrIndex extends BaseMethod {
	// str_chars_count('bla') => 3
	static required_arguments() {
		return [
			['string', 'string to get index from'],
			['string', 'char to find index of'],
		];
	}

	// find_dependency(index_or_path: number | string): null {
	// 	return null
	// 	// return this.create_dependency_from_index_or_path(index_or_path)
	// }

	async process_arguments(args: any[]): Promise<number> {
		let value = -1;
		if (args.length == 2) {
			const string = args[0];
			const sub_string = args[1];
			value = string.indexOf(sub_string);
		}
		return value;
	}
}
