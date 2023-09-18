import {PolyScene} from '../../engine/scene/PolyScene';
import {CallbacksTriggerController} from './CallbacksTriggerController';
import {CoreGraphNode} from './CoreGraphNode';
import {isArray} from '../Type';
import {addToSetAtEntry} from '../MapUtils';

export type CoreGraphNodeId = number;
interface NodesData {
	idsSet: Set<number>;
	idsArray: number[];
	nodes: CoreGraphNode[];
}

type TraverseCallback = (id: CoreGraphNodeId) => CoreGraphNodeId[] | undefined;
// const _graphNodes: CoreGraphNode[] = [];
const _idStack: number[] = [];
const _idsSet: Set<number> = new Set();
export class CoreGraph {
	private _nextId: CoreGraphNodeId = 0;
	private _scene: PolyScene | undefined;
	private _successors: Map<CoreGraphNodeId, NodesData> = new Map();
	private _predecessors: Map<CoreGraphNodeId, NodesData> = new Map();
	private _nodesById: Map<number, CoreGraphNode> = new Map();
	private _forbiddenTriggerNodeIds: Map<CoreGraphNodeId, Set<CoreGraphNodeId>> = new Map();
	private _selfDirtyForbidden: Set<CoreGraphNodeId> = new Set();
	private _nodesCount = 0;
	public readonly callbacksTriggerController = new CallbacksTriggerController(this);

	private _debugging = false;
	private _addedNodesDuringDebugging: Map<CoreGraphNodeId, CoreGraphNode> = new Map();
	startDebugging() {
		this._debugging = true;
	}
	stopDebugging() {
		this._debugging = false;
	}
	printDebug() {
		this._addedNodesDuringDebugging.forEach((node, nodeId) => {
			console.log(nodeId, node, node.graphPredecessors(), node.graphSuccessors());
		});
	}

	setScene(scene: PolyScene) {
		this._scene = scene;
	}
	scene() {
		return this._scene;
	}

	nextId(): CoreGraphNodeId {
		this._nextId += 1;
		return this._nextId;
	}

	nodesFromIds(ids: number[], target: CoreGraphNode[]): void {
		target.length = 0;
		for (const id of ids) {
			const node = this.nodeFromId(id);
			if (node) {
				target.push(node);
			}
		}
	}
	nodeFromId(id: number): CoreGraphNode | undefined {
		return this._nodesById.get(id);
	}
	hasNode(node: CoreGraphNode): boolean {
		return this._nodesById.get(node.graphNodeId()) != null;
	}
	addNode(node: CoreGraphNode) {
		this._nodesById.set(node.graphNodeId(), node);
		this._nodesCount += 1;
		if (this._debugging) {
			this._addedNodesDuringDebugging.set(node.graphNodeId(), node);
		}
	}
	removeNode(node: CoreGraphNode) {
		this.disconnectPredecessors(node);
		this.disconnectSuccessors(node);
		const nodeId = node.graphNodeId();
		this._nodesById.delete(nodeId);
		this._successors.delete(nodeId);
		this._predecessors.delete(nodeId);
		this._nodesCount -= 1;

		this._forbiddenTriggerNodeIds.delete(nodeId);
		this._forbiddenTriggerNodeIds.forEach((set, nodeId) => {
			if (set.has(nodeId)) {
				set.delete(nodeId);
			}
		});
		this._selfDirtyForbidden.delete(nodeId);

		if (this._debugging) {
			this._addedNodesDuringDebugging.delete(nodeId);
		}
	}
	nodesCount() {
		return this._nodesCount;
	}
	connect(src: CoreGraphNode, dest: CoreGraphNode, checkCycle = true): boolean {
		const srcId = src.graphNodeId();
		const destId = dest.graphNodeId();

		if (!(this.hasNode(src) && this.hasNode(dest))) {
			console.warn(`attempt to connect non existing node ${srcId} or ${destId}`);
			return false;
		}

		// if checkCycle is passed as false, that means we never check.
		// this can be useful when we know that the connection will not create a cycle,
		// such as when connecting params or inputs to a node
		if (checkCycle) {
			const sceneLoading = this._scene ? this._scene.loadingController.isLoading() : true;
			checkCycle = !sceneLoading;
		}
		const graphWouldHaveCycle = checkCycle ? src.hasPredecessor(dest) : false;
		// if (checkCycle) {
		// 	graphWouldHaveCycle = this._hasPredecessor(srcId, destId);
		// }

		if (graphWouldHaveCycle) {
			return false;
		} else {
			this._createConnection(srcId, destId);
			src.clearCachesWithPredecessorsAndSuccessors();

			return true;
		}
	}

