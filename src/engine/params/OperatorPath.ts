import {Single} from './_Single';
import {CoreWalker} from 'src/core/Walker';

import {AsCodeOperatorPath} from './concerns/visitors/OperatorPath';
import {BaseNode} from 'src/engine/nodes/_Base';

// class BaseModules extends AsCodeOperatorPath(Single) {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, AsCodeOperatorPath.instance_methods);

export class OperatorPathParam extends AsCodeOperatorPath(Single)<string> {
	_path: string;
	_found_node: BaseNode;

	constructor() {
		super();
		// this._node = null
	}
	static type() {
		return ParamType.OPERATOR_PATH;
	}

	// convert_value(v) {
	// 	return v
	// }
	// is_value_expression(v) {
	// 	return false
	// }
	set_path(path: string) {
		this._path = path;
	}
	path() {
		return this._path;
	}

	async eval() {
		const path = await this.eval_raw(); //path=> {
		let node = null;

		if (path != null && path !== '') {
			node = CoreWalker.find_node(this.node, path);
		}

		if (this._found_node !== node) {
			const dependent_on_found_node = this.options.dependent_on_found_node();

			if (this._found_node != null) {
				if (dependent_on_found_node) {
					this.remove_graph_input(this._found_node);
				} else {
					// this._found_node.remove_param_referree(this) // TODO: typescript
				}
			}
			this._found_node = node;
			if (node != null) {
				if (dependent_on_found_node) {
					this.add_graph_input(node);
				} else {
					// this._found_node.add_param_referree(this) // TODO: typescript
				}
			}
		}

		return path;
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
