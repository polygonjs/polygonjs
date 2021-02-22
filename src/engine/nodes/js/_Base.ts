import {TypedNode} from '../_Base';
import {BaseJsFunctionAssembler} from './code/assemblers/_Base';
import {AssemblerControllerNode} from './code/Controller';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {LinesController} from './code/utils/LinesController';
import {ParamInitValueSerialized} from '../../params/types/ParamInitValueSerialized';
import {JsParamConfig} from './code/utils/ParamConfig';
import {ParamType} from '../../poly/ParamType';
// import {BaseGlConnectionPoint} from '../utils/io/connections/Gl';
// import {IOController} from '../utils/io/IOController';

export class TypedJsNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.JS, K> {
	static nodeContext(): NodeContext {
		return NodeContext.JS;
	}

	protected _param_configs_controller: ParamConfigsController<JsParamConfig<ParamType>> | undefined;
	protected _assembler: BaseJsFunctionAssembler | undefined;

	initializeBaseNode() {
		this.uiData.setLayoutHorizontal();
		this.io.connection_points.initializeNode();
	}
	cook() {
		console.warn('js nodes should never cook');
	}

	protected _set_function_node_to_recompile() {
		this.function_node?.assembler_controller.set_compilation_required_and_dirty(this);
	}
	get function_node(): AssemblerControllerNode | undefined {
		const parent = this.parent();
		if (parent) {
			if (parent.type() == this.type()) {
				return (parent as BaseJsNodeType)?.function_node;
			} else {
				return parent as AssemblerControllerNode;
			}
		}
	}

	//
	//
	// VARIABLES
	//
	//
	js_var_name(name: string) {
		return `v_POLY_${this.name()}_${name}`;
	}

	variable_for_input(name: string): string {
		const input_index = this.io.inputs.get_input_index(name);
		const connection = this.io.connections.inputConnection(input_index);
		if (connection) {
			const input_node = (<unknown>connection.node_src) as BaseJsNodeType;
			const output_connection_point =
				input_node.io.outputs.named_output_connection_points[connection.output_index];
			if (output_connection_point) {
				const output_name = output_connection_point.name();
				return input_node.js_var_name(output_name);
			} else {
				console.warn(`no output called '${name}' for gl node ${input_node.fullPath()}`);
				throw 'variable_for_input ERROR';
			}
		} else {
			return 'to debug...'; //ThreeToGl.any(this.params.get(name)?.value);
		}
	}

	//
	//
	// ADDED LINES
	//
	//
	set_lines(lines_controller: LinesController) {}

	reset_code() {
		this._param_configs_controller?.reset();
		// this.reset_lines();
	}

	//
	//
	// PARAM CONFIGS
	//
	//
	public set_param_configs() {}
	param_configs() {
		return this._param_configs_controller?.list;
	}

	//
	//
	// INPUT
	//
	//
	js_input_default_value(name: string): ParamInitValueSerialized {
		return null;
	}
}

export type BaseJsNodeType = TypedJsNode<NodeParamsConfig>;
export class BaseJsNodeClass extends TypedJsNode<NodeParamsConfig> {}

class ParamlessParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ParamlessParamsConfig();
export class ParamlessTypedJsNode extends TypedJsNode<ParamlessParamsConfig> {
	params_config = ParamsConfig;
}
