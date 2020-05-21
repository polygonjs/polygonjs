import {CoreGraph, CoreGraphNodeId} from './CoreGraph';
import {DirtyController, PostDirtyHook} from './DirtyController';
import {PolyScene} from '../../engine/scene/PolyScene';

export class CoreGraphNode {
	private _graph: CoreGraph;
	private _graph_node_id: CoreGraphNodeId;
	private _dirty_controller: DirtyController = new DirtyController(this);
	constructor(protected _scene: PolyScene, protected _name: string) {
		this._graph_node_id = _scene.graph.next_id();
		_scene.graph.setNode(this);
		this._graph = _scene.graph;
	}
	get name() {
		return this._name;
	}
	set_name(name: string) {
		this._name = name;
	}

	get scene() {
		return this._scene;
	}
	get graph() {
		return this._graph;
	}
	get graph_node_id(): CoreGraphNodeId {
		return this._graph_node_id;
	}

	//
	//
	// DIRTY CONTROLLER
	//
	//
	get dirty_controller() {
		return this._dirty_controller;
	}
	set_dirty(trigger?: CoreGraphNode | null) {
		trigger = trigger || this;
		this._dirty_controller.set_dirty(trigger);
	}
	set_successors_dirty(trigger?: CoreGraphNode) {
		this._dirty_controller.set_successors_dirty(trigger);
	}
	remove_dirty_state() {
		this._dirty_controller.remove_dirty_state();
	}
	get is_dirty() {
		return this._dirty_controller.is_dirty;
	}
	add_post_dirty_hook(name: string, callback: PostDirtyHook) {
		this._dirty_controller.add_post_dirty_hook(name, callback);
	}

	//
	//
	// GRAPH
	//
	//

	graph_remove() {
		this.graph.removeNode(this);
	}

	add_graph_input(src: CoreGraphNode, check_if_graph_has_cycle = true): boolean {
		return this.graph.connect(src, this, check_if_graph_has_cycle);
	}
	remove_graph_input(src: CoreGraphNode) {
		this.graph.disconnect(src, this);
	}

	graph_disconnect_predecessors() {
		this.graph.disconnect_predecessors(this);
	}
	graph_disconnect_successors() {
		this.graph.disconnect_successors(this);
	}

	graph_predecessor_ids(): CoreGraphNodeId[] {
		return this.graph.predecessor_ids(this._graph_node_id) || [];
	}
	graph_predecessors(): CoreGraphNode[] {
		return this.graph.predecessors(this);
	}
	graph_successors(): CoreGraphNode[] {
		return this.graph.successors(this);
	}
	graph_all_predecessors(): CoreGraphNode[] {
		return this.graph.all_predecessors(this);
	}
	graph_all_successors(): CoreGraphNode[] {
		return this.graph.all_successors(this);
	}
}
