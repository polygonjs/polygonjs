import {PolyScene} from '../../engine/scene/PolyScene';
import {SetUtils} from '../SetUtils';
import {CoreGraphNode} from './CoreGraphNode';

export type CoreGraphNodeId = number;

type TraverseCallback = (id: CoreGraphNodeId) => CoreGraphNodeId[];
export class CoreGraph {
	private _next_id: CoreGraphNodeId = 0;
	private _scene: PolyScene | undefined;
	private _successors: Map<CoreGraphNodeId, Set<CoreGraphNodeId>> = new Map();
	private _predecessors: Map<CoreGraphNodeId, Set<CoreGraphNodeId>> = new Map();
	private _nodes_by_id: Map<number, CoreGraphNode> = new Map();
	private _nodesCount = 0;

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
		this._next_id += 1;
		return this._next_id;
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
		return this._nodes_by_id.get(id);
	}
	hasNode(node: CoreGraphNode): boolean {
		return this._nodes_by_id.get(node.graphNodeId()) != null;
	}
	addNode(node: CoreGraphNode) {
		this._nodes_by_id.set(node.graphNodeId(), node);
		this._nodesCount += 1;
		if (this._debugging) {
			this._addedNodesDuringDebugging.set(node.graphNodeId(), node);
		}
	}
	removeNode(node: CoreGraphNode) {
		this._nodes_by_id.delete(node.graphNodeId());
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
	connect(src: CoreGraphNode, dest: CoreGraphNode, check_if_graph_may_have_cycle = true): boolean {
		const src_id = src.graphNodeId();
		const dest_id = dest.graphNodeId();

		if (this.hasNode(src) && this.hasNode(dest)) {
			// this._graph.setEdge(src_id, dest_id);

			// if check_if_graph_may_have_cycle is passed as false, that means we never check.
			// this can be useful when we know that the connection will not create a cycle,
			// such as when connecting params or inputs to a node
			if (check_if_graph_may_have_cycle) {
				const scene_loading = this._scene ? this._scene.loadingController.isLoading() : true;
				check_if_graph_may_have_cycle = !scene_loading;
			}
			let graph_would_have_cycle = false;
			if (check_if_graph_may_have_cycle) {
				// graph_has_cycle = !alg.isAcyclic(this._graph);
				graph_would_have_cycle = this._hasPredecessor(src_id, dest_id);
			}

			if (graph_would_have_cycle) {
				// this._graph.removeEdge(src_id, dest_id);
				return false;
			} else {
				this._createConnection(src_id, dest_id);
				src.dirtyController.clearSuccessorsCacheWithPredecessors();

				return true;
			}
		} else {
			console.warn(`attempt to connect non existing node ${src_id} or ${dest_id}`);
			return false;
		}
	}

	disconnect(src: CoreGraphNode, dest: CoreGraphNode) {
		// const src_id_s = src.graphNodeId();
		// const dest_id_s = dest.graphNodeId();
		// this._graph.removeEdge(src_id_s, dest_id_s);
		this._remove_connection(src.graphNodeId(), dest.graphNodeId());

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
	private _createConnection(src_id: CoreGraphNodeId, dest_id: CoreGraphNodeId) {
		// set successors
		let node_successors = this._successors.get(src_id);
		if (!node_successors) {
			node_successors = new Set();
			this._successors.set(src_id, node_successors);
		}
		if (node_successors.has(dest_id)) {
			return;
		}
		node_successors.add(dest_id);

		// set predecessors
		let node_predecessors = this._predecessors.get(dest_id);
		if (!node_predecessors) {
			node_predecessors = new Set();
			this._predecessors.set(dest_id, node_predecessors);
		}
		node_predecessors.add(src_id);
	}
	private _remove_connection(src_id: CoreGraphNodeId, dest_id: CoreGraphNodeId) {
		// remove successors
		let node_successors = this._successors.get(src_id);
		if (node_successors) {
			node_successors.delete(dest_id);
			if (node_successors.size == 0) {
				this._successors.delete(src_id);
			}
		}
		// remove predecessors
		let node_predecessors = this._predecessors.get(dest_id);
		if (node_predecessors) {
			node_predecessors.delete(src_id);
			if (node_predecessors.size == 0) {
				this._predecessors.delete(dest_id);
			}
		}
	}

	private _hasPredecessor(src_id: CoreGraphNodeId, dest_id: CoreGraphNodeId): boolean {
		const ids = this.predecessorIds(src_id);
		if (ids) {
			if (ids.includes(dest_id)) {
				return true;
			} else {
				for (let id of ids) {
					return this._hasPredecessor(id, dest_id);
				}
			}
		}

		return false;
	}
}
