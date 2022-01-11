import {TypedNodeConnection} from './NodeConnection';
import {CoreGraphNode} from '../../../../core/graph/CoreGraphNode';
import {NodeEvent} from '../../../poly/NodeEvent';
import {BaseNodeByContextMap, NodeContext} from '../../../poly/NodeContext';
import {ConnectionPointTypeMap} from './connections/ConnectionMap';
import {TypedNode} from '../../_Base';
import {ContainerMap} from '../../../containers/utils/ContainerMap';
import {ClonedStatesController} from './utils/ClonedStatesController';
import {InputCloneMode} from '../../../poly/InputCloneMode';
import {BaseConnectionPoint} from './connections/_Base';
import {CoreType} from '../../../../core/Type';

type OnUpdateHook = () => void;

const MAX_INPUTS_COUNT_UNSET = 0;
export class InputsController<NC extends NodeContext> {
	private _graphNode: CoreGraphNode | undefined;
	private _graphNodeInputs: CoreGraphNode[] = [];
	private _inputs: Array<BaseNodeByContextMap[NC] | null> = [];
	private _has_named_inputs: boolean = false;
	private _named_input_connection_points: ConnectionPointTypeMap[NC][] | undefined;
	private _minInputsCount: number = 0;
	private _maxInputsCount: number = MAX_INPUTS_COUNT_UNSET;
	private _maxInputsCountOnInput: number = MAX_INPUTS_COUNT_UNSET;
	private _depends_on_inputs: boolean = true;

	// hooks
	private _on_update_hooks: OnUpdateHook[] | undefined;
	private _on_update_hook_names: string[] | undefined;

	// clonable

	dispose() {
		if (this._graphNode) {
			this._graphNode.dispose();
		}
		for (let graph_node of this._graphNodeInputs) {
			if (graph_node) {
				graph_node.dispose();
			}
		}
		// hooks
		this._on_update_hooks = undefined;
		this._on_update_hook_names = undefined;
	}

	// private _user_inputs_clonable_states: InputCloneMode[] | undefined;
	// private _inputs_clonable_states: InputCloneMode[] | undefined;
	// private _inputs_cloned_state: boolean[] = [];
	// private _override_clonable_state: boolean = false;

	constructor(public node: TypedNode<NC, any>) {}

	set_depends_on_inputs(depends_on_inputs: boolean) {
		this._depends_on_inputs = depends_on_inputs;
	}
	private setMinCount(minInputsCount: number) {
		this._minInputsCount = minInputsCount;
	}
	minCount() {
		return this._minInputsCount;
	}

	private setMaxCount(maxInputsCount: number) {
		if (this._maxInputsCount == MAX_INPUTS_COUNT_UNSET) {
			this._maxInputsCountOnInput = maxInputsCount;
		}
		this._maxInputsCount = maxInputsCount;
		this._initGraphNodeInputs();
	}

	namedInputConnectionPointsByName(name: string): ConnectionPointTypeMap[NC] | undefined {
		if (this._named_input_connection_points) {
			for (let connection_point of this._named_input_connection_points) {
				if (connection_point && connection_point.name() == name) {
					return connection_point;
				}
			}
		}
	}

