import {BaseParamType} from '../params/_Base';
import {CoreWalker} from '../../core/Walker';

export class MissingExpressionReference {
	constructor(private param: BaseParamType, public readonly path: string) {}

	absolute_path() {
		return CoreWalker.makeAbsolutePath(this.param.node, this.path);
	}
	matches_path(path: string): boolean {
		return this.absolute_path() == path;
	}

	update_from_method_dependency_name_change() {
		this.param.expressionController?.update_from_method_dependency_name_change();
	}

	resolve_missing_dependencies() {
		const input = this.param.rawInputSerialized();
		this.param.set(this.param.defaultValue());
		this.param.set(input);
	}
}
