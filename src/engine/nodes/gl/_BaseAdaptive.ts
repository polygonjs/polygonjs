import {TypedGlNode} from './_Base';
// import {ParamType} from '../../../Engine/Param/_Module';
// import {ThreeToGl} from '../../../Core/ThreeToGl'

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
// import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {GlConnectionsController} from './utils/ConnectionsController';
// import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';

class BaseAdaptiveParamsConfig extends NodeParamsConfig {}

export abstract class BaseAdaptiveGlNode<T extends BaseAdaptiveParamsConfig> extends TypedGlNode<T> {
	// protected abstract gl_output_name(): string;
	// protected abstract gl_input_name(index: number): string;
	// protected abstract expected_input_types(): ConnectionPointType[];
	// protected abstract expected_output_types(): ConnectionPointType[];

	public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);

	// private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	initialize_node() {
		super.initialize_node();
		this.gl_connections_controller.initialize_node();
		// this.params.add_on_scene_load_hook('_update_signature_if_required', this._update_signature_if_required_bound);
		// this.add_post_dirty_hook('_update_signature_if_required', this._update_signature_if_required_bound);
	}

	// _update_signature_if_required(dirty_trigger?: CoreGraphNode) {
	// 	if (!this.lifecycle.creation_completed || !this._connections_match_inputs()) {
	// 		this.update_connection_types();
	// 		this.remove_dirty_state();
	// 		this.make_output_nodes_dirty();
	// 	}
	// }

	// create_inputs_from_params() {
	// 	this.update_connection_types();
	// }

	// update_connection_types() {
	// 	const set_dirty = false;
	// 	const expected_input_types = this.expected_input_types();
	// 	const expected_output_types = this.expected_output_types();

	// 	const named_input_connections = expected_input_types.map((type: ConnectionPointType, i: number) => {
	// 		return new TypedNamedConnectionPoint(this.gl_input_name(i), type);
	// 	});
	// 	this.io.inputs.set_named_input_connection_points(named_input_connections);
	// 	// this._init_graph_node_inputs();

	// 	this.create_spare_parameters();

	// 	const named_outputs = expected_output_types.map((type: ConnectionPointType, i: number) => {
	// 		return new TypedNamedConnectionPoint(this.gl_output_name(), type);
	// 	});
	// 	this.io.outputs.set_named_output_connection_points(named_outputs, set_dirty);
	// }

	// protected _connections_match_inputs(): boolean {
	// 	const current_input_types = this.io.inputs.named_input_connection_points.map((c) => c.type);
	// 	const current_output_types = this.io.outputs.named_output_connection_points.map((c) => c.type);
	// 	const expected_input_types = this.expected_input_types();
	// 	const expected_output_types = this.expected_output_types();

	// 	if (expected_input_types.length != current_input_types.length) {
	// 		return false;
	// 	}
	// 	if (expected_output_types.length != current_output_types.length) {
	// 		return false;
	// 	}

	// 	for (let i = 0; i < current_input_types.length; i++) {
	// 		if (current_input_types[i] != expected_input_types[i]) {
	// 			return false;
	// 		}
	// 	}
	// 	for (let i = 0; i < current_output_types.length; i++) {
	// 		if (current_output_types[i] != expected_output_types[i]) {
	// 			return false;
	// 		}
	// 	}

	// 	return true;
	// }

	// protected input_connection_type() {
	// 	return this.first_input_connection_type();
	// }
	// protected output_connection_type() {
	// 	return this.first_input_connection_type();
	// }

	// private first_input_connection_type(): ConnectionPointType {
	// 	const connections = this.io.connections.input_connections();
	// 	if (connections) {
	// 		const first_connection = connections[0];
	// 		if (first_connection) {
	// 			const node_src = first_connection.node_src;
	// 			const output_index = first_connection.output_index;
	// 			const node_src_output_connection = node_src.io.outputs.named_output_connection_points[output_index];
	// 			return node_src_output_connection.type;
	// 		}
	// 	}
	// 	return ConnectionPointType.FLOAT;
	// }
}
