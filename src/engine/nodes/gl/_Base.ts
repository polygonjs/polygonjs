import {TypedNode} from '../_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {AssemblerControllerNode} from './code/Controller';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamInitValueSerialized} from '../../params/types/ParamInitValueSerialized';
import {GlParamConfig} from './code/utils/ParamConfig';
import {ParamType} from '../../poly/ParamType';

const REGEX_PATH_SANITIZE = /\/+/g;

export class TypedGlNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.GL, K> {
	static nodeContext(): NodeContext {
		return NodeContext.GL;
	}

	protected _param_configs_controller: ParamConfigsController<GlParamConfig<ParamType>> | undefined;
	protected _assembler: BaseGlShaderAssembler | undefined;

	initialize_base_node() {
		this.uiData.setLayoutHorizontal();
		this.io.connections.init_inputs();

		this.io.connection_points.spare_params.initialize_node();
	}

	cook() {
		console.warn('gl nodes should never cook');
	}

	protected _set_mat_to_recompile() {
		this.material_node?.assemblerController?.set_compilation_required_and_dirty(this);
	}
	get material_node(): AssemblerControllerNode | undefined {
		const parent = this.parent();
		if (parent) {
			if (parent.nodeContext() == NodeContext.GL) {
				return (parent as BaseGlNodeType)?.material_node;
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
	gl_var_name(name: string) {
		const path_sanitized = this.fullPath(this.material_node).replace(REGEX_PATH_SANITIZE, '_');
		return `v_POLY_${path_sanitized}_${name}`;
	}

	variable_for_input(name: string): string {
		const input_index = this.io.inputs.get_input_index(name);
		const connection = this.io.connections.input_connection(input_index);
		if (connection) {
			const input_node = (<unknown>connection.node_src) as BaseGlNodeType;
			const output_connection_point =
				input_node.io.outputs.named_output_connection_points[connection.output_index];
			if (output_connection_point) {
				const output_name = output_connection_point.name();
				return input_node.gl_var_name(output_name);
			} else {
				console.warn(`no output called '${name}' for gl node ${input_node.fullPath()}`);
				throw 'variable_for_input ERROR';
			}
		} else {
			if (this.params.has(name)) {
				return ThreeToGl.any(this.params.get(name)?.value);
			} else {
				const connection_point = this.io.inputs.named_input_connection_points[input_index];
				return ThreeToGl.any(connection_point.init_value);
			}
		}
	}

	//
	//
	// ADDED LINES
	//
	//
	set_lines(shaders_collection_controller: ShadersCollectionController) {}

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
	param_default_value(name: string): ParamInitValueSerialized {
		return null;
	}
}

export type BaseGlNodeType = TypedGlNode<NodeParamsConfig>;
export class BaseGlNodeClass extends TypedGlNode<NodeParamsConfig> {}

class ParamlessParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ParamlessParamsConfig();
export class ParamlessTypedGlNode extends TypedGlNode<ParamlessParamsConfig> {
	params_config = ParamsConfig;
}
