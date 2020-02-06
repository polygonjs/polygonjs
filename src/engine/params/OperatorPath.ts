// import {TypedParamVisitor} from './_Base';
import {Single} from './_Single';
import {CoreWalker} from 'src/core/Walker';

// import {AsCodeOperatorPath} from './concerns/visitors/OperatorPath';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap, ParamValuesTypeMap} from '../nodes/utils/params/ParamsController';

// interface OperatorPathParamVisitor extends TypedParamVisitor {
// 	visit_operator_path_param: (param: OperatorPathParam) => any;
// }

export class OperatorPathParam extends Single<ParamType.OPERATOR_PATH> {
	// private _raw_input: string = '';
	// _path: string;
	private _found_node: BaseNodeType | null = null;

	static type() {
		return ParamType.OPERATOR_PATH;
	}
	get default_value_serialized() {
		return this.default_value;
	}
	get value_serialized() {
		return this.value;
	}
	static are_values_equal(
		val1: ParamValuesTypeMap[ParamType.OPERATOR_PATH],
		val2: ParamValuesTypeMap[ParamType.OPERATOR_PATH]
	) {
		return val1 == val2;
	}
	// accepts_visitor(visitor: OperatorPathParamVisitor) {
	// 	return visitor.visit_operator_path_param(this);
	// }
	set(raw_input: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH]): void {
		this._value = raw_input;
	}
	// convert_value(v) {
	// 	return v
	// }
	// is_value_expression(v) {
	// 	return false
	// }
	// set_path(path: string) {
	// 	this._path = path;
	// }
	// path() {
	// 	return this._path;
	// }
	// set(raw_input: string) {
	// 	this._raw_input = raw_input;
	// }

	protected async process_computation() {
		const path = this._value; //await this.eval_raw(); //path=> {
		let node = null;

		if (path != null && path !== '') {
			node = CoreWalker.find_node(this.node, path);
		}

		if (this._found_node !== node) {
			const dependent_on_found_node = this.options.dependent_on_found_node();

			if (this._found_node) {
				if (dependent_on_found_node) {
					this.remove_graph_input(this._found_node);
				} else {
					// this._found_node.remove_param_referree(this) // TODO: typescript
				}
			}
			this._found_node = node;
			if (node) {
				const expected_context = this.options.node_selection_context;
				const node_context = node.parent?.children_controller?.context;
				if (expected_context == node_context || expected_context == null) {
					if (dependent_on_found_node) {
						this.add_graph_input(node);
					} else {
						// this._found_node.add_param_referree(this) // TODO: typescript
					}
				} else {
					this.states.error.set(
						`node context is ${expected_context} but the params expects a ${node_context}`
					);
				}
			}
		}

		// return path;
		//});
	}

	// TODO: remove
	// find_node(callback){
	// 	this.eval_raw(path=> {
	// 		let node = null;

	// 		if ((path != null) && (path !== '')) {
	// 			node = CoreWalker.find_node(this.node(), path);
	// 		}

	// 		callback(node);
	// 	});
	// }

	found_node() {
		return this._found_node;
	}
}
