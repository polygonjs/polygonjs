import lodash_trim from 'lodash/trim';

import {TypedGlNode, BaseGlNodeType} from './_Base';
// import {BaseNodeGlMathFunctionArg1} from './_BaseMathFunctionArg1';
import {GlConnectionPointType, BaseGlConnectionPoint} from '../utils/io/connections/Gl';
import {ParamType} from '../../poly/ParamType';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const ATTRIBUTE_NODE_AVAILABLE_GL_TYPES = [
	GlConnectionPointType.FLOAT,
	GlConnectionPointType.VEC2,
	GlConnectionPointType.VEC3,
	GlConnectionPointType.VEC4,
];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttributeGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new AttributeGlParamsConfig();

export class AttributeGlNode extends TypedGlNode<AttributeGlParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<'attribute'> {
		return 'attribute';
	}
	static readonly INPUT_NAME = 'export';
	static readonly OUTPUT_NAME = 'val';

	private _on_create_set_name_if_none_bound = this._on_create_set_name_if_none.bind(this);
	// private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	initialize_node() {
		this.add_post_dirty_hook('_set_mat_to_recompile', this._set_mat_to_recompile_if_is_exporting.bind(this));
		this.lifecycle.add_on_create_hook(this._on_create_set_name_if_none_bound);
		this.io.connection_points.initialize_node();

		this.io.connection_points.set_expected_input_types_function(() => {
			if (this.material_node?.assembler_controller?.allow_attribute_exports()) {
				return [ATTRIBUTE_NODE_AVAILABLE_GL_TYPES[this.pv.type]];
			} else {
				return [];
			}
		});
		this.io.connection_points.set_expected_output_types_function(() => [
			ATTRIBUTE_NODE_AVAILABLE_GL_TYPES[this.pv.type],
		]);
		// this.params.add_on_scene_load_hook('_update_signature_if_required', this._update_signature_if_required_bound);
		// this.params.set_post_create_params_hook(this._update_signature_if_required_bound);
		// this.add_post_dirty_hook('_update_signature_if_required', this._update_signature_if_required_bound);
		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.name]);
			});
		});
	}
	create_params() {
		if (this.material_node?.assembler_controller?.allow_attribute_exports()) {
			this.add_param(ParamType.BOOLEAN, 'export_when_connected', 0);
		}
	}
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
	// 		this.io.inputs.set_named_input_connection_points([
	// 			new TypedNamedConnectionPoint(INPUT_NAME, ConnectionPointTypes[this.pv.type]),
	// 		]);
	// 		// this._init_graph_node_inputs();
	// 	}
	// }

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		// if (lines_controller.shader_name) {
		this.material_node?.assembler_controller?.assembler.set_node_lines_attribute(
			this,
			shaders_collection_controller
		);
		// }
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
		return lodash_trim(this.pv.name);
	}
	gl_type(): GlConnectionPointType {
		return this.io.outputs.named_output_connection_points[0].type;
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
		// if (this.io.inputs.has_named_inputs) {
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
		// if (this.io.inputs.has_named_inputs) {
		return this.io.outputs.named_output_connection_points_by_name(this.output_name);
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
			this.p.name.set(this.name);
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
	// 		this.remove_dirty_state();
	// 		this.make_output_nodes_dirty();
	// 	}
	// 	this.material_node?.assembler_controller.set_compilation_required_and_dirty(this);
	// }
	// private update_input_and_output_types() {
	// 	const set_dirty = false;
	// 	this.io.outputs.set_named_output_connection_points(
	// 		[new TypedNamedConnectionPoint(this.output_name, ConnectionPointTypesAvailableForAttribute[this.pv.type])],
	// 		set_dirty
	// 	);
	// 	if (this.material_node?.assembler_controller.allow_attribute_exports()) {
	// 		this.io.inputs.set_named_input_connection_points([
	// 			new TypedNamedConnectionPoint(this.input_name, ConnectionPointTypesAvailableForAttribute[this.pv.type]),
	// 		]);
	// 	}
	// }
}
