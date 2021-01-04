import {TypedNodeConnection} from './NodeConnection';
import {CoreGraphNode} from '../../../../core/graph/CoreGraphNode';
import {NodeEvent} from '../../../poly/NodeEvent';
import {NodeContext} from '../../../poly/NodeContext';
import {ConnectionPointTypeMap} from './connections/ConnectionMap';
import {TypedNode} from '../../_Base';
import {ContainerMap, NodeTypeMap} from '../../../containers/utils/ContainerMap';
import {ClonedStatesController} from './utils/ClonedStatesController';
import {InputCloneMode} from '../../../poly/InputCloneMode';
import {BaseConnectionPoint} from './connections/_Base';
import {CoreType} from '../../../../core/Type';

type OnUpdateHook = () => void;

export class InputsController<NC extends NodeContext> {
	private _graph_node: CoreGraphNode | undefined;
	private _graph_node_inputs: CoreGraphNode[] = [];
	private _inputs: Array<NodeTypeMap[NC] | null> = [];
	private _has_named_inputs: boolean = false;
	private _named_input_connection_points: ConnectionPointTypeMap[NC][] | undefined;
	private _min_inputs_count: number = 0;
	private _max_inputs_count: number = 0;
	private _depends_on_inputs: boolean = true;

	// hooks
	private _on_update_hooks: OnUpdateHook[] | undefined;
	private _on_update_hook_names: string[] | undefined;

	// clonable

	// private _user_inputs_clonable_states: InputCloneMode[] | undefined;
	// private _inputs_clonable_states: InputCloneMode[] | undefined;
	// private _inputs_cloned_state: boolean[] = [];
	// private _override_clonable_state: boolean = false;

	constructor(public node: TypedNode<NC, any>) {}

	set_depends_on_inputs(depends_on_inputs: boolean) {
		this._depends_on_inputs = depends_on_inputs;
	}
	private set_min_inputs_count(min_inputs_count: number) {
		this._min_inputs_count = min_inputs_count;
	}

	private set_max_inputs_count(max_inputs_count: number) {
		this._max_inputs_count = max_inputs_count;
		this.init_graph_node_inputs();
	}

	named_input_connection_points_by_name(name: string): ConnectionPointTypeMap[NC] | undefined {
		if (this._named_input_connection_points) {
			for (let connection_point of this._named_input_connection_points) {
				if (connection_point && connection_point.name == name) {
					return connection_point;
				}
			}
		}
	}

