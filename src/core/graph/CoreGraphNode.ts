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
	private _allPredecessors: CoreGraphNode[] = [];
	private _allSuccessors: CoreGraphNode[] = [];
	private _allPredecessorsDirty = true;
	private _allSuccessorsDirty = true;
	constructor(protected _scene: PolyScene, protected _name: string) {
		this._graphNodeId = _scene.graph.nextId();
		_scene.graph.addNode(this);
		this._graph = _scene.graph;
	}

	private _disposed = false;
	dispose() {
		this._dirtyController.dispose();
		this._allPredecessors.length = 0;
		this._allSuccessors.length = 0;
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

	graphPredecessorIds(): Readonly<CoreGraphNodeId[]> | undefined {
		return this._graph.predecessorIds(this._graphNodeId);
	}
	graphPredecessors(): Readonly<CoreGraphNode[]> | undefined {
		return this._graph.predecessors(this);
	}
	graphSuccessorIds(): Readonly<CoreGraphNodeId[]> | undefined {
		return this._graph.successorIds(this._graphNodeId);
	}
	graphSuccessors(): Readonly<CoreGraphNode[]> | undefined {
		return this._graph.successors(this);
	}
	private _clearAllPredecessors() {
		this._allPredecessorsDirty = true;
	}
	private _clearAllSuccessors() {
		this._allSuccessorsDirty = true;
	}
	graphAllPredecessors(): Readonly<CoreGraphNode[]> {
		if (this._allPredecessorsDirty) {
			this._graph.allPredecessors(this, this._allPredecessors);
			this._allPredecessorsDirty = false;
		}
		return this._allPredecessors;
		// return Object.freeze([...this._allPredecessors]);
	}
	graphAllSuccessors(): Readonly<CoreGraphNode[]> {
		if (this._allSuccessorsDirty) {
			this._graph.allSuccessors(this, this._allSuccessors);
			this._allSuccessorsDirty = false;
		}
		return this._allSuccessors;
		// return Object.freeze([...this._allSuccessors]);
	}
	hasPredecessor(node: CoreGraphNode): boolean {
		return this.graphAllPredecessors().includes(node);
	}
	clearCachesWithPredecessorsAndSuccessors() {
		const allPredecessors = this.graphAllPredecessors();
		const allSuccessors = this.graphAllSuccessors();
		for (const predecessor of allPredecessors) {
			predecessor._clearAllSuccessors();
		}
		for (const successor of allSuccessors) {
			successor._clearAllPredecessors();
		}
		this._clearAllPredecessors();
		this._clearAllSuccessors();
	}
	//
	setForbiddenTriggerNodes(nodes: CoreGraphNode | CoreGraphNode[]) {
		this._graph.setForbiddenTriggerNodes(this, nodes);
		this._clearAllSuccessors();
	}
	clearForbiddenTriggerNodes() {
		this._graph.clearForbiddenTriggerNodes(this);
		this._clearAllSuccessors();
	}
	setSelfDirtyForbidden(state: boolean) {
		this._graph.setSelfDirtyForbidden(this, state);
	}
	selfDirtyForbidden(): boolean {
		return this._graph.selfDirtyForbidden(this);
	}
}
