import {BaseParamType} from '../params/_Base';
import {CoreWalker} from '../../core/Walker';

export class MissingExpressionReference {
	constructor(private param: BaseParamType, public readonly path: string) {}

	absolute_path() {
		return CoreWalker.make_absolute_path(this.param.node, this.path);
	}
	matches_path(path: string): boolean {
		return this.absolute_path() == path;
	}

	update_from_method_dependency_name_change() {
		this.param.expression_controller?.update_from_method_dependency_name_change();
	}

	resolve_missing_dependencies() {
		const input = this.param.raw_input_serialized;
		this.param.set(this.param.default_value);
		this.param.set(input);
	}
}
