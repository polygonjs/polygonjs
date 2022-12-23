import {PolyScene} from '../../engine/scene/PolyScene';
import {SetUtils} from '../SetUtils';
import {CallbacksTriggerController} from './CallbacksTriggerController';
import {CoreGraphNode} from './CoreGraphNode';

export type CoreGraphNodeId = number;

type TraverseCallback = (id: CoreGraphNodeId) => CoreGraphNodeId[];
export class CoreGraph {
	private _nextId: CoreGraphNodeId = 0;
	private _scene: PolyScene | undefined;
	private _successors: Map<CoreGraphNodeId, Set<CoreGraphNodeId>> = new Map();
	private _predecessors: Map<CoreGraphNodeId, Set<CoreGraphNodeId>> = new Map();
	private _nodesById: Map<number, CoreGraphNode> = new Map();
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

	nodesFromIds(ids: number[]) {
		const nodes: CoreGraphNode[] = [];
		for (let id of ids) {
			const node = this.nodeFromId(id);
			if (node) {
				nodes.push(node);
			}
		}
		return nodes;
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
		this._nodesById.delete(node.graphNodeId());
		this._successors.delete(node.graphNodeId());
		this._predecessors.delete(node.graphNodeId());
		this._nodesCount -= 1;

		if (this._debugging) {
			this._addedNodesDuringDebugging.delete(node.graphNodeId());
		}
	}
	nodesCount() {
		return this._nodesCount;
	}
	connect(src: CoreGraphNode, dest: CoreGraphNode, checkCycle = true): boolean {
		const srcId = src.graphNodeId();
		const destId = dest.graphNodeId();

		if (this.hasNode(src) && this.hasNode(dest)) {
			// if checkCycle is passed as false, that means we never check.
			// this can be useful when we know that the connection will not create a cycle,
			// such as when connecting params or inputs to a node
			if (checkCycle) {
				const sceneLoading = this._scene ? this._scene.loadingController.isLoading() : true;
				checkCycle = !sceneLoading;
			}
			let graphWouldHaveCycle = false;
			if (checkCycle) {
				// graph_has_cycle = !alg.isAcyclic(this._graph);
				graphWouldHaveCycle = this._hasPredecessor(srcId, destId);
			}

			if (graphWouldHaveCycle) {
				return false;
			} else {
				this._createConnection(srcId, destId);
				src.dirtyController.clearSuccessorsCacheWithPredecessors();

				return true;
			}
		} else {
			console.warn(`attempt to connect non existing node ${srcId} or ${destId}`);
			return false;
		}
	}

	disconnect(src: CoreGraphNode, dest: CoreGraphNode) {
		// const src_id_s = src.graphNodeId();
		// const dest_id_s = dest.graphNodeId();
		// this._graph.removeEdge(src_id_s, dest_id_s);
		this._removeConnection(src.graphNodeId(), dest.graphNodeId());

		src.dirtyController.clearSuccessorsCacheWithPredecessors();
	}
	disconnectPredecessors(node: CoreGraphNode) {
		const predecessors = this.predecessors(node);
		for (let predecessor of predecessors) {
			this.disconnect(predecessor, node);
		}
	}
	disconnectSuccessors(node: CoreGraphNode) {
		const successors = this.successors(node);
		for (let successor of successors) {
			this.disconnect(node, successor);
		}
	}

	predecessorIds(id: CoreGraphNodeId): CoreGraphNodeId[] {
		const map = this._predecessors.get(id);
		if (map) {
			const ids: CoreGraphNodeId[] = [];
			map.forEach((bool, id) => {
				ids.push(id);
			});
			return ids;
		}
		return [];
	}

