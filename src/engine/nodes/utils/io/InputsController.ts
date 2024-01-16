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
import {isString} from '../../../../core/Type';
import {arrayShallowClone} from '../../../../core/ArrayUtils';

type OnUpdateHook = () => void;
type OnEvalSingleInputListen = () => Promise<void>;
const _existingInputIndices: number[] = [];
export interface SetInputsOptions {
	noExceptionOnInvalidInput?: boolean;
	ignoreLockedState?: boolean;
}

const MAX_INPUTS_COUNT_UNSET = 0;
export class NodeInputsController<NC extends NodeContext> {
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
		for (const graph_node of this._graphNodeInputs) {
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

	setDependsOnInputs(depends_on_inputs: boolean) {
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
		// we need to update the cloneRequiredState here,
		// in case the inputsCount changes
		this._updateCloneRequiredState();
	}
	private _singleInputIndexListenedTo: number | null = null;
	listenToSingleInputIndex(index: number) {
		this._singleInputIndexListenedTo = index;
	}
	private _onEnsureListenToSingleInputIndexUpdatedCallback: OnEvalSingleInputListen | undefined;
	onEnsureListenToSingleInputIndexUpdated(callback: OnEvalSingleInputListen) {
		this._onEnsureListenToSingleInputIndexUpdatedCallback = callback;
	}

	namedInputConnectionPointsByName(name: string): ConnectionPointTypeMap[NC] | undefined {
		if (this._named_input_connection_points) {
			for (const connection_point of this._named_input_connection_points) {
				if (connection_point && connection_point.name() == name) {
					return connection_point;
				}
			}
		}
	}

	setNamedInputConnectionPoints(newConnectionPoints: ConnectionPointTypeMap[NC][]) {
		this._has_named_inputs = true;

		const connectionPointsToKeep =
			this._named_input_connection_points?.filter((cp) => cp?.inNodeDefinition()) || [];

		// ensure names are unique
		const allNewConnectionPoints: ConnectionPointTypeMap[NC][] = arrayShallowClone(connectionPointsToKeep);
		const currentNames: Set<string> = new Set();
		for (const connectionPointToKeep of connectionPointsToKeep) {
			if (connectionPointToKeep) {
				currentNames.add(connectionPointToKeep.name());
			}
		}
		for (const newConnectionPoint of newConnectionPoints) {
			if (newConnectionPoint) {
				if (!currentNames.has(newConnectionPoint.name())) {
					currentNames.add(newConnectionPoint.name());
					allNewConnectionPoints.push(newConnectionPoint);
				}
			}
		}

		// disconnect if the number of inputs changes
		const connections = this.node.io.connections.inputConnections();
		if (connections) {
			for (const connection of connections) {
				if (connection) {
					// assume we only work with indices for now, not with connection point names
					// so we only need to check again the new max number of connection points.
					if (connection.inputIndex() >= allNewConnectionPoints.length) {
						connection.disconnect({setInput: true, ignoreLockedState: true});
					}
				}
			}
		}

		// update connections
		this._named_input_connection_points = allNewConnectionPoints;
		this.setMinCount(0);
		this.setMaxCount(this._named_input_connection_points.length);
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
	namedInputConnectionPoints(): ConnectionPointTypeMap[NC][] | undefined {
		return this._named_input_connection_points;
	}
	private _initGraphNodeInputs() {
		for (let i = 0; i < this._maxInputsCount; i++) {
			this._graphNodeInputs[i] = this._graphNodeInputs[i] || this._createGraphNodeInput(i);
		}
	}
	private _createGraphNodeInput(index: number): CoreGraphNode {
		const graphInputNode = new CoreGraphNode(this.node.scene(), `input_${index}`);
		this.graphNode().addGraphInput(graphInputNode, false);
		return graphInputNode;
	}
	graphNode() {
		return (this._graphNode = this._graphNode || this._createGraphNode());
	}
	private _createGraphNode() {
		const graphNode = new CoreGraphNode(this.node.scene(), 'inputs');
		this.node.addGraphInput(graphNode, false);
		return graphNode;
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

	isGraphNodeDirty() {
		// Update:
		// we cannot simply check if this._graphNode is dirty,
		// as with the following case:
		// a merge node has 2 nodes as input
		// both those nodes are set to dirty (without using the scene batching)
		// then
		// - the merge node with be set dirty a first time as the first input is made dirty.
		// - the merge node starts cooking
		// - the merge node is made dirty a second time
		// - the merge node completes its first cook, having only processed the new content of the first input
		// - when the merge node completes, it realises it needs to cook a second time, since it was made dirty after starting the cook
		// - but when it attempts to get the content of the second node, the .isAnyInputDirty returns false when it should return true
		// because this._graphNode is not dirty anymore
		// OR...
		// we can instead make sure that this._graphNode is only made un-dirty if all inputs are clean too.

		return this._graphNode?.isDirty() || false;
	}
	private _isAnyInputDirty() {
		// let anyDirty=false
		// const inputNodes = this.inputs()
		for (const input of this._inputs) {
			if (input && input.isDirty()) {
				return true;
			}
		}
		return false;
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
	containersWithoutEvaluation(target: Array<ContainerMap[NC] | null>) {
		target.length = 0;
		for (let i = 0; i < this._inputs.length; i++) {
			const inputNode = this._inputs[i];
			let container: ContainerMap[NC] | null = null;
			if (inputNode) {
				// container = (await inputNode.compute()) as ContainerMap[NC];
				// we do not need a promise using await here,
				// as we know that the input node is not dirty
				// therefore we can simply request the container
				// and only check if it is bypassed or not
				container = inputNode.containerController.containerUnlessBypassed() as ContainerMap[NC] | null;
			}
			target.push(container);
		}
		return target;
	}

	private _existingInputIndices(target: number[]) {
		target.length = 0;
		if (this._maxInputsCount > 0) {
			for (let i = 0; i < this._inputs.length; i++) {
				if (this._inputs[i]) {
					target.push(i);
				}
			}
		}
		return target;
	}

	async evalRequiredInputs(
		target: Array<ContainerMap[NC] | null | undefined>
	): Promise<Array<ContainerMap[NC] | null | undefined>> {
		target.length = 0;
		// let containers: Array<ContainerMap[NC] | null | undefined> = [];
		if (this.node.disposed() == true) {
			return target;
		}
		if (this._maxInputsCount > 0) {
			this._existingInputIndices(_existingInputIndices);
			if (_existingInputIndices.length < this._minInputsCount) {
				this.node.states.error.set('inputs are missing');
			} else {
				if (_existingInputIndices.length > 0) {
					if (this._onEnsureListenToSingleInputIndexUpdatedCallback) {
						await this._onEnsureListenToSingleInputIndexUpdatedCallback();
					}

					if (this._maxInputsCount == 1) {
						const container = await this.evalRequiredInput(0);
						target.push(container as ContainerMap[NC]);
					} else {
						const promises: Promise<ContainerMap[NC] | null>[] = [];
						if (this._singleInputIndexListenedTo != null) {
							promises.push(
								this.evalRequiredInput(this._singleInputIndexListenedTo) as Promise<ContainerMap[NC]>
							);
						} else {
							const lastExistingInputIndex = _existingInputIndices[_existingInputIndices.length - 1];
							// let input: BaseNodeByContextMap[NC] | null;
							for (let i = 0; i < this._inputs.length; i++) {
								const input = this._inputs[i];
								if (input) {
									// I tried here to only use a promise for dirty inputs,
									// but that messes up with the order
									// if (input.isDirty()) {
									// 	containers.push(input.containerController.container as ContainerMap[NC]);
									// } else {
									promises.push(this.evalRequiredInput(i) as Promise<ContainerMap[NC]>);
									// }
								} else {
									// we need to add an empty container,
									// for non connected inputs.
									// otherwise, if input 0 is not connected,
									// and input 1 is, then we get only 1 container
									// which appears to be from input 0
									if (i <= lastExistingInputIndex) {
										promises.push(undefined as any);
									}
								}
							}
						}

						const results = await Promise.all(promises);
						for (const result of results) {
							target.push(result);
						}
					}

					if (!this._isAnyInputDirty()) {
						this._graphNode?.removeDirtyState();
					}
				}
			}
		}
		return target;
	}

	async evalRequiredInput(inputIndex: number) {
		let container: ContainerMap[NC] | undefined = undefined;
		const inputNode = this.input(inputIndex);
		// if (input_node && !input_node.isDirty()) {
		// 	container = input_node.containerController.container as ContainerMap[NC] | null;
		// } else {
		// 	container = await this.node.containerController.requestInputContainer(input_index);
		// 	this._graph_node_inputs[input_index].removeDirtyState();
		// }
		if (inputNode) {
			container = (await inputNode.compute()) as ContainerMap[NC];
			this._graphNodeInputs[inputIndex].removeDirtyState();
		}

		// we do not clone here, as we just check if a group is present
		if (container && container.coreContent()) {
			// return container;
		} else {
			// const input_node = this.input(input_index);
			if (inputNode) {
				const inputErrorMessage = inputNode.states.error.message();
				if (inputErrorMessage && this.node.disposed() == false) {
					this.node.states.error.set(`input ${inputIndex} is invalid (error: ${inputErrorMessage})`);
				}
			}
		}
		return container;
	}

	getNamedInputIndex(name: string): number {
		if (this._named_input_connection_points) {
			for (let i = 0; i < this._named_input_connection_points.length; i++) {
				if (this._named_input_connection_points[i]?.name() == name) {
					return i;
				}
			}
		}
		return -1;
	}
	getInputIndex(input_index_or_name: number | string): number {
		if (isString(input_index_or_name)) {
			if (this.hasNamedInputs()) {
				return this.getNamedInputIndex(input_index_or_name);
			} else {
				throw new Error(`node ${this.node.path()} has no named inputs`);
			}
		} else {
			return input_index_or_name;
		}
	}

	setInput(
		inputIndexOrName: number | string,
		node: BaseNodeByContextMap[NC] | null,
		outputIndexOrName?: number | string,
		options?: Readonly<SetInputsOptions>
	) {
		const ignoreLockedState = options?.ignoreLockedState || false;
		if (ignoreLockedState == false && this.node.insideALockedParent()) {
			const lockedParent = this.node.lockedParent();
			console.warn(
				`node '${this.node.path()}' cannot have its inputs changed, since it is inside '${
					lockedParent ? lockedParent.path() : ''
				}', which is locked`
			);
			return;
		}

		if (outputIndexOrName == null) {
			outputIndexOrName = 0;
		}
		const noExceptionOnInvalidInput = options?.noExceptionOnInvalidInput || false;
		const inputIndex = this.getInputIndex(inputIndexOrName) || 0;
		if (inputIndex < 0) {
			const message = `invalid input (${inputIndexOrName}) for node ${this.node.path()}`;
			if (!noExceptionOnInvalidInput) {
				console.warn(message);
				throw new Error(message);
			} else {
				return;
			}
		}

		let outputIndex = 0;
		if (node) {
			if (node.io.outputs.hasNamedOutputs()) {
				outputIndex = node.io.outputs.getOutputIndex(outputIndexOrName);
				if (outputIndex == null || outputIndex < 0) {
					const connection_points = node.io.outputs.namedOutputConnectionPoints() as
						| BaseConnectionPoint[]
						| undefined;
					const names: string[] = connection_points ? connection_points.map((cp) => cp.name()) : [];
					console.warn(
						`node ${node.path()} does not have an output named ${outputIndexOrName}. inputs are: ${names.join(
							', '
						)}`
					);
					return;
				}
			}
			// check that parents exists and are the same

			const nodeParent = node.parent();
			const currentNodeParent = this.node.parent();
			if (!(nodeParent && currentNodeParent && nodeParent.graphNodeId() == currentNodeParent.graphNodeId())) {
				console.warn(`node ${node.path()} does not have the same parent as ${this.node.path()}`);
				return;
			}
		}

		const graphInputNode = this._graphNodeInputs[inputIndex];
		if (graphInputNode == null) {
			const message = `no input at index ${inputIndex} (name: ${inputIndexOrName}) for node '${this.node.name()}' at path '${this.node.path()}'`;
			console.warn(message);
			throw new Error(message);
		}

		if (node && this.node.parent() != node.parent()) {
			return;
		}

		const oldInputNode = this._inputs[inputIndex];
		let oldOutputIndex: number | null = null;
		let oldConnection: TypedNodeConnection<NC> | undefined = undefined;
		if (this.node.io.connections) {
			oldConnection = this.node.io.connections.inputConnection(inputIndex);
		}
		if (oldConnection) {
			oldOutputIndex = oldConnection.outputIndex();
		}

		if (node !== oldInputNode || outputIndex != oldOutputIndex) {
			// TODO: test: add test to make sure this is necessary
			if (oldInputNode != null) {
				if (this._depends_on_inputs) {
					graphInputNode.removeGraphInput(oldInputNode);
				}
			}

			if (node != null) {
				const connectionResult = graphInputNode.addGraphInput(node);
				if (connectionResult) {
					// we do test if we can create the graph connection
					// to ensure we are not in a cyclical graph,
					// but we delete it right after
					if (!this._depends_on_inputs) {
						graphInputNode.removeGraphInput(node);
					}

					// this._input_connections[input_index] = new NodeConnection(node, this.self, outputIndex, input_index);
					if (oldConnection) {
						oldConnection.disconnect({setInput: false});
					}
					this._inputs[inputIndex] = node;
					new TypedNodeConnection<NC>(
						(<unknown>node) as TypedNode<NC, any>,
						this.node,
						outputIndex,
						inputIndex
					);
				} else {
					console.warn(`cannot connect ${node.path()} to ${this.node.path()}`);
				}
			} else {
				this._inputs[inputIndex] = null;
				if (oldConnection) {
					oldConnection.disconnect({setInput: false});
				}
				// this._input_connections[input_index] = null;
			}

			this._run_on_set_input_hooks();
			graphInputNode.setSuccessorsDirty();
			// this.node.set_dirty(node);
			this.node.emit(NodeEvent.INPUTS_UPDATED);
		}
	}

	// remove_input(node: BaseNodeByContextMap[NC]) {
	// 	const inputs = this.inputs();
	// 	let input: BaseNodeByContextMap[NC] | null;
	// 	for (let i = 0; i < inputs.length; i++) {
	// 		input = inputs[i];
	// 		if (input != null && node != null) {
	// 			if (input.graphNodeId() === node.graphNodeId()) {
	// 				this.setInput(i, null);
	// 			}
	// 		}
	// 	}
	// }

	input(input_index: number): BaseNodeByContextMap[NC] | null {
		return this._inputs[input_index];
	}
	named_input(input_name: string): BaseNodeByContextMap[NC] | null {
		if (this.hasNamedInputs()) {
			const input_index = this.getInputIndex(input_name);
			return this._inputs[input_index];
		} else {
			return null;
		}
	}
	named_input_connection_point(input_name: string): ConnectionPointTypeMap[NC] | undefined {
		if (this.hasNamedInputs() && this._named_input_connection_points) {
			const input_index = this.getInputIndex(input_name);
			return this._named_input_connection_points[input_index];
		}
	}
	has_named_input(name: string): boolean {
		return this.getNamedInputIndex(name) >= 0;
	}
	hasInput(input_index: number): boolean {
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
	private _updateCloneRequiredState() {
		this._clonedStatesController?.updateCloneRequiredState();
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
			for (const hook of this._on_update_hooks) {
				hook();
			}
		}
	}
}
