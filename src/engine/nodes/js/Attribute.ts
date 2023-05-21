/**
 * reads or writes a position or geometry attribute
 *
 *
 */
import {TypedJsNode, BaseJsNodeType} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsConnectionPointType, BaseJsConnectionPoint} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';

export const ATTRIBUTE_NODE_AVAILABLE_JS_TYPES = [
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/Type';
import {PointBuilderFunctionDataAttributeDataItem} from './code/assemblers/pointBuilder/PointBuilderPersistedConfig';
class AttributeJsParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	/** @param allows to export the attribute */
	exportWhenConnected = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new AttributeJsParamsConfig();

export class AttributeJsNode extends TypedJsNode<AttributeJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ATTRIBUTE;
	}
	static readonly INPUT_NAME = 'export';
	static readonly OUTPUT_NAME = 'val';

	// private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	override initializeNode() {
		// this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(() => this._expectedInputTypes());
		this.io.connection_points.set_input_name_function((index: number) => this.inputName());
		this.io.connection_points.set_expected_output_types_function(() => [this._expectedOutputType()]);
		// this.params.add_on_scene_load_hook('_update_signature_if_required', this._update_signature_if_required_bound);
		// this.params.set_post_create_params_hook(this._update_signature_if_required_bound);
		// this.addPostDirtyHook('_update_signature_if_required', this._update_signature_if_required_bound);
	}

	// inputless_params_names(): string[] {
	// 	return ['type'];
	// }
	private _expectedInputTypes() {
		return this.pv.exportWhenConnected ? [this._expectedOutputType()] : [];
	}
	private _expectedOutputType() {
		return ATTRIBUTE_NODE_AVAILABLE_JS_TYPES[this.pv.type];
	}

	inputName() {
		return AttributeJsNode.INPUT_NAME;
	}
	outputName() {
		return AttributeJsNode.OUTPUT_NAME;
	}

	override setLines(linesController: JsLinesCollectionController) {
		// if (lines_controller.shader_name) {
		this.functionNode()?.assemblerController()?.assembler.setNodeLinesAttribute(this, linesController);
		// }
	}
	attribData(): PointBuilderFunctionDataAttributeDataItem {
		return {
			attribName: this.attributeName(),
			attribType: this.jsType(),
		};
	}
	attributeName(): string {
		return this.pv.name.trim();
	}
	jsType() {
		return this.io.outputs.namedOutputConnectionPoints()[0].type();
	}
	setJsType(type: JsConnectionPointType) {
		this.p.type.set(ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.indexOf(type));
	}
	//
	//
	// Utility methods for SOP/ParticlesSystemGPU and Assembler/Particles
	//
	//
	connected_input_node(): BaseJsNodeType | null {
		return this.io.inputs.named_input(AttributeJsNode.INPUT_NAME) as BaseJsNodeType | null;
	}
	connected_input_connection_point(): BaseJsConnectionPoint | undefined {
		return this.io.inputs.named_input_connection_point(AttributeJsNode.INPUT_NAME);
	}

	output_connection_point(): BaseJsConnectionPoint | undefined {
		// if (this.io.inputs.hasNamedInputs()) {
		return this.io.outputs.namedOutputConnectionPointsByName(this.inputName());
		// }
	}

	isImporting(): boolean {
		return this.io.outputs.used_output_names().length > 0; // TODO: ensure that we can check that the connected outputs are part of the nodes retrived by the node traverser
	}
	isExporting(): boolean {
		if (isBooleanTrue(this.pv.exportWhenConnected)) {
			const inputNode = this.io.inputs.named_input(AttributeJsNode.INPUT_NAME);
			return inputNode != null;
		} else {
			return false;
		}
	}

	// private _set_mat_to_recompile_if_is_exporting() {
	// 	if (this.is_exporting) {
	// 		this._set_function_node_to_recompile();
	// 	}
	// }
}
