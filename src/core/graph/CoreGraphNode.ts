import {CoreGraph, CoreGraphNodeId} from './CoreGraph';
import {DirtyController, PostDirtyHook} from './DirtyController';
import {PolyScene} from '../../engine/scene/PolyScene';

/**
 *
 *
 * This is the base class for nodes and params, which are part of the same graph, and are connected to dependencies.
 *
 */
export class CoreGraphNode {
	private _graph: CoreGraph;
	private _graphNodeId: CoreGraphNodeId;
	private _dirtyController: DirtyController = new DirtyController(this);
	constructor(protected _scene: PolyScene, protected _name: string) {
		this._graphNodeId = _scene.graph.nextId();
		_scene.graph.addNode(this);
		this._graph = _scene.graph;
	}

	private _disposed = false;
	dispose() {
		this._dirtyController.dispose();
		this.graphRemove();
		this._disposed = true;
	}
	disposed() {
		return this._disposed;
	}

	/**
	 * returns the name
	 *
	 */
	name(): string {
		return this._name;
	}
	setName(name: string) {
		this._name = name;
	}

	/**
	 * returns the scene
	 *
	 */
	scene(): PolyScene {
		return this._scene;
	}
	// graph() {
	// 	return this._graph;
	// }
	/**
	 * returns the id, which is unique for the scene
	 *
	 */
	graphNodeId(): CoreGraphNodeId {
		return this._graphNodeId;
	}

	//
	//
	// DIRTY CONTROLLER
	//
	//
	get dirtyController() {
		return this._dirtyController;
	}
	/**
	 * makes the graphNode dirty, which in turns makes its dependencies dirty
	 *
	 */
	setDirty(trigger?: CoreGraphNode | null) {
		trigger = trigger || this;
		this._dirtyController.setDirty(trigger);
	}
	/**
	 * makes dependencies dirty
	 *
	 */
	setSuccessorsDirty(trigger?: CoreGraphNode) {
		this._dirtyController.setSuccessorsDirty(trigger);
	}
	/**
	 * removes the dirty state
	 *
	 */
	removeDirtyState() {
		this._dirtyController.removeDirtyState();
	}
	isDirty() {
		return this._dirtyController.isDirty();
	}
	/**
	 * adds a callback that gets run when the graphNode is dirty
	 *
	 */
	addPostDirtyHook(name: string, callback: PostDirtyHook) {
		this._dirtyController.addPostDirtyHook(name, callback);
	}
	removePostDirtyHook(name: string) {
		this._dirtyController.removePostDirtyHook(name);
	}

	//
	//
	// GRAPH
	//
	//

	graphRemove() {
		this._graph.removeNode(this);
	}

	addGraphInput(src: CoreGraphNode, checkCycle = true): boolean {
		return this._graph.connect(src, this, checkCycle);
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
		return this._graph.predecessorIds(this._graphNodeId) || [];
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