	set_named_input_connection_points(connection_points: ConnectionPointTypeMap[NC][]) {
		this._has_named_inputs = true;

		const connections = this.node.io.connections.input_connections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					// assume we only work with indices for now, not with connection point names
					// so we only need to check again the new max number of connection points.
					if (connection.input_index >= connection_points.length) {
						connection.disconnect({setInput: true});
					}
				}
			}
		}

		// update connections
		this._named_input_connection_points = connection_points;
		this.set_min_inputs_count(0);
		this.set_max_inputs_count(connection_points.length);
		this.init_graph_node_inputs();
		this.node.emit(NodeEvent.NAMED_INPUTS_UPDATED);
	}
	// private _has_connected_inputs() {
	// 	for (let input of this._inputs) {
	// 		if (input != null) {
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// }

	// private _check_name_changed(connection_points: ConnectionPointTypeMap[NC][]) {
	// 	if (this._named_input_connection_points) {
	// 		if (this._named_input_connection_points.length != connection_points.length) {
	// 			return true;
	// 		} else {
	// 			for (let i = 0; i < this._named_input_connection_points.length; i++) {
	// 				if (this._named_input_connection_points[i]?.name != connection_points[i]?.name) {
	// 					return true;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return false;
	// }

	get has_named_inputs() {
		return this._has_named_inputs;
	}
	get named_input_connection_points(): ConnectionPointTypeMap[NC][] {
		return this._named_input_connection_points || [];
	}
	private init_graph_node_inputs() {
		for (let i = 0; i < this._max_inputs_count; i++) {
			this._graph_node_inputs[i] = this._graph_node_inputs[i] || this._create_graph_node_input(i);
		}
	}
	private _create_graph_node_input(index: number): CoreGraphNode {
		const graph_input_node = new CoreGraphNode(this.node.scene, `input_${index}`);
		// graph_input_node.set_scene(this.node.scene);
		if (!this._graph_node) {
			this._graph_node = new CoreGraphNode(this.node.scene, 'inputs');
			this.node.add_graph_input(this._graph_node, false);
		}

		this._graph_node.add_graph_input(graph_input_node, false);
		return graph_input_node;
	}

	get max_inputs_count(): number {
		return this._max_inputs_count || 0;
	}
	input_graph_node(input_index: number): CoreGraphNode {
		return this._graph_node_inputs[input_index];
	}

	set_count(min: number, max?: number) {
		if (max == null) {
			max = min;
		}
		this.set_min_inputs_count(min);
		this.set_max_inputs_count(max);

		// this._clonable_states_controller.init_inputs_clonable_state();
		this.init_connections_controller_inputs();
	}
	private init_connections_controller_inputs() {
		this.node.io.connections.init_inputs();
	}

	is_any_input_dirty() {
		return this._graph_node?.is_dirty || false;
		// if (this._max_inputs_count > 0) {
		// 	for (let i = 0; i < this._inputs.length; i++) {
		// 		if (this._inputs[i]?.is_dirty) {
		// 			return true;
		// 		}
		// 	}
		// } else {
		// 	return false;
		// }
	}
	async containers_without_evaluation() {
		const containers: Array<ContainerMap[NC] | undefined> = [];
		for (let i = 0; i < this._inputs.length; i++) {
			const input_node = this._inputs[i];
			let container: ContainerMap[NC] | undefined = undefined;
			if (input_node) {
				container = (await input_node.requestContainer()) as ContainerMap[NC];
			}
			containers.push(container);
		}
		return containers;
	}

	existing_input_indices() {
		const existing_input_indices: number[] = [];
		if (this._max_inputs_count > 0) {
			for (let i = 0; i < this._inputs.length; i++) {
				if (this._inputs[i]) {
					existing_input_indices.push(i);
				}
			}
		}
		return existing_input_indices;
	}

	async eval_required_inputs() {
		let containers: Array<ContainerMap[NC] | null | undefined> = [];
		if (this._max_inputs_count > 0) {
			const existing_input_indices = this.existing_input_indices();
			if (existing_input_indices.length < this._min_inputs_count) {
				this.node.states.error.set('inputs are missing');
			} else {
				if (existing_input_indices.length > 0) {
					const promises: Promise<ContainerMap[NC] | null>[] = [];
					let input: NodeTypeMap[NC] | null;
					for (let i = 0; i < this._inputs.length; i++) {
						input = this._inputs[i];
						if (input) {
							// I tried here to only use a promise for dirty inputs,
							// but that messes up with the order
							// if (input.is_dirty) {
							// 	containers.push(input.container_controller.container as ContainerMap[NC]);
							// } else {
							promises.push(this.eval_required_input(i) as Promise<ContainerMap[NC]>);
							// }
						}
					}
					containers = await Promise.all(promises);
					// containers = containers.concat(promised_containers);
					this._graph_node?.remove_dirty_state();
				}
			}
		}
		return containers;
	}

	async eval_required_input(input_index: number) {
		let container: ContainerMap[NC] | undefined = undefined;
		const input_node = this.input(input_index);
		// if (input_node && !input_node.is_dirty) {
		// 	container = input_node.container_controller.container as ContainerMap[NC] | null;
		// } else {
		// 	container = await this.node.container_controller.requestInputContainer(input_index);
		// 	this._graph_node_inputs[input_index].remove_dirty_state();
		// }
		if (input_node) {
			container = (await input_node.requestContainer()) as ContainerMap[NC];
			this._graph_node_inputs[input_index].remove_dirty_state();
		}

		// we do not clone here, as we just check if a group is present
		if (container && container.coreContent()) {
			// return container;
		} else {
			const input_node = this.input(input_index);
			if (input_node) {
				const input_error_message = input_node.states.error.message;
				if (input_error_message) {
					this.node.states.error.set(`input ${input_index} is invalid (error: ${input_error_message})`);
				}
			}
		}
		return container;
	}

	get_named_input_index(name: string): number {
		if (this._named_input_connection_points) {
			for (let i = 0; i < this._named_input_connection_points.length; i++) {
				if (this._named_input_connection_points[i]?.name == name) {
					return i;
				}
			}
		}
		return -1;
	}
	get_input_index(input_index_or_name: number | string): number {
		if (CoreType.isString(input_index_or_name)) {
			if (this.has_named_inputs) {
				return this.get_named_input_index(input_index_or_name);
			} else {
				throw new Error(`node ${this.node.fullPath()} has no named inputs`);
			}
		} else {
			return input_index_or_name;
		}
	}

	setInput(
		input_index_or_name: number | string,
		node: NodeTypeMap[NC] | null,
		output_index_or_name: number | string = 0
	) {
		const input_index = this.get_input_index(input_index_or_name) || 0;
		if (input_index < 0) {
			const message = `invalid input (${input_index_or_name}) for node ${this.node.fullPath()}`;
			console.warn(message);
			throw new Error(message);
		}

		let output_index = 0;
		if (node) {
			if (node.io.outputs.has_named_outputs) {
				output_index = node.io.outputs.get_output_index(output_index_or_name);
				if (output_index == null || output_index < 0) {
					const connection_points = node.io.outputs.named_output_connection_points as BaseConnectionPoint[];
					const names = connection_points.map((cp) => cp.name);
					console.warn(
						`node ${node.fullPath()} does not have an output named ${output_index_or_name}. inputs are: ${names.join(
							', '
						)}`
					);
					return;
				}
			}
		}

		const graph_input_node = this._graph_node_inputs[input_index];
		if (graph_input_node == null) {
			const message = `graph_input_node not found at index ${input_index}`;
			console.warn(message);
			throw new Error(message);
		}

		if (node && this.node.parent != node.parent) {
			return;
		}

		const old_input_node = this._inputs[input_index];
		let old_output_index: number | null = null;
		let old_connection: TypedNodeConnection<NC> | undefined = undefined;
		if (this.node.io.connections) {
			old_connection = this.node.io.connections.input_connection(input_index);
		}
		if (old_connection) {
			old_output_index = old_connection.output_index;
		}

		if (node !== old_input_node || output_index != old_output_index) {
			// TODO: test: add test to make sure this is necessary
			if (old_input_node != null) {
				if (this._depends_on_inputs) {
					graph_input_node.remove_graph_input(old_input_node);
				}
			}

			if (node != null) {
				if (graph_input_node.add_graph_input(node)) {
					// we do test if we can create the graph connection
					// to ensure we are not in a cyclical graph,
					// but we delete it right after
					if (!this._depends_on_inputs) {
						graph_input_node.remove_graph_input(node);
					}

					//this._input_connections[input_index] = new NodeConnection(node, this.self, output_index, input_index);
					if (old_connection) {
						old_connection.disconnect({setInput: false});
					}
					this._inputs[input_index] = node;
					new TypedNodeConnection<NC>(
						(<unknown>node) as TypedNode<NC, any>,
						this.node,
						output_index,
						input_index
					);
				} else {
					console.warn(`cannot connect ${node.fullPath()} to ${this.node.fullPath()}`);
				}
			} else {
				this._inputs[input_index] = null;
				if (old_connection) {
					old_connection.disconnect({setInput: false});
				}
				// this._input_connections[input_index] = null;
			}

			this._run_on_set_input_hooks();
			graph_input_node.set_successors_dirty();
			// this.node.set_dirty(node);
			this.node.emit(NodeEvent.INPUTS_UPDATED);
		}
	}

	remove_input(node: NodeTypeMap[NC]) {
		const inputs = this.inputs();
		let input: NodeTypeMap[NC] | null;
		for (let i = 0; i < inputs.length; i++) {
			input = inputs[i];
			if (input != null && node != null) {
				if (input.graph_node_id === node.graph_node_id) {
					this.setInput(i, null);
				}
			}
		}
	}

	input(input_index: number): NodeTypeMap[NC] | null {
		return this._inputs[input_index];
	}
	named_input(input_name: string): NodeTypeMap[NC] | null {
		if (this.has_named_inputs) {
			const input_index = this.get_input_index(input_name);
			return this._inputs[input_index];
		} else {
			return null;
		}
	}
	named_input_connection_point(input_name: string): ConnectionPointTypeMap[NC] | undefined {
		if (this.has_named_inputs && this._named_input_connection_points) {
			const input_index = this.get_input_index(input_name);
			return this._named_input_connection_points[input_index];
		}
	}
	has_named_input(name: string): boolean {
		return this.get_named_input_index(name) >= 0;
	}
	has_input(input_index: number): boolean {
		return this._inputs[input_index] != null;
	}
	inputs() {
		return this._inputs;
	}

	//
	//
	// CLONABLE STATES
	//
	//
	private _cloned_states_controller: ClonedStatesController<NC> | undefined;
	init_inputs_cloned_state(states: InputCloneMode | InputCloneMode[]) {
		if (!this._cloned_states_controller) {
			this._cloned_states_controller = new ClonedStatesController(this);
			this._cloned_states_controller.init_inputs_cloned_state(states);
		}
	}
	override_cloned_state_allowed(): boolean {
		return this._cloned_states_controller?.override_cloned_state_allowed() || false;
	}
	override_cloned_state(state: boolean) {
		this._cloned_states_controller?.override_cloned_state(state);
	}
	cloned_state_overriden() {
		return this._cloned_states_controller?.overriden() || false;
	}
	clone_required(index: number) {
		const state = this._cloned_states_controller?.clone_required_state(index);
		if (state != null) {
			return state;
		}
		return true;
	}
	clone_required_states(): boolean | boolean[] {
		const states = this._cloned_states_controller?.clone_required_states();
		if (states != null) {
			return states;
		}
		return true;
	}

	//
	//
	// HOOKS
	//
	//
	add_on_set_input_hook(name: string, hook: OnUpdateHook) {
		this._on_update_hooks = this._on_update_hooks || [];
		this._on_update_hook_names = this._on_update_hook_names || [];

		if (!this._on_update_hook_names.includes(name)) {
			this._on_update_hooks.push(hook);
			this._on_update_hook_names.push(name);
		} else {
			console.warn(`hook with name ${name} already exists`, this.node);
		}
	}
	private _run_on_set_input_hooks() {
		if (this._on_update_hooks) {
			for (let hook of this._on_update_hooks) {
				hook();
			}
		}
	}
}
