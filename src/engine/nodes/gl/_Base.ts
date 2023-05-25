import {TypedNode} from '../_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {AssemblerGlControllerNode} from './code/Controller';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamInitValueSerialized} from '../../params/types/ParamInitValueSerialized';
import {GlParamConfig} from './code/utils/GLParamConfig';
import {ParamType} from '../../poly/ParamType';
import {IntegerParam} from '../../params/Integer';
import {FloatParam} from '../../params/Float';
import {Vector2Param} from '../../params/Vector2';
import {Vector3Param} from '../../params/Vector3';
import {Vector4Param} from '../../params/Vector4';
import {ColorParam} from '../../params/Color';
import {BooleanParam} from '../../params/Boolean';
import {ParamsEditableStateController} from '../utils/io/ParamsEditableStateController';

// const REGEX_PATH_SANITIZE = /\/+/g;
const GL_VAR_NAME_PREFIX = 'v_POLY';
// function _wrapGlVarName(nodesGlVarName:string[], varName:string):string{
// 	return `${GL_VAR_NAME_PREFIX}_${nodesGlVarName}_${varName}`
// }

/**
 *
 *
 * TypedGlNode is the base class for all nodes that process GLSL code. This inherits from [TypedNode](/docs/api/TypedNode).
 *
 */
export class TypedGlNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.GL, K> {
	static override context(): NodeContext {
		return NodeContext.GL;
	}

	protected _param_configs_controller: ParamConfigsController<GlParamConfig<ParamType>> | undefined;
	protected _assembler: BaseGlShaderAssembler | undefined;
	private _paramsEditableStatesController = new ParamsEditableStateController(this);

	override initializeBaseNode() {
		this.uiData.setLayoutHorizontal();
		this.io.connections.initInputs();

		this.io.connection_points.spare_params.initializeNode();
		this._paramsEditableStatesController.initializeNode();
	}

	override cook() {
		console.warn('gl node cooking');
	}

	protected _setMatToRecompile() {
		this.materialNode()?.assemblerController()?.setCompilationRequiredAndDirty(this);
	}
	materialNode(): AssemblerGlControllerNode | undefined {
		const parent = this.parent();
		if (parent) {
			if (parent.context() == NodeContext.GL) {
				return (parent as BaseGlNodeType)?.materialNode();
			} else {
				return parent as AssemblerGlControllerNode;
			}
		}
	}

	//
	//
	// VARIABLES
	//
	//
	glVarName(varName: string) {
		const nodes: BaseGlNodeType[] = [this];
		let currentNode: BaseGlNodeType = this;
		while (currentNode.parent() && currentNode.parent() != this.materialNode()) {
			const parent = currentNode.parent() as BaseGlNodeType;
			if (parent) {
				nodes.unshift(parent);
				currentNode = parent;
			}
		}
		const baseGlVarNames = nodes.map((node) => node._glVarNameBase());
		// if(this.parent()==this.materialNode()){
		// 	return `${GL_VAR_NAME_PREFIX}_${this.name()}`
		// }
		// const pathSanitized = this.path(this.materialNode()).replace(REGEX_PATH_SANITIZE, '_');
		return `${GL_VAR_NAME_PREFIX}_${baseGlVarNames.join('_')}_${varName}`;
	}
	protected _glVarNameBase() {
		return this.name();
	}

	variableForInputParam(
		param: IntegerParam | FloatParam | Vector2Param | Vector3Param | Vector4Param | ColorParam | BooleanParam
	) {
		return this.variableForInput(param.name());
	}

	variableForInput(inputName: string): string {
		const input_index = this.io.inputs.getInputIndex(inputName);
		const connection = this.io.connections.inputConnection(input_index);
		if (connection) {
			const input_node = (<unknown>connection.node_src) as BaseGlNodeType;
			const output_connection_point =
				input_node.io.outputs.namedOutputConnectionPoints()[connection.output_index];
			if (output_connection_point) {
				const output_name = output_connection_point.name();
				return input_node.glVarName(output_name);
			} else {
				console.warn(`no output called '${inputName}' for gl node ${input_node.path()}`);
				throw 'variable_for_input ERROR';
			}
		} else {
			if (this.params.has(inputName)) {
				return ThreeToGl.any(this.params.get(inputName)?.value);
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

class ParamlessGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ParamlessGlParamsConfig();
export class ParamlessTypedGlNode extends TypedGlNode<ParamlessGlParamsConfig> {
	override paramsConfig = ParamsConfig;
}
