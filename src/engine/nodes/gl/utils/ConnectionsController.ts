import {ConnectionPointType} from '../../utils/connections/ConnectionPointType';
import {BaseGlNodeType} from '../_Base';
import {CoreGraphNode} from '../../../../core/graph/CoreGraphNode';
import {TypedNamedConnectionPoint} from '../../utils/connections/NamedConnectionPoint';

type IONameFunction = (index: number) => string;
type ExpectedConnectionTypesFunction = () => ConnectionPointType[];

export class GlConnectionsController {
	private _input_name_function: IONameFunction = (index: number) => {
		return `in${index}`;
	};
	private _output_name_function: IONameFunction = (index: number) => {
		return index == 0 ? 'val' : `val${index}`;
	};
	private _default_input_type: ConnectionPointType = ConnectionPointType.FLOAT;
	private _expected_input_types_function: ExpectedConnectionTypesFunction = () => {
		const type = this.first_input_connection_type() || this._default_input_type;
		return [type, type];
	};
	private _expected_output_types_function: ExpectedConnectionTypesFunction = () => {
		return [this._expected_input_types_function()[0]];
	};

	constructor(private node: BaseGlNodeType) {}

	set_input_name_function(func: IONameFunction) {
		this._input_name_function = func;
	}
	set_output_name_function(func: IONameFunction) {
		this._output_name_function = func;
	}
	set_default_input_type(type: ConnectionPointType) {
		this._default_input_type = type;
	}
	set_expected_input_types_function(func: ExpectedConnectionTypesFunction) {
		this._expected_input_types_function = func;
	}
	set_expected_output_types_function(func: ExpectedConnectionTypesFunction) {
		this._expected_output_types_function = func;
	}

	output_name(index: number) {
		return this._output_name_function(index);
	}

	private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	private _initialized: boolean = false;
	initialize_node() {
		if (this._initialized) {
			console.warn('already initialized', this.node);
			return;
		}
		this._initialized = true;

		this.node.params.add_on_scene_load_hook(
			'_update_signature_if_required',
			this._update_signature_if_required_bound
		);
		this.node.params.set_post_create_params_hook(this._update_signature_if_required_bound);
		this.node.add_post_dirty_hook('_update_signature_if_required', this._update_signature_if_required_bound);
	}

	_update_signature_if_required(dirty_trigger?: CoreGraphNode) {
		if (!this.node.lifecycle.creation_completed || !this._connections_match_inputs()) {
			this.update_connection_types();
			this.node.remove_dirty_state();
			this.make_successors_dirty();
		}
	}
	// used when a node changes its signature, adn the output nodes need to adapt their own signatures
	protected make_successors_dirty() {
		this.node.io.connections
			.output_connections()
			.map((c) => c.node_dest)
			.forEach((o) => {
				o.set_dirty(this.node);
			});
	}

	update_connection_types() {
		const set_dirty = false;
		const expected_input_types = this._expected_input_types_function();
		const expected_output_types = this._expected_output_types_function();

		const named_input_connections = expected_input_types.map((type: ConnectionPointType, i: number) => {
			return new TypedNamedConnectionPoint(this._input_name_function(i), type);
		});
		this.node.io.inputs.set_named_input_connection_points(named_input_connections);
		// this._init_graph_node_inputs();

		this.node.spare_params_controller.create_spare_parameters();

		const named_outputs = expected_output_types.map((type: ConnectionPointType, i: number) => {
			return new TypedNamedConnectionPoint(this._output_name_function(i), type);
		});
		this.node.io.outputs.set_named_output_connection_points(named_outputs, set_dirty);
	}

	protected _connections_match_inputs(): boolean {
		const current_input_types = this.node.io.inputs.named_input_connection_points.map((c) => c.type);
		const current_output_types = this.node.io.outputs.named_output_connection_points.map((c) => c.type);
		const expected_input_types = this._expected_input_types_function();
		const expected_output_types = this._expected_output_types_function();

		if (expected_input_types.length != current_input_types.length) {
			return false;
		}
		if (expected_output_types.length != current_output_types.length) {
			return false;
		}

		for (let i = 0; i < current_input_types.length; i++) {
			if (current_input_types[i] != expected_input_types[i]) {
				return false;
			}
		}
		for (let i = 0; i < current_output_types.length; i++) {
			if (current_output_types[i] != expected_output_types[i]) {
				return false;
			}
		}

		return true;
	}

	// protected input_connection_type() {
	// 	return this.first_input_connection_type();
	// }
	// protected output_connection_type() {
	// 	return this.first_input_connection_type();
	// }

	first_input_connection_type(): ConnectionPointType | undefined {
		const connections = this.node.io.connections.input_connections();
		if (connections) {
			const first_connection = connections[0];
			if (first_connection) {
				const node_src = first_connection.node_src;
				const output_index = first_connection.output_index;
				const node_src_output_connection = node_src.io.outputs.named_output_connection_points[output_index];
				return node_src_output_connection.type;
			}
		}
		// return ConnectionPointType.FLOAT;
	}
}
