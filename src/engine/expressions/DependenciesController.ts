import {BaseParamType} from '../params/_Base';
// import {ParsedTree} from './Traverser/ParsedTree'
import {FunctionGenerator} from './traversers/FunctionGenerator';
// import {NodeSimple} from '../../core/graph/NodeSimple'
// import {MissingReferencesController} from './MissingReferencesController'
// import {NamesListener} from './NamesListener'
import {MethodDependency} from './MethodDependency';
import jsep from 'jsep';

export interface JsepsByString {
	[propName: string]: jsep.Expression[];
}

export class DependenciesController {
	error_message: string | undefined;
	// private references_controller: MissingReferencesController
	private _cyclicGraphDetected: boolean = false;
	// private jsep_nodes_by_missing_paths: JsepsByString = {}
	private methodDependencies: MethodDependency[] = [];

	// private names_listeners: NamesListener[] = []

	constructor(public param: BaseParamType) {
		// this.references_controller = this.param.scene().missing_expression_references_controller
	}

	protected set_error(message: string) {
		this.error_message = this.error_message || message;
	}

	reset() {
		this.param.graphDisconnectPredecessors();

		this.methodDependencies.forEach((methodDependency) => {
			methodDependency.reset();
		});
		this.methodDependencies = [];

		// this.jsep_nodes_by_missing_paths = {}
		// const ref_ids = Object.keys(this.missing_expression_references_by_id)
		// ref_ids.forEach(ref_id=>{
		// 	const ref = this.missing_expression_references_by_id[ref_id]
		// 	this.references_controller.unregister(ref)
		// })
		// this.missing_expression_references_by_id = {}

		// this.names_listeners.forEach(names_listener=>{names_listener.reset()})
	}

	update(functionGenerator: FunctionGenerator) {
		// const immutable_dependencies = function_generator.immutable_dependencies
		// const jsep_dependencies = function_generator.jsep_dependencies
		// const jsep_nodes_by_missing_paths = function_generator.jsep_nodes_by_missing_paths

		// if(jsep_dependencies.length > 0){
		// 	console.log("connect_param_to_dependencies", this.param.path())
		// }

		this._cyclicGraphDetected = false;

		this._connectImmutableDependencies(functionGenerator);
		this.methodDependencies = functionGenerator.methodDependencies;
		this._handleMethodDependencies();
		// this.connect_missing_paths(function_generator)

		this._listenForNameChanges();
	}

	private _connectImmutableDependencies(function_generator: FunctionGenerator) {
		function_generator.immutableDependencies.forEach((dependency) => {
			if (this._cyclicGraphDetected == false) {
				if (this.param.addGraphInput(dependency) == false) {
					this._cyclicGraphDetected = true;
					this.set_error('cannot create expression, infinite graph detected');
					this.reset();
					return;
				}
			}
		});
	}
	private _handleMethodDependencies() {
		this.methodDependencies.forEach((methodDependency) => {
			if (this._cyclicGraphDetected == false) {
				this._handleMethodDependency(methodDependency);
			}
		});
	}

	private _handleMethodDependency(method_dependency: MethodDependency) {
		const node_simple = method_dependency.resolved_graph_node;

		if (node_simple) {
			// this should update the jsep_node, and run the expression to string parser
			// when a name in the referenced nodes is updated
			// const names_listener = new NamesListener(this.param, node_simple, jsep_node)
			// TODO: test that it is no longer active if expression is updated

			if (!this.param.addGraphInput(node_simple)) {
				this._cyclicGraphDetected = true;
				this.set_error('cannot create expression, infinite graph detected');
				this.reset();
				return;
			}
		} // else {
		// const jsep_node = method_dependency.jsep_node
		//}
	}

	private _listenForNameChanges() {
		this.methodDependencies.forEach((methodDependency) => {
			methodDependency.listen_for_name_changes();
		});
	}

	// private connect_missing_paths(function_generator: FunctionGenerator){

	// 	const jsep_nodes_by_missing_paths = function_generator.jsep_nodes_by_missing_paths
	// 	const missing_paths = Object.keys(jsep_nodes_by_missing_paths)

	// 	missing_paths.forEach((missing_path)=>{
	// 		const fullPath = CoreWalker.make_absolute(this.param.node(), missing_path)
	// 		const jsep_nodes = jsep_nodes_by_missing_paths[missing_path]
	// 		jsep_nodes.forEach(jsep_node=>{
	// 			const missing_expression_reference = this.references_controller.register(this.param, jsep_node, fullPath)

	// 			this.missing_expression_references_by_id[missing_expression_reference.id] = missing_expression_reference
	// 		})
	// 	})

	// }
}
