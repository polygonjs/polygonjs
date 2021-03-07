// import {BaseGlNodeType} from '../_Base';
// import {CoreGraphNode} from '../../../../core/graph/CoreGraphNode';
// import {GlConnectionPoint, GlConnectionPointType, BaseGlConnectionPoint} from '../../utils/io/connections/Gl';
// import {TypedNodeConnection} from '../../utils/io/NodeConnection';
// import {NodeContext} from '../../../poly/NodeContext';

// type IONameFunction = (index: number) => string;
// type ExpectedConnectionTypesFunction = () => GlConnectionPointType[];

// export class GlConnectionsController {
// 	private _input_name_function: IONameFunction = (index: number) => {
// 		return `in${index}`;
// 	};
// 	private _output_name_function: IONameFunction = (index: number) => {
// 		return index == 0 ? 'val' : `val${index}`;
// 	};
// 	// private _default_input_type: ConnectionPointType = ConnectionPointType.FLOAT;
// 	private _expected_input_types_function: ExpectedConnectionTypesFunction = () => {
// 		const type = this.first_input_connection_type() || GlConnectionPointType.FLOAT;
// 		return [type, type];
// 	};
// 	private _expected_output_types_function: ExpectedConnectionTypesFunction = () => {
// 		return [this._expected_input_types_function()[0]];
// 	};

// 	constructor(private node: BaseGlNodeType) {}

// 	set_input_name_function(func: IONameFunction) {
// 		this._input_name_function = func;
// 	}
// 	set_output_name_function(func: IONameFunction) {
// 		this._output_name_function = func;
// 	}
// 	// set_default_input_type(type: ConnectionPointType) {
// 	// 	this._default_input_type = type;
// 	// }
// 	set_expected_input_types_function(func: ExpectedConnectionTypesFunction) {
// 		this._expected_input_types_function = func;
// 	}
// 	set_expected_output_types_function(func: ExpectedConnectionTypesFunction) {
// 		this._expected_output_types_function = func;
// 	}

// 	output_name(index: number) {
// 		return this._wrapped_output_name_function(index);
// 	}

// 	private _update_signature_if_required_bound = this.update_signature_if_required.bind(this);
// 	private _initialized: boolean = false;
// 	initializeNode() {
// 		if (this._initialized) {
// 			console.warn('already initialized', this.node);
// 			return;
// 		}
// 		this._initialized = true;

// 		this.node.io.inputs.add_on_set_input_hook(
// 			'_update_signature_if_required',
// 			this._update_signature_if_required_bound
// 		);
// 		this.node.params.add_on_scene_load_hook(
// 			'_update_signature_if_required',
// 			this._update_signature_if_required_bound
// 		);
// 		this.node.params.set_post_create_params_hook(this._update_signature_if_required_bound);
// 		this.node.addPostDirtyHook('_update_signature_if_required', this._update_signature_if_required_bound);
// 	}

// 	update_signature_if_required(dirty_trigger?: CoreGraphNode) {
// 		if (!this.node.lifecycle.creation_completed || !this._connections_match_inputs()) {
// 			this.update_connection_types();
// 			this.node.removeDirtyState();
// 			this.make_successors_update_signatures();
// 		}
// 	}
// 	// used when a node changes its signature, adn the output nodes need to adapt their own signatures
// 	private make_successors_update_signatures() {
// 		for (let successor of this.node.graph_all_successors()) {
// 			const gl_node = successor as BaseGlNodeType;
// 			if (gl_node.gl_connections_controller) {
// 				gl_node.gl_connections_controller.update_signature_if_required(this.node);
// 			}
// 		}
// 		// this.node.io.connections
// 		// 	.output_connections()
// 		// 	.map((c) => c.node_dest)
// 		// 	.forEach((o) => {
// 		// 		o.set_dirty(this.node);
// 		// 	});
// 	}

// 	update_connection_types() {
// 		const set_dirty = false;
// 		const expected_input_types = this._wrapped_expected_input_types_function();
// 		const expected_output_types = this._wrapped_expected_output_types_function();

// 		const named_input_connection_points = expected_input_types.map((type: GlConnectionPointType, i: number) => {
// 			return new GlConnectionPoint(this._wrapped_input_name_function(i), type);
// 		});
// 		const named_output_connect_points = expected_output_types.map((type: GlConnectionPointType, i: number) => {
// 			return new GlConnectionPoint(this._wrapped_output_name_function(i), type);
// 		});