	setNamedInputConnectionPoints(connection_points: ConnectionPointTypeMap[NC][]) {
		this._has_named_inputs = true;

		const connections = this.node.io.connections.inputConnections();
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
		this.setMinCount(0);
		this.setMaxCount(connection_points.length);
		this._initGraphNodeInputs();
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

	hasNamedInputs() {
		return this._has_named_inputs;
	}
	namedInputConnectionPoints(): ConnectionPointTypeMap[NC][] {
		return this._named_input_connection_points || [];
	}
	private _initGraphNodeInputs() {
		for (let i = 0; i < this._maxInputsCount; i++) {
			this._graphNodeInputs[i] = this._graphNodeInputs[i] || this._createGraphNodeInput(i);
		}
	}
	private _createGraphNodeInput(index: number): CoreGraphNode {
		const graph_input_node = new CoreGraphNode(this.node.scene(), `input_${index}`);
		// graph_input_node.setScene(this.node.scene);
		if (!this._graphNode) {
			this._graphNode = new CoreGraphNode(this.node.scene(), 'inputs');
			this.node.addGraphInput(this._graphNode, false);
		}

		this._graphNode.addGraphInput(graph_input_node, false);
		return graph_input_node;
	}

	maxInputsCount(): number {
		return this._maxInputsCount || 0;
	}
	maxInputsCountOverriden(): boolean {
		return this._maxInputsCount != this._maxInputsCountOnInput;
	}
	inputGraphNode(input_index: number): CoreGraphNode {
		return this._graphNodeInputs[input_index];
	}

	setCount(min: number, max?: number) {
		if (max == null) {
			max = min;
		}
		this.setMinCount(min);
		this.setMaxCount(max);

		// this._clonable_states_controller.init_inputs_clonable_state();
		this._initConnectionControllerInputs();
	}
	private _initConnectionControllerInputs() {
		this.node.io.connections.initInputs();
	}

	isAnyInputDirty() {
		return this._graphNode?.isDirty() || false;
		// if (this._maxInputsCount > 0) {
		// 	for (let i = 0; i < this._inputs.length; i++) {
		// 		if (this._inputs[i]?.isDirty()) {
		// 			return true;
		// 		}
		// 	}
		// } else {
		// 	return false;
		// }
	}
	containersWithoutEvaluation() {
		const containers: Array<ContainerMap[NC] | undefined> = [];
		for (let i = 0; i < this._inputs.length; i++) {
			const inputNode = this._inputs[i];
			let container: ContainerMap[NC] | undefined = undefined;
			if (inputNode) {
				// container = (await inputNode.compute()) as ContainerMap[NC];
				// we do not need a promise using await here,
				// as we know that the input node is not dirty
				// therefore we can simply request the container
				// and only check if it is bypassed or not
				container = inputNode.containerController.containerUnlessBypassed() as ContainerMap[NC] | undefined;
			}
			containers.push(container);
		}
		return containers;
	}

	private _existingInputIndices() {
		const existing_input_indices: number[] = [];
		if (this._maxInputsCount > 0) {
			for (let i = 0; i < this._inputs.length; i++) {
				if (this._inputs[i]) {
					existing_input_indices.push(i);
				}
			}
		}
		return existing_input_indices;
	}

	async evalRequiredInputs() {
		let containers: Array<ContainerMap[NC] | null | undefined> = [];
		if (this._maxInputsCount > 0) {
			const existing_input_indices = this._existingInputIndices();
			if (existing_input_indices.length < this._minInputsCount) {
				this.node.states.error.set('inputs are missing');
			} else {
				if (existing_input_indices.length > 0) {
					const promises: Promise<ContainerMap[NC] | null>[] = [];
					let input: BaseNodeByContextMap[NC] | null;
					for (let i = 0; i < this._inputs.length; i++) {
						input = this._inputs[i];
						if (input) {
							// I tried here to only use a promise for dirty inputs,
							// but that messes up with the order
							// if (input.isDirty()) {
							// 	containers.push(input.containerController.container as ContainerMap[NC]);
							// } else {
							promises.push(this.evalRequiredInput(i) as Promise<ContainerMap[NC]>);
							// }
						}
					}
					containers = await Promise.all(promises);
					// containers = containers.concat(promised_containers);
					this._graphNode?.removeDirtyState();
				}
			}
		}
		return containers;
	}

	async evalRequiredInput(input_index: number) {
		let container: ContainerMap[NC] | undefined = undefined;
		const input_node = this.input(input_index);
		// if (input_node && !input_node.isDirty()) {
		// 	container = input_node.containerController.container as ContainerMap[NC] | null;
		// } else {
		// 	container = await this.node.containerController.requestInputContainer(input_index);
		// 	this._graph_node_inputs[input_index].removeDirtyState();
		// }
		if (input_node) {
			container = (await input_node.compute()) as ContainerMap[NC];
			this._graphNodeInputs[input_index].removeDirtyState();
		}

		// we do not clone here, as we just check if a group is present
		if (container && container.coreContent()) {
			// return container;
		} else {
			const input_node = this.input(input_index);
			if (input_node) {
				const input_error_message = input_node.states.error.message();
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
				if (this._named_input_connection_points[i]?.name() == name) {
					return i;
				}
			}
		}
		return -1;
	}
	get_input_index(input_index_or_name: number | string): number {
		if (CoreType.isString(input_index_or_name)) {
			if (this.hasNamedInputs()) {
				return this.get_named_input_index(input_index_or_name);
			} else {
				throw new Error(`node ${this.node.path()} has no named inputs`);
			}
		} else {
			return input_index_or_name;
		}
	}

	setInput(
		input_index_or_name: number | string,
		node: BaseNodeByContextMap[NC] | null,
		output_index_or_name: number | string = 0
	) {
		const input_index = this.get_input_index(input_index_or_name) || 0;
		if (input_index < 0) {
			const message = `invalid input (${input_index_or_name}) for node ${this.node.path()}`;
			console.warn(message);
			throw new Error(message);
		}

		let output_index = 0;
		if (node) {
			if (node.io.outputs.hasNamedOutputs()) {
				output_index = node.io.outputs.getOutputIndex(output_index_or_name);
				if (output_index == null || output_index < 0) {
					const connection_points = node.io.outputs.namedOutputConnectionPoints() as BaseConnectionPoint[];
					const names = connection_points.map((cp) => cp.name());
					console.warn(
						`node ${node.path()} does not have an output named ${output_index_or_name}. inputs are: ${names.join(
							', '
						)}`
					);
					return;
				}
			}
		}

		const graph_input_node = this._graphNodeInputs[input_index];
		if (graph_input_node == null) {
			const message = `graph_input_node not found at index ${input_index}`;
			console.warn(message);
			throw new Error(message);
		}

		if (node && this.node.parent() != node.parent()) {
			return;
		}

		const old_input_node = this._inputs[input_index];
		let old_output_index: number | null = null;
		let old_connection: TypedNodeConnection<NC> | undefined = undefined;
		if (this.node.io.connections) {
			old_connection = this.node.io.connections.inputConnection(input_index);
		}
		if (old_connection) {
			old_output_index = old_connection.output_index;
		}

		if (node !== old_input_node || output_index != old_output_index) {
			// TODO: test: add test to make sure this is necessary
			if (old_input_node != null) {
				if (this._depends_on_inputs) {
					graph_input_node.removeGraphInput(old_input_node);
				}
			}

			if (node != null) {
				if (graph_input_node.addGraphInput(node)) {
					// we do test if we can create the graph connection
					// to ensure we are not in a cyclical graph,
					// but we delete it right after
					if (!this._depends_on_inputs) {
						graph_input_node.removeGraphInput(node);
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
					console.warn(`cannot connect ${node.path()} to ${this.node.path()}`);
				}
			} else {
				this._inputs[input_index] = null;
				if (old_connection) {
					old_connection.disconnect({setInput: false});
				}
				// this._input_connections[input_index] = null;
			}

			this._run_on_set_input_hooks();
			graph_input_node.setSuccessorsDirty();
			// this.node.set_dirty(node);
			this.node.emit(NodeEvent.INPUTS_UPDATED);
		}
	}

	remove_input(node: BaseNodeByContextMap[NC]) {
		const inputs = this.inputs();
		let input: BaseNodeByContextMap[NC] | null;
		for (let i = 0; i < inputs.length; i++) {
			input = inputs[i];
			if (input != null && node != null) {
				if (input.graphNodeId() === node.graphNodeId()) {
					this.setInput(i, null);
				}
			}
		}
	}

	input(input_index: number): BaseNodeByContextMap[NC] | null {
		return this._inputs[input_index];
	}
	named_input(input_name: string): BaseNodeByContextMap[NC] | null {
		if (this.hasNamedInputs()) {
			const input_index = this.get_input_index(input_name);
			return this._inputs[input_index];
		} else {
			return null;
		}
	}
	named_input_connection_point(input_name: string): ConnectionPointTypeMap[NC] | undefined {
		if (this.hasNamedInputs() && this._named_input_connection_points) {
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
	private _clonedStatesController: ClonedStatesController<NC> | undefined;
	initInputsClonedState(states: InputCloneMode | InputCloneMode[]) {
		if (!this._clonedStatesController) {
			this._clonedStatesController = new ClonedStatesController(this);
			this._clonedStatesController.initInputsClonedState(states);
		}
	}
	overrideClonedStateAllowed(): boolean {
		return this._clonedStatesController?.overrideClonedStateAllowed() || false;
	}
	overrideClonedState(state: boolean) {
		this._clonedStatesController?.overrideClonedState(state);
	}
	clonedStateOverriden() {
		return this._clonedStatesController?.overriden() || false;
	}
	cloneRequired(index: number) {
		const state = this._clonedStatesController?.cloneRequiredState(index);
		if (state != null) {
			return state;
		}
		return true;
	}
	cloneRequiredStates(): boolean | boolean[] {
		const states = this._clonedStatesController?.cloneRequiredStates();
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
