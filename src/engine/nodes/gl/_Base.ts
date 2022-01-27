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
import {IntegerParam} from '../../params/Integer';
import {FloatParam} from '../../params/Float';
import {Vector2Param} from '../../params/Vector2';
import {Vector3Param} from '../../params/Vector3';
import {Vector4Param} from '../../params/Vector4';
import {ColorParam} from '../../params/Color';
import {BooleanParam} from '../../params/Boolean';

const REGEX_PATH_SANITIZE = /\/+/g;

/**
 * BaseGlNode is the base class for all nodes that process GLSL code. This inherits from [BaseNode](/docs/api/BaseNode).
 *
 */
export class TypedGlNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.GL, K> {
	static override context(): NodeContext {
		return NodeContext.GL;
	}

	protected _param_configs_controller: ParamConfigsController<GlParamConfig<ParamType>> | undefined;
	protected _assembler: BaseGlShaderAssembler | undefined;

	override initializeBaseNode() {
		this.uiData.setLayoutHorizontal();
		this.io.connections.initInputs();

		this.io.connection_points.spare_params.initializeNode();
	}

	override cook() {
		console.warn('gl nodes should never cook');
	}

	protected _setMatToRecompile() {
		this.materialNode()?.assemblerController?.set_compilation_required_and_dirty(this);
	}
	materialNode(): AssemblerControllerNode | undefined {
		const parent = this.parent();
		if (parent) {
			if (parent.context() == NodeContext.GL) {
				return (parent as BaseGlNodeType)?.materialNode();
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
	glVarName(name: string) {
		const path_sanitized = this.path(this.materialNode()).replace(REGEX_PATH_SANITIZE, '_');
		return `v_POLY_${path_sanitized}_${name}`;
	}

	variableForInputParam(
		param: IntegerParam | FloatParam | Vector2Param | Vector3Param | Vector4Param | ColorParam | BooleanParam
	) {
		return this.variableForInput(param.name());
	}

	variableForInput(name: string): string {
		const input_index = this.io.inputs.getInputIndex(name);
		const connection = this.io.connections.inputConnection(input_index);
		if (connection) {
			const input_node = (<unknown>connection.node_src) as BaseGlNodeType;
			const output_connection_point =
				input_node.io.outputs.namedOutputConnectionPoints()[connection.output_index];
			if (output_connection_point) {
				const output_name = output_connection_point.name();
				return input_node.glVarName(output_name);
			} else {
				console.warn(`no output called '${name}' for gl node ${input_node.path()}`);
				throw 'variable_for_input ERROR';
			}
		} else {
			if (this.params.has(name)) {
				return ThreeToGl.any(this.params.get(name)?.value);
			} else {
				const connection_point = this.io.inputs.namedInputConnectionPoints()[input_index];
				return ThreeToGl.any(connection_point.init_value);
			}
		}
	}

	//
	//
	// ADDED LINES
	//
	//
	setLines(shaders_collection_controller: ShadersCollectionController) {}

	reset_code() {
		this._param_configs_controller?.reset();
		// this.resetLines();
	}

	//
	//
	// PARAM CONFIGS
	//
	//
	public setParamConfigs() {}
	param_configs() {
		return this._param_configs_controller?.list();
	}
	paramsGenerating() {
		return false;
	}

	//
	//
	// INPUT
	//
	//
	override paramDefaultValue(name: string): ParamInitValueSerialized {
		return null;
	}
}

export type BaseGlNodeType = TypedGlNode<NodeParamsConfig>;
export class BaseGlNodeClass extends TypedGlNode<NodeParamsConfig> {}

class ParamlessParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ParamlessParamsConfig();
export class ParamlessTypedGlNode extends TypedGlNode<ParamlessParamsConfig> {
	override paramsConfig = ParamsConfig;
}