	disconnect(src: CoreGraphNode, dest: CoreGraphNode) {
		this._removeConnection(src.graphNodeId(), dest.graphNodeId());

		src.clearCachesWithPredecessorsAndSuccessors();
		dest.clearCachesWithPredecessorsAndSuccessors();
	}
	disconnectPredecessors(node: CoreGraphNode) {
		const predecessors = this.predecessors(node);
		if (!predecessors) {
			return;
		}
		for (const predecessor of predecessors) {
			this.disconnect(predecessor, node);
		}
	}
	disconnectSuccessors(node: CoreGraphNode) {
		const successors = this.successors(node);
		if (!successors) {
			return;
		}
		for (const successor of successors) {
			this.disconnect(node, successor);
		}
	}

	predecessorIds(id: CoreGraphNodeId): CoreGraphNodeId[] | undefined {
		return this._predecessors.get(id)?.idsArray;
	}
	predecessors(node: CoreGraphNode): CoreGraphNode[] | undefined {
		return this._predecessors.get(node.graphNodeId())?.nodes;
	}
	successorIds(id: CoreGraphNodeId): CoreGraphNodeId[] | undefined {
		return this._successors.get(id)?.idsArray;
	}
	successors(node: CoreGraphNode): CoreGraphNode[] | undefined {
		return this._successors.get(node.graphNodeId())?.nodes;
	}
	private _boundPredecessorIds: TraverseCallback = this.predecessorIds.bind(this);
	private _boundSuccessorIds: TraverseCallback = this.successorIds.bind(this);
	// private _allNodeIds(node: CoreGraphNode, method: TraverseCallback, target: CoreGraphNodeId[]): void {
	// 	target.length = 0;
	// 	_idsSet.clear();
	// 	_idStack.length = 1;
	// 	_idStack[0] = node.graphNodeId();
	// 	const forbiddenIds = this._forbiddenTriggerNodeIds.get(node.graphNodeId())

	// 	while (_idStack.length > 0) {
	// 		const currentId = _idStack.pop()!;
	// 		const ids = method(currentId);
	// 		if (ids) {
	// 			for (const id of ids) {
	// 				if (!_idsSet.has(id)) {
	// 					_idsSet.add(id);
	// 					target.push(id);
	// 					_idStack.push(id);
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	allPredecessorIds(node: CoreGraphNode, target: CoreGraphNodeId[]): void {
		// this._allNodeIds(node, this._boundPredecessorIds, target);
		target.length = 0;
		_idsSet.clear();
		_idStack.length = 1;
		_idStack[0] = node.graphNodeId();

		while (_idStack.length > 0) {
			const currentId = _idStack.pop()!;
			const ids = this._boundPredecessorIds(currentId);
			if (ids) {
				for (const id of ids) {
					if (!_idsSet.has(id)) {
						_idsSet.add(id);
						target.push(id);
						_idStack.push(id);
					}
				}
			}
		}
	}
	allSuccessorIds(node: CoreGraphNode, target: CoreGraphNodeId[]): void {
		// this._allNodeIds(node, this._boundSuccessorIds, target);
		target.length = 0;
		_idsSet.clear();
		_idStack.length = 1;
		_idStack[0] = node.graphNodeId();
		const forbiddenIds = this._forbiddenTriggerNodeIds.get(node.graphNodeId());

		while (_idStack.length > 0) {
			const currentId = _idStack.pop()!;
			const ids = this._boundSuccessorIds(currentId);
			if (ids) {
				for (const id of ids) {
					if (!_idsSet.has(id)) {
						_idsSet.add(id);
						if (forbiddenIds == null || !forbiddenIds.has(id)) {
							target.push(id);
							_idStack.push(id);
						}
					}
				}
			}
		}
	}
	// private _allNodes(node: CoreGraphNode, method: TraverseCallback, target: CoreGraphNode[]): void {
	// 	target.length = 0;
	// 	_idsSet.clear();
	// 	_idStack.length = 1;
	// 	_idStack[0] = node.graphNodeId();

