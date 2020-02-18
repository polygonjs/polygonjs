import lodash_trim from 'lodash/trim';

import {TypedGlNode, BaseGlNodeType} from './_Base';
// import {BaseNodeGlMathFunctionArg1} from './_BaseMathFunctionArg1';
import {ConnectionPointTypes, ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {BaseNamedConnectionPointType} from '../utils/connections/NamedConnectionPoint';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {ParamType} from 'src/engine/poly/ParamType';
// import {
// 	VAR_TYPES,
// 	TYPED_CONNECTION_BY_VAR_TYPE,
// 	TypedConnectionFloat,
// 	TypedConnectionVec2,
// 	TypedConnectionVec3,
// 	TypedConnectionVec4,
// } from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {DefinitionAttribute} from './Definition/Attribute'
// import {DefinitionVarying} from './Definition/Varying'
// import {Definition} from './Definition/_Module';
// import {NamedConnection} from '../Util/NamedConnection';

const INPUT_NAME = 'input_val';
const OUTPUT_NAME = 'output_val';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
class AttributeGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ConnectionPointTypes.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new AttributeGlParamsConfig();

export class AttributeGlNode extends TypedGlNode<AttributeGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribute';
	}

	private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	initialize_node() {
		// this.set_outputs([
		// 	new GlDataIO('out')
		// ])
		// this.io.outputs.set_named_output_connection_points([new TypedConnectionFloat(INPUT_NAME)]);
		this.update_input_and_output_types();

		this.add_post_dirty_hook('_update_signature_if_required', this._update_signature_if_required_bound);
	}
	create_params() {
		if (this.material_node?.assembler_controller.allow_attribute_exports()) {
			this.add_param(ParamType.BOOLEAN, 'export_when_connected', 0);
		}
	}
	private _update_signature_if_required(dirty_trigger?: CoreGraphNode) {
		if (dirty_trigger == this.p.type) {
			// const val = this.pv.type
			// const name = VAR_TYPES[val];
			// const constructor = TYPED_CONNECTION_BY_VAR_TYPE[name];
			// this.update_output_type(constructor);
			// this.update_input_type(constructor);
			this.update_input_and_output_types();
			this.remove_dirty_state();
			this.make_output_nodes_dirty();
		}
		this.material_node?.assembler_controller.set_compilation_required_and_dirty();
	}

	get input_name() {
		return INPUT_NAME;
	}
	get output_name() {
		return OUTPUT_NAME;
	}

	private update_input_and_output_types() {
		this.io.inputs.set_named_input_connection_points([
			new TypedNamedConnectionPoint(this.input_name, ConnectionPointTypes[this.pv.type]),
		]);
		if (this.material_node?.assembler_controller.allow_attribute_exports()) {
			this.io.outputs.set_named_output_connection_points([
				new TypedNamedConnectionPoint(this.output_name, ConnectionPointTypes[this.pv.type]),
			]);
		}
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

	set_lines() {
		if (this._shader_name) {
			this.material_node?.assembler_controller.set_node_lines_attribute(this, this._shader_name);
		}
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
	gl_type(): ConnectionPointType {
		return this.io.outputs.named_output_connection_points[0].type;
	}
	//
	//
	// Utility methods for SOP/ParticlesSystemGPU and Assembler/Particles
	//
	//
	connected_input_node(): BaseGlNodeType | null {
		// if (this.io.inputs.has_named_inputs) {
		return this.io.inputs.named_input(INPUT_NAME);
		// }
	}
	connected_input_connection_point(): BaseNamedConnectionPointType | undefined {
		return this.io.inputs.named_input_connection_point(INPUT_NAME);
	}
	// connected_input(): NamedConnection {
	// 	const connection_point = this.connected_input_connection_point();
	// 	if (connection_point) {
	// 		return this.io.inputs.named_inputs().filter((ni) => ni.name() == Attribute.input_name())[0];
	// 	}
	// }
	output_connection_point(): BaseNamedConnectionPointType | undefined {
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
		return this.io.outputs.used_output_names().length > 0; // TODO: typescript - ensure that we can check that the connected outputs are part of the nodes retrived by the node traverser
	}
	get is_exporting(): boolean {
		if (this.pv.export_when_connected) {
			const input_node = this.io.inputs.named_input(INPUT_NAME);
			return input_node != null;
		} else {
			return false;
		}
	}
}
