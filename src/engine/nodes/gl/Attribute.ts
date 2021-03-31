/**
 * Allows to feed a vertex attribute into the shader
 *
 *
 */
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
import {GlNodeType} from '../../poly/NodeContext';
class AttributeGlParamsConfig extends NodeParamsConfig {
	/** @param attribute name */
	name = ParamConfig.STRING('');
	/** @param attribute type (float, vec2, vec3, vec4) */
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	/** @param allows to export the attribute to a material (when used inside a particles system) */
	texport_when_connected = ParamConfig.BOOLEAN(0, {hidden: true});
	/** @param allows to export the attribute to a material (when used inside a particles system) */
	export_when_connected = ParamConfig.BOOLEAN(0, {visibleIf: {texport_when_connected: 1}});
}
const ParamsConfig = new AttributeGlParamsConfig();

export class AttributeGlNode extends TypedGlNode<AttributeGlParamsConfig> {
	paramsConfig = ParamsConfig;
	static type(): Readonly<GlNodeType.ATTRIBUTE> {
		return GlNodeType.ATTRIBUTE;
	}
	static readonly INPUT_NAME = 'in';
	static readonly OUTPUT_NAME = 'val';

	private _on_create_set_name_if_none_bound = this._on_create_set_name_if_none.bind(this);
	// private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	initializeNode() {
		this.addPostDirtyHook('_set_mat_to_recompile', this._set_mat_to_recompile_if_is_exporting.bind(this));
		this.lifecycle.add_on_create_hook(this._on_create_set_name_if_none_bound);
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(() => {
			if (this.material_node?.assemblerController?.allow_attribute_exports()) {
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
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.name, this.p.export_when_connected], () => {
					return this.pv.export_when_connected ? `${this.pv.name} (EXPORTED)` : this.pv.name;
				});
			});
		});
		this.params.addOnSceneLoadHook('prepare params', () => {
			if (this.material_node?.assemblerController?.allow_attribute_exports()) {
				this.p.texport_when_connected.set(1);
			}
		});
	}
	// createParams() {}
	// inputless_params_names(): string[] {
	// 	return ['type'];
	// }

	get input_name() {
		return AttributeGlNode.INPUT_NAME;
	}
	get output_name() {
		return AttributeGlNode.OUTPUT_NAME;
	}

	// private create_inputs_from_params() {
	// 	if (this.material_node.allow_attribute_exports) {
	// 		// this.set_named_inputs([new TypedConnectionFloat(AttributeGlNode.input_name())]);
	// 		this.io.inputs.setNamedInputConnectionPoints([
	// 			new TypedNamedConnectionPoint(INPUT_NAME, ConnectionPointTypes[this.pv.type]),
	// 		]);
	// 		// this._init_graph_node_inputs();
	// 	}
	// }

	setLines(shaders_collection_controller: ShadersCollectionController) {
		this.material_node?.assemblerController?.assembler.set_node_lines_attribute(
			this,
			shaders_collection_controller
		);
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

	get attribute_name(): string {
		return this.pv.name.trim();
	}
	gl_type(): GlConnectionPointType {
		return this.io.outputs.namedOutputConnectionPoints()[0].type();
	}
	set_gl_type(type: GlConnectionPointType) {
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
		return this.io.outputs.namedOutputConnectionPointsByName(this.output_name);
		// }
	}
	// connected_output(): NamedConnection {
	// 	const output = this.named_output(0);
	// 	if (output) {
	// 		return output; //this.named_inputs().filter(ni=>ni.name() == Attribute.input_name())[0]
	// 	}
	// }
	get is_importing(): boolean {
		return this.io.outputs.used_output_names().length > 0; // TODO: ensure that we can check that the connected outputs are part of the nodes retrieved by the node traverser
	}
	get is_exporting(): boolean {
		if (this.pv.export_when_connected) {
			const input_node = this.io.inputs.named_input(AttributeGlNode.INPUT_NAME);
			return input_node != null;
		} else {
			return false;
		}
	}
	private _set_mat_to_recompile_if_is_exporting() {
		if (this.is_exporting) {
			this._set_mat_to_recompile();
		}
	}
	//
	//
	// HOOKS
	//
	//
	private _on_create_set_name_if_none() {
		if (this.pv.name == '') {
			this.p.name.set(this.name());
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
	// 	this.material_node?.assembler_controller.set_compilation_required_and_dirty(this);
	// }
	// private update_input_and_output_types() {
	// 	const set_dirty = false;
	// 	this.io.outputs.setNamedOutputConnectionPoints(
	// 		[new TypedNamedConnectionPoint(this.output_name, ConnectionPointTypesAvailableForAttribute[this.pv.type])],
	// 		set_dirty
	// 	);
	// 	if (this.material_node?.assembler_controller.allow_attribute_exports()) {
	// 		this.io.inputs.setNamedInputConnectionPoints([
	// 			new TypedNamedConnectionPoint(this.input_name, ConnectionPointTypesAvailableForAttribute[this.pv.type]),
	// 		]);
	// 	}
	// }
}