	predecessors(node: CoreGraphNode) {
		const ids = this.predecessorIds(node.graphNodeId());
		return this.nodesFromIds(ids);
	}
	successorIds(id: CoreGraphNodeId): CoreGraphNodeId[] {
		const map = this._successors.get(id);
		if (map) {
			const ids: CoreGraphNodeId[] = [];

			map.forEach((bool, successorId) => {
				ids.push(successorId);
			});
			return ids;
		}
		return [];
	}
	successors(node: CoreGraphNode): CoreGraphNode[] {
		const ids = this.successorIds(node.graphNodeId()) || [];
		return this.nodesFromIds(ids);
	}
	private _boundPredecessorIds: TraverseCallback = this.predecessorIds.bind(this);
	private _boundSuccessorIds: TraverseCallback = this.successorIds.bind(this);
	allPredecessorIds(node: CoreGraphNode): CoreGraphNodeId[] {
		const method = this._boundPredecessorIds;
		const ids: Set<CoreGraphNodeId> = new Set();
		let nextIds = method(node.graphNodeId());

		while (nextIds.length > 0) {
			const nextNextIds: number[] = [];
			for (let nextId of nextIds) {
				ids.add(nextId);

				for (let nextNextId of method(nextId)) {
					nextNextIds.push(nextNextId);
				}
			}

			nextIds = nextNextIds;
		}

		return SetUtils.toArray(ids);
	}
	allSuccessorIds(node: CoreGraphNode): CoreGraphNodeId[] {
		const method = this._boundSuccessorIds;
		// const ids: Set<CoreGraphNodeId> = new Set();
		const ids: Array<CoreGraphNodeId> = [];
		let nextIds = method(node.graphNodeId());

		while (nextIds.length > 0) {
			const nextNextIds: number[] = [];
			for (let nextId of nextIds) {
				const nextNode = this.nodeFromId(nextId);
				if (nextNode && !nextNode.dirtyController.isForbiddenTriggerNodeId(node.graphNodeId())) {
					// if the ids has already been encountered, we need to remove it and add it again.
					// This is important, otherwise a node may receive a dirty event before all its dependencies have
					// which currently leads to bad cooks
					const currentIndex = ids.indexOf(nextId);
					if (currentIndex >= 0) {
						ids.splice(currentIndex, 1);
					}
					ids.push(nextId);
					for (let nextNextId of method(nextId)) {
						nextNextIds.push(nextNextId);
					}
				}
			}

			nextIds = nextNextIds;
		}

		return ids;
	}
	allPredecessors(node: CoreGraphNode): CoreGraphNode[] {
		const ids = this.allPredecessorIds(node);
		return this.nodesFromIds(ids);
	}
	allSuccessors(node: CoreGraphNode): CoreGraphNode[] {
		const ids = this.allSuccessorIds(node);
		return this.nodesFromIds(ids);
	}
	private _createConnection(srcId: CoreGraphNodeId, destId: CoreGraphNodeId) {
		// set successors
		let successors = this._successors.get(srcId);
		if (!successors) {
			successors = new Set();
			this._successors.set(srcId, successors);
		}
		if (successors.has(destId)) {
			return;
		}
		successors.add(destId);

		// set predecessors
		let predecessors = this._predecessors.get(destId);
		if (!predecessors) {
			predecessors = new Set();
			this._predecessors.set(destId, predecessors);
		}
		predecessors.add(srcId);
	}
	private _removeConnection(srcId: CoreGraphNodeId, destId: CoreGraphNodeId) {
		// remove successors
		let successors = this._successors.get(srcId);
		if (successors) {
			successors.delete(destId);
			if (successors.size == 0) {
				this._successors.delete(srcId);
			}
		}
		// remove predecessors
		let predecessors = this._predecessors.get(destId);
		if (predecessors) {
			predecessors.delete(srcId);
			if (predecessors.size == 0) {
				this._predecessors.delete(destId);
			}
		}
	}

	private _hasPredecessor(srcId: CoreGraphNodeId, destId: CoreGraphNodeId): boolean {
		const ids = this.predecessorIds(srcId);

		if (ids) {
			if (ids.includes(destId)) {
				return true;
			} else {
				for (let id of ids) {
					if (this._hasPredecessor(id, destId)) {
						return true;
					}
				}
			}
		}

		return false;
	}
}
