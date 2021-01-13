import {TypedJsNode, BaseJsNodeType} from './_Base';
import {ParamType} from '../../poly/ParamType';
import {LinesController} from './code/utils/LinesController';
import {JsConnectionPointType, BaseJsConnectionPoint} from '../utils/io/connections/Js';

const ATTRIBUTE_NODE_AVAILABLE_JS_TYPES = [
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.VEC2,
	JsConnectionPointType.VEC3,
	JsConnectionPointType.VEC4,
];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttributeJsParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new AttributeJsParamsConfig();

export class AttributeJsNode extends TypedJsNode<AttributeJsParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribute';
	}
	static readonly INPUT_NAME = 'export';
	static readonly OUTPUT_NAME = 'val';

	private _on_create_set_name_if_none_bound = this._on_create_set_name_if_none.bind(this);
	// private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	initialize_node() {
		this.addPostDirtyHook('_set_mat_to_recompile', this._set_mat_to_recompile_if_is_exporting.bind(this));
		this.lifecycle.add_on_create_hook(this._on_create_set_name_if_none_bound);
		this.io.connection_points.initialize_node();

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [
			ATTRIBUTE_NODE_AVAILABLE_JS_TYPES[this.pv.type],
		]);
		// this.params.add_on_scene_load_hook('_update_signature_if_required', this._update_signature_if_required_bound);
		// this.params.set_post_create_params_hook(this._update_signature_if_required_bound);
		// this.addPostDirtyHook('_update_signature_if_required', this._update_signature_if_required_bound);
	}
	create_params() {
		if (this.function_node?.assembler_controller.allow_attribute_exports()) {
			this.addParam(ParamType.BOOLEAN, 'export_when_connected', 0);
		}
	}
	// inputless_params_names(): string[] {
	// 	return ['type'];
	// }

	get input_name() {
		return AttributeJsNode.INPUT_NAME;
	}
	get output_name() {
		return AttributeJsNode.OUTPUT_NAME;
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

	set_lines(lines_controller: LinesController) {
		// if (lines_controller.shader_name) {
		this.function_node?.assembler_controller.assembler.set_node_lines_attribute(this, lines_controller);
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
		return this.pv.name.trim();
	}
	gl_type() {
		return this.io.outputs.named_output_connection_points[0].type();
	}
	set_gl_type(type: JsConnectionPointType) {
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
	// connected_input(): NamedConnection {
	// 	const connection_point = this.connected_input_connection_point();
	// 	if (connection_point) {
	// 		return this.io.inputs.named_inputs().filter((ni) => ni.name() == Attribute.input_name())[0];
	// 	}
	// }
	output_connection_point(): BaseJsConnectionPoint | undefined {
		// if (this.io.inputs.has_named_inputs) {
		return this.io.outputs.named_output_connection_points_by_name(this.input_name);
		// }
	}
	// connected_output(): NamedConnection {
	// 	const output = this.named_output(0);
	// 	if (output) {
	// 		return output; //this.named_inputs().filter(ni=>ni.name() == Attribute.input_name())[0]
	// 	}
	// }
	get is_importing(): boolean {
		return this.io.outputs.used_output_names().length > 0; // TODO: ensure that we can check that the connected outputs are part of the nodes retrived by the node traverser
	}
	get is_exporting(): boolean {
		if (this.pv.export_when_connected) {
			const input_node = this.io.inputs.named_input(AttributeJsNode.INPUT_NAME);
			return input_node != null;
		} else {
			return false;
		}
	}
	private _set_mat_to_recompile_if_is_exporting() {
		if (this.is_exporting) {
			this._set_function_node_to_recompile();
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
}
