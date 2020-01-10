import {CoreGraph, CoreGraphNodeId} from './CoreGraph';
import {DirtyController} from './DirtyController';
// import {SceneNodeDirtyable} from './SceneNodeDirtyable';

// type Constructor<T = {}> = new (...args: any[]) => T;
export class CoreGraphNode {
	_graph: CoreGraph;
	_id: CoreGraphNodeId;
	_dirty_controller: DirtyController;

	// constructor(...args: any[]) {
	// 	super(...args);
	// }

	init(graph: CoreGraph) {
		this._graph = graph;
		this._id = this.graph.next_id();
		this.graph.setNode(this);
	}
	// full_path: ->
	// 	"node with unknown path #{this.graph_node_id()}"

	get graph() {
		return this._graph;
	}
	get id(): CoreGraphNodeId {
		return this._id;
	}
	get dirty_controller() {
		return (this._dirty_controller = this._dirty_controller || new DirtyController(this));
	}
	set_dirty(trigger?: CoreGraphNode) {
		this.dirty_controller.set_dirty(trigger);
	}
	set_successors_dirty(trigger?: CoreGraphNode) {
		this.dirty_controller.set_successors_dirty(trigger);
	}
	remove_dirty_state() {
		this.dirty_controller.remove_dirty_state();
	}
	get is_dirty() {
		return this.dirty_controller.is_dirty;
	}
	// private graph_add() {
	// }
	graph_remove() {
		this.graph.removeNode(this);
	}

	// _graph_connect: (src, dest)->
	// 	this.graph().connect(src, dest)
	add_input(src: CoreGraphNode): boolean {
		return this.graph.connect(src, this);
	}
	remove_input(src: CoreGraphNode) {
		this.graph.disconnect(src, this);
	}

	// graph_disconnect: (src, dest)->
	// 	this.graph().disconnect(src, dest)

	disconnect_predecessors() {
		this.graph.disconnect_predecessors(this);
	}
	disconnect_successors() {
		this.graph.disconnect_successors(this);
	}

	predecessor_ids(): CoreGraphNodeId[] {
		return this.graph.predecessor_ids(this.id) || [];
	}
	predecessors(): CoreGraphNode[] {
		return this.graph.predecessors(this);
	}
	successors(): CoreGraphNode[] {
		return this.graph.successors(this);
	}
	all_predecessors(): CoreGraphNode[] {
		return this.graph.all_predecessors(this);
	}
	all_successors(): CoreGraphNode[] {
		return this.graph.all_successors(this);
	}
}