	// 	while (_idStack.length > 0) {
	// 		const currentId = _idStack.pop()!;
	// 		const ids = method(currentId);
	// 		if (ids) {
	// 			for (const id of ids) {
	// 				if (!_idsSet.has(id)) {
	// 					_idsSet.add(id);
	// 					const otherNode = this._nodesById.get(id);
	// 					if (otherNode) {
	// 						target.push(otherNode);
	// 					}
	// 					_idStack.push(id);
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	allPredecessors(node: CoreGraphNode, target: CoreGraphNode[]): void {
		// this._allNodes(node, this._boundPredecessorIds, target);
		target.length = 0;
		_idsSet.clear();
		_idStack.length = 1;
		_idStack[0] = node.graphNodeId();

		while (_idStack.length > 0) {
			const currentId = _idStack.pop()!;
			const ids = this._boundPredecessorIds(currentId);
			if (ids) {
				for (const id of ids) {
					if (!_idsSet.has(id)) {
						_idsSet.add(id);
						const otherNode = this._nodesById.get(id);
						if (otherNode) {
							target.push(otherNode);
						}
						_idStack.push(id);
					}
				}
			}
		}
	}
	allSuccessors(node: CoreGraphNode, target: CoreGraphNode[]): void {
		// this._allNodes(node, this._boundSuccessorIds, target);
		target.length = 0;
		_idsSet.clear();
		_idStack.length = 1;
		_idStack[0] = node.graphNodeId();
		const forbiddenIds = this._forbiddenTriggerNodeIds.get(node.graphNodeId());

		while (_idStack.length > 0) {
			const currentId = _idStack.pop()!;
			const ids = this._boundSuccessorIds(currentId);
			if (ids) {
				for (const id of ids) {
					if (!_idsSet.has(id)) {
						_idsSet.add(id);
						if (forbiddenIds == null || !forbiddenIds.has(id)) {
							const otherNode = this._nodesById.get(id);
							if (otherNode) {
								target.push(otherNode);
							}
							_idStack.push(id);
						}
					}
				}
			}
		}
	}
	private _createConnection(srcId: CoreGraphNodeId, destId: CoreGraphNodeId) {
		let successorsData = this._successors.get(srcId);
		let predecessorsData = this._predecessors.get(destId);

		// add data if not present
		if (!successorsData) {
			successorsData = {idsSet: new Set(), idsArray: [], nodes: []};
			this._successors.set(srcId, successorsData);
		}
		if (!predecessorsData) {
			predecessorsData = {idsSet: new Set(), idsArray: [], nodes: []};
			this._predecessors.set(destId, predecessorsData);
		}

		// successor
		if (!successorsData.idsSet.has(destId)) {
			successorsData.idsSet.add(destId);
			successorsData.idsArray.push(destId);
			const destNode = this._nodesById.get(destId);
			if (destNode) {
				successorsData.nodes.push(destNode);
			} else {
				throw new Error(`creating connection with node not in graph ${destId}`);
			}
		}

		// predecessor
		if (!predecessorsData.idsSet.has(srcId)) {
			predecessorsData.idsSet.add(srcId);
			predecessorsData.idsArray.push(srcId);
			const srcNode = this._nodesById.get(srcId);
			if (srcNode) {
				predecessorsData.nodes.push(srcNode);
			} else {
				throw new Error(`creating connection with node not in graph ${srcId}`);
			}
		}
	}
	private _removeConnection(srcId: CoreGraphNodeId, destId: CoreGraphNodeId) {
		// remove successors
		const successorsData = this._successors.get(srcId);
		if (successorsData && successorsData.idsSet.has(destId)) {
			successorsData.idsSet.delete(destId);
			const idIndex = successorsData.idsArray.indexOf(destId);
			if (idIndex >= 0) {
				successorsData.idsArray.splice(idIndex, 1);
				successorsData.nodes.splice(idIndex, 1);
			} else {
				console.warn(`could not find id ${destId} in successorsData.idsArray`, successorsData.idsArray);
			}
		}
		// remove predecessors
		const predecessorsData = this._predecessors.get(destId);
		if (predecessorsData && predecessorsData.idsSet.has(srcId)) {
			predecessorsData.idsSet.delete(srcId);
			const idIndex = predecessorsData.idsArray.indexOf(srcId);
			if (idIndex >= 0) {
				predecessorsData.idsArray.splice(idIndex, 1);
				predecessorsData.nodes.splice(idIndex, 1);
			} else {
				console.warn(`could not find id ${srcId} in predecessorsData.idsArray`, predecessorsData.idsArray);
			}
		}
	}
	setForbiddenTriggerNodes(src: CoreGraphNode, dest: CoreGraphNode | CoreGraphNode[]) {
		// if (this._forbiddenTriggerNodeIds) {
		this._forbiddenTriggerNodeIds.get(src.graphNodeId())?.clear();
		// } else {
		// this._forbiddenTriggerNodeIds = new Set();
		// }
		if (isArray(dest)) {
			for (const destNode of dest) {
				addToSetAtEntry(this._forbiddenTriggerNodeIds, src.graphNodeId(), destNode.graphNodeId());
				// this._forbiddenTriggerNodeIds.add(node.graphNodeId());
				// node.clearCachesWithPredecessorsAndSuccessors();
			}
		} else {
			addToSetAtEntry(this._forbiddenTriggerNodeIds, src.graphNodeId(), dest.graphNodeId());
			// this._forbiddenTriggerNodeIds.add(nodes.graphNodeId());
		}
	}
	clearForbiddenTriggerNodes(src: CoreGraphNode) {
		this._forbiddenTriggerNodeIds.delete(src.graphNodeId());
	}
	setSelfDirtyForbidden(node: CoreGraphNode, state: boolean) {
		if (state) {
			this._selfDirtyForbidden.add(node.graphNodeId());
		} else {
			this._selfDirtyForbidden.delete(node.graphNodeId());
		}
	}
	selfDirtyForbidden(node: CoreGraphNode): boolean {
		return this._selfDirtyForbidden.has(node.graphNodeId());
	}
}
