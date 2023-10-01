/**
 * Allows to feed a vertex attribute into the shader
 *
 *
 */
import {GlType} from './../../poly/registers/nodes/types/Gl';
import {TypedGlNode, BaseGlNodeType} from './_Base';
import {GlConnectionPointType, BaseGlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

export const ATTRIBUTE_NODE_AVAILABLE_GL_TYPES = [
	GlConnectionPointType.FLOAT,
	GlConnectionPointType.VEC2,
	GlConnectionPointType.VEC3,
	GlConnectionPointType.VEC4,
];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
class AttributeGlParamsConfig extends NodeParamsConfig {
	/** @param attribute name */
	name = ParamConfig.STRING('attribute1');
	/** @param attribute type (float, vec2, vec3, vec4) */
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	/** @param allows to export the attribute to a material (when used inside a particles system) */
	texportWhenConnected = ParamConfig.BOOLEAN(0, {hidden: true});
	/** @param allows to export the attribute to a material (when used inside a particles system) */
	exportWhenConnected = ParamConfig.BOOLEAN(0, {visibleIf: {texportWhenConnected: 1}});
}
const ParamsConfig = new AttributeGlParamsConfig();

export class AttributeGlNode extends TypedGlNode<AttributeGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<GlType.ATTRIBUTE> {
		return GlType.ATTRIBUTE;
	}
	static readonly INPUT_NAME = 'in';
	static readonly OUTPUT_NAME = 'val';

	// private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompileIfIsExporting.bind(this));
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(() => {
			if (this.materialNode()?.assemblerController()?.allow_attribute_exports()) {
				return [ATTRIBUTE_NODE_AVAILABLE_GL_TYPES[this.pv.type]];
			} else {
				return [];
			}
		});
		this.io.connection_points.set_input_name_function((index: number) => {
			return AttributeGlNode.INPUT_NAME;
		});
		this.io.connection_points.set_expected_output_types_function(() => [
			ATTRIBUTE_NODE_AVAILABLE_GL_TYPES[this.pv.type],
		]);
		// this.params.add_on_scene_load_hook('_update_signature_if_required', this._update_signature_if_required_bound);
		// this.params.set_post_create_params_hook(this._update_signature_if_required_bound);
		// this.addPostDirtyHook('_update_signature_if_required', this._update_signature_if_required_bound);

		this.lifecycle.onAfterAdded(this._bound_setExportWhenConnectedStatus);
		this.params.addOnSceneLoadHook('prepare params', this._bound_setExportWhenConnectedStatus);
	}
	private _bound_setExportWhenConnectedStatus = this._setExportWhenConnectedStatus.bind(this);
	private _setExportWhenConnectedStatus() {
		if (this.materialNode()?.assemblerController()?.allow_attribute_exports()) {
			this.p.texportWhenConnected.set(1);
		}
	}
	setAttribSize(size: number) {
		this.p.type.set(size - 1);
	}

	// createParams() {}
	// inputless_params_names(): string[] {
	// 	return ['type'];
	// }

	inputName() {
		return AttributeGlNode.INPUT_NAME;
	}
	outputName() {
		return AttributeGlNode.OUTPUT_NAME;
	}
	// TODO:
	// ideally glVarName should know which shader it is being called in.
	// so that if it is in a vertex shader, it can return the name of the attribute directly.
	// and if it is in a fragment, it would behave as usual.
	// override glVarName() {
	// 	// if (name) {
	// 	// 	return super.glVarName(name);
	// 	// }
	// 	// return this.varyingName();
	// }
	varyingName() {
		return `v_POLY_attribute_${this.pv.name}`;
	}

	// private create_inputs_from_params() {
	// 	if (this.materialNode().allow_attribute_exports) {
	// 		// this.set_named_inputs([new TypedConnectionFloat(AttributeGlNode.input_name())]);
	// 		this.io.inputs.setNamedInputConnectionPoints([
	// 			new TypedNamedConnectionPoint(INPUT_NAME, ConnectionPointTypes[this.pv.type]),
	// 		]);
	// 		// this._init_graph_node_inputs();
	// 	}
	// }

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const assembler = shadersCollectionController.assembler() as BaseGlShaderAssembler;
		assembler.setNodeLinesAttribute(this, shadersCollectionController);
	}

	// update_output_type(constructor) {
	// 	const named_output = new constructor(Attribute.output_name());
	// 	this.set_named_outputs([named_output]);
	// }
	// update_input_type(constructor) {
	// 	const named_input = new constructor(Attribute.input_name());
	// 	this.set_named_inputs([named_input]);
	// 	this._init_graph_node_inputs();
	// }

	attributeName(): string {
		return this.pv.name.trim();
	}
	glType(): GlConnectionPointType {
		const outputConnectionPoints = this.io.outputs.namedOutputConnectionPoints();
		if (!outputConnectionPoints) {
			return GlConnectionPointType.FLOAT;
		}
		return outputConnectionPoints[0].type();
	}
	setGlType(type: GlConnectionPointType) {
		this.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(type));
	}
	//
	//
	// Utility methods for SOP/ParticlesSystemGPU and Assembler/Particles
	//
	//
	connected_input_node(): BaseGlNodeType | null {
		// if (this.io.inputs.hasNamedInputs()) {
		return this.io.inputs.named_input(AttributeGlNode.INPUT_NAME);
		// }
	}
	connected_input_connection_point(): BaseGlConnectionPoint | undefined {
		return this.io.inputs.named_input_connection_point(AttributeGlNode.INPUT_NAME);
	}
	// connected_input(): NamedConnection {
	// 	const connection_point = this.connected_input_connection_point();
	// 	if (connection_point) {
	// 		return this.io.inputs.named_inputs().filter((ni) => ni.name() == Attribute.input_name())[0];
	// 	}
	// }
	output_connection_point(): BaseGlConnectionPoint | undefined {
		// if (this.io.inputs.hasNamedInputs()) {
		return this.io.outputs.namedOutputConnectionPointsByName(this.outputName());
		// }
	}
	// connected_output(): NamedConnection {
	// 	const output = this.named_output(0);
	// 	if (output) {
	// 		return output; //this.named_inputs().filter(ni=>ni.name() == Attribute.input_name())[0]
	// 	}
	// }
	isImporting(): boolean {
		return this.io.outputs.used_output_names().length > 0; // TODO: ensure that we can check that the connected outputs are part of the nodes retrieved by the node traverser
	}
	isExporting(): boolean {
		if (isBooleanTrue(this.pv.exportWhenConnected)) {
			const input_node = this.io.inputs.named_input(AttributeGlNode.INPUT_NAME);
			return input_node != null;
		} else {
			return false;
		}
	}
	private _setMatToRecompileIfIsExporting() {
		//if (this.isExporting()) {
		// we cannot just use .isExporting()
		// as the node must also set the parent to recompile
		// when its input is being removed
		// (in which case .isExporting() would always return false)
		if (isBooleanTrue(this.pv.exportWhenConnected)) {
			this._setMatToRecompile();
		}
	}

	//
	//
	// SIGNATURE
	//
	//
	// private _update_signature_if_required(dirty_trigger?: CoreGraphNode) {
	// 	if (!this.lifecycle.creation_completed || dirty_trigger == this.p.type) {
	// 		this.update_input_and_output_types();
	// 		this.removeDirtyState();
	// 		this.make_output_nodes_dirty();
	// 	}
	// 	this.materialNode()?.assembler_controller.set_compilation_required_and_dirty(this);
	// }
	// private update_input_and_output_types() {
	// 	const set_dirty = false;
	// 	this.io.outputs.setNamedOutputConnectionPoints(
	// 		[new TypedNamedConnectionPoint(this.output_name, ConnectionPointTypesAvailableForAttribute[this.pv.type])],
	// 		set_dirty
	// 	);
	// 	if (this.materialNode()?.assembler_controller.allow_attribute_exports()) {
	// 		this.io.inputs.setNamedInputConnectionPoints([
	// 			new TypedNamedConnectionPoint(this.input_name, ConnectionPointTypesAvailableForAttribute[this.pv.type]),
	// 		]);
	// 	}
	// }
}