// 		this.node.io.inputs.setNamedInputConnectionPoints(named_input_connection_points);
// 		console.log(
// 			this.node.fullPath(),
// 			named_output_connect_points.map((cp) => cp.name)
// 		);
// 		this.node.io.outputs.setNamedOutputConnectionPoints(named_output_connect_points, set_dirty);
// 		this.node.spare_params_controller.create_spare_parameters();
// 	}

// 	protected _connections_match_inputs(): boolean {
// 		const current_input_types = this.node.io.inputs.namedInputConnectionPoints().map((c) => c.type);
// 		const current_output_types = this.node.io.outputs.namedOutputConnectionPoints().map((c) => c.type);
// 		const expected_input_types = this._wrapped_expected_input_types_function();
// 		const expected_output_types = this._wrapped_expected_output_types_function();

// 		if (expected_input_types.length != current_input_types.length) {
// 			return false;
// 		}
// 		if (expected_output_types.length != current_output_types.length) {
// 			return false;
// 		}

// 		for (let i = 0; i < current_input_types.length; i++) {
// 			if (current_input_types[i] != expected_input_types[i]) {
// 				return false;
// 			}
// 		}
// 		for (let i = 0; i < current_output_types.length; i++) {
// 			if (current_output_types[i] != expected_output_types[i]) {
// 				return false;
// 			}
// 		}

// 		return true;
// 	}

// 	//
// 	//
// 	// WRAPPPED METHOD
// 	// the goal here is to use the types data saved in the scene file
// 	// when the scene is loading. That has 2 purposes:
// 	// - avoid an update cascade during loading, where nodes with many inputs are updated
// 	//	 several times.
// 	// - allow the subnet_input to load with the connection_points it had on save,
// 	//   which in turn allows connected nodes to not lose their connections.
// 	//
// 	private _wrapped_expected_input_types_function() {
// 		if (this.node.scene.loading_controller.isLoading()) {
// 			const in_data = this.node.io.saved_connection_points_data.in();
// 			if (in_data) {
// 				return in_data.map((d) => d.type as GlConnectionPointType);
// 			}
// 		}
// 		return this._expected_input_types_function();
// 	}
// 	private _wrapped_expected_output_types_function() {
// 		if (this.node.scene.loading_controller.isLoading()) {
// 			const out_data = this.node.io.saved_connection_points_data.out();
// 			if (out_data) {
// 				console.log('out_data', this.node.fullPath(), out_data);
// 				return out_data.map((d) => d.type as GlConnectionPointType);
// 			}
// 		}
// 		return this._expected_output_types_function();
// 	}
// 	private _wrapped_input_name_function(index: number) {
// 		if (this.node.scene.loading_controller.isLoading()) {
// 			const in_data = this.node.io.saved_connection_points_data.in();
// 			if (in_data) {
// 				return in_data[index].name;
// 			}
// 		}
// 		return this._input_name_function(index);
// 	}
// 	private _wrapped_output_name_function(index: number) {
// 		if (this.node.scene.loading_controller.isLoading()) {
// 			const out_data = this.node.io.saved_connection_points_data.out();
// 			if (out_data) {
// 				return out_data[index].name;
// 			}
// 		}
// 		return this._output_name_function(index);
// 	}

// 	// protected input_connection_type() {
// 	// 	return this.first_input_connection_type();
// 	// }
// 	// protected output_connection_type() {
// 	// 	return this.first_input_connection_type();
// 	// }

// 	first_input_connection_type(): GlConnectionPointType | undefined {
// 		const connections = this.node.io.connections.input_connections();
// 		if (connections) {
// 			const first_connection = connections[0];
// 			if (first_connection) {
// 				return this.connection_point_type_from_connection(first_connection);
// 			}
// 		}
// 	}
// 	connection_point_from_connection(connection: TypedNodeConnection<NodeContext.GL>): BaseGlConnectionPoint {
// 		const node_src = connection.node_src;
// 		const output_index = connection.output_index;
// 		return node_src.io.outputs.namedOutputConnectionPoints()[output_index];
// 	}
// 	connection_point_type_from_connection(connection: TypedNodeConnection<NodeContext.GL>): GlConnectionPointType {
// 		const connection_point = this.connection_point_from_connection(connection);
// 		return connection_point.type;
// 	}
// 	connection_point_name_from_connection(connection: TypedNodeConnection<NodeContext.GL>): string {
// 		const connection_point = this.connection_point_from_connection(connection);
// 		return connection_point.name;
// 	}
// }
