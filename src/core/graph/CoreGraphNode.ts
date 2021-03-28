import {CoreGraph, CoreGraphNodeId} from './CoreGraph';
import {DirtyController, PostDirtyHook} from './DirtyController';
import {PolyScene} from '../../engine/scene/PolyScene';

export class CoreGraphNode {
	private _graph: CoreGraph;
	private _graph_node_id: CoreGraphNodeId;
	private _dirty_controller: DirtyController = new DirtyController(this);
	constructor(protected _scene: PolyScene, protected _name: string) {
		this._graph_node_id = _scene.graph.nextId();
		_scene.graph.addNode(this);
		this._graph = _scene.graph;
	}

	dispose() {
		this._dirty_controller.dispose();
		this.graphRemove();
	}

	name() {
		return this._name;
	}
	setName(name: string) {
		this._name = name;
	}

	scene() {
		return this._scene;
	}
	// graph() {
	// 	return this._graph;
	// }
	graphNodeId(): CoreGraphNodeId {
		return this._graph_node_id;
	}

	//
	//
	// DIRTY CONTROLLER
	//
	//
	get dirtyController() {
		return this._dirty_controller;
	}
	setDirty(trigger?: CoreGraphNode | null) {
		trigger = trigger || this;
		this._dirty_controller.set_dirty(trigger);
	}
	setSuccessorsDirty(trigger?: CoreGraphNode) {
		this._dirty_controller.set_successors_dirty(trigger);
	}
	removeDirtyState() {
		this._dirty_controller.removeDirtyState();
	}
	isDirty() {
		return this._dirty_controller.isDirty();
	}
	addPostDirtyHook(name: string, callback: PostDirtyHook) {
		this._dirty_controller.addPostDirtyHook(name, callback);
	}

	//
	//
	// GRAPH
	//
	//

	graphRemove() {
		this._graph.removeNode(this);
	}

	addGraphInput(src: CoreGraphNode, check_if_graph_has_cycle = true): boolean {
		return this._graph.connect(src, this, check_if_graph_has_cycle);
	}
	removeGraphInput(src: CoreGraphNode) {
		this._graph.disconnect(src, this);
	}

	graphDisconnectPredecessors() {
		this._graph.disconnectPredecessors(this);
	}
	graphDisconnectSuccessors() {
		this._graph.disconnectSuccessors(this);
	}

	graphPredecessorIds(): CoreGraphNodeId[] {
		return this._graph.predecessorIds(this._graph_node_id) || [];
	}
	graphPredecessors(): CoreGraphNode[] {
		return this._graph.predecessors(this);
	}
	graphSuccessors(): CoreGraphNode[] {
		return this._graph.successors(this);
	}
	graphAllPredecessors(): CoreGraphNode[] {
		return this._graph.allPredecessors(this);
	}
	graphAllSuccessors(): CoreGraphNode[] {
		return this._graph.allSuccessors(this);
	}
}
