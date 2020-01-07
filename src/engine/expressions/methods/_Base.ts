import {CoreWalker} from 'src/core/Walker';
import {DecomposedPath} from 'src/core/DecomposedPath';
// import {NodeSimple} from 'src/core/graph/NodeSimple'
import {BaseParam} from 'src/engine/params/_Base';
import {BaseNode} from 'src/engine/nodes/_Base';
import {MethodDependency} from '../MethodDependency';
import lodash_isString from 'lodash/isString';
import lodash_isNumber from 'lodash/isNumber';
import {NodeScene} from 'src/core/graph/NodeScene';
import {BaseContainer} from 'src/engine/containers/_Base';

type NodeOrParam = BaseNode | BaseParam;

export abstract class BaseMethod {
	public node: BaseNode;

	constructor(public param: BaseParam) {
		// this._init_update_dependencies_mode();
		this.node = this.param.node();
	}

	static required_arguments(): any[] {
		console.warn('Expression.Method._Base.required_arguments virtual method call. Please override');
		return [];
	}
	static optional_arguments(): any[] {
		return [];
	}
	static min_allowed_arguments_count() {
		return this.required_arguments().length;
	}
	static max_allowed_arguments_count() {
		return this.min_allowed_arguments_count() + this.optional_arguments().length;
	}
	static allowed_arguments_count(count: number) {
		return count >= this.min_allowed_arguments_count() && count <= this.max_allowed_arguments_count();
	}

	// process_arguments_and_dependencies(args){
	// 	return new Promise((resolve, reject)=> {
	// 		return this.process_arguments(args, value=> {
	// 			if (this.update_dependencies_mode()) {
	// 				this.update_dependencies();
	// 			}

	// 			return resolve(value);
	// 		});
	// 	});
	// }

	process_arguments(args: any): Promise<any> {
		throw 'Expression.Method._Base.process_arguments virtual method call. Please override';
	}

	async get_referenced_node_container(index_or_path: number | string): Promise<BaseContainer> {
		const referenced_node = this.get_referenced_node(index_or_path);

		if (referenced_node) {
			const container = await referenced_node.request_container();
			if (container) {
				const core_group = container.core_content();
				if (core_group) {
					return container;
				}
			}
			throw `referenced node invalid: ${referenced_node.full_path()}`;
		} else {
			throw `invalid input (${index_or_path})`;
		}
	}

	get_referenced_param(path: string, decomposed_path?: DecomposedPath): BaseParam {
		const referenced_param = CoreWalker.find_param(this.node, path, decomposed_path);

		// if (referenced_param != null) {

		// 	if (this.update_dependencies_mode()) {

		// 		//param_connect_result = this.param().add_graph_input(referenced_param)
		// 		const expression_node_connect_result = this.jsep_node()._graph_node.add_graph_input(referenced_param);
		// 		//if !(param_connect_result && expression_node_connect_result)
		// 		if (!expression_node_connect_result) {
		// 			throw "cannot create infinite graph";
		// 		}
		// 	}

		// } else {
		// 	throw `no param found for argument ${path}`;
		// }

		return referenced_param;
	}

	find_referenced_graph_node(index_or_path: number | string, decomposed_path?: DecomposedPath): NodeScene {
		const is_index = lodash_isNumber(index_or_path);
		// let node
		if (is_index) {
			const index = index_or_path as number;
			return this.node.input_graph_node(index) as NodeScene;
		} else {
			const path = index_or_path as string;
			return this.get_referenced_node(path, decomposed_path);
		}
	}
	get_referenced_node(index_or_path: string | number, decomposed_path?: DecomposedPath): BaseNode {
		// if ((index_or_path != null) && (index_or_path.is_a != null) && index_or_path.is_a(BaseNode)) {
		// 	index_or_path = index_or_path.full_path();
		// }
		if (lodash_isString(index_or_path)) {
			const path = index_or_path;
			return CoreWalker.find_node(this.node, path, decomposed_path);
		} else {
			const index = index_or_path;
			return this.node.input(index);
		}

		// if (referenced_node != null) {

		// 	if (this.update_dependencies_mode()) {
		// 		//node_connect_result = this.param().add_graph_input(referenced_node)

		// 		const expression_node_connect_result = this.jsep_node()._graph_node.add_graph_input(referenced_node);
		// 		//if !(node_connect_result && expression_node_connect_result)
		// 		if (!expression_node_connect_result) {
		// 			throw "cannot create infinite graph";
		// 		}
		// 	}

		// } else {
		// 	throw `no node found for argument ${index_or_path}`;
		// }

		// return referenced_node;
	}

	abstract find_dependency(args: any): MethodDependency;

	create_dependency_from_index_or_path(index_or_path: number | string): MethodDependency {
		// console.log("is_index", index_or_path)
		const decomposed_path = new DecomposedPath();
		const node = this.find_referenced_graph_node(index_or_path, decomposed_path);
		return this.create_dependency(node, index_or_path, decomposed_path);
	}
	create_dependency(
		node: NodeScene,
		index_or_path: number | string,
		decomposed_path?: DecomposedPath
	): MethodDependency {
		return MethodDependency.create(
			this.param,
			index_or_path,
			(<unknown>node) as NodeOrParam, // TODO: typescript
			decomposed_path.named_nodes
		);
	}

	//
	//
	// UPDATE DEPENDENCIES
	//
	//
	// _init_update_dependencies_mode() {
	// 	return this.set_update_dependencies_mode(false);
	// }
	// set_update_dependencies_mode(mode){
	// 	return this._update_dependencies_mode = mode;
	// }
	// update_dependencies_mode() {
	// 	return this._update_dependencies_mode;
	// }
	// update_dependencies() {}
}
//
