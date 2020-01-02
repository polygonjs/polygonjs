import {CoreGraph} from '../CoreGraph'
import {SceneNodeDirtyable} from '../SceneNodeDirtyable'

// type Constructor<T = {}> = new (...args: any[]) => T;
export function GraphNode<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		_graph: CoreGraph
		_node_id: string

		constructor(...args: any[]) {
			super(...args)
		}

		_init_graph_node(graph: CoreGraph) {
			this._graph = graph
			return this.graph_add()
		}
		// full_path: ->
		// 	"node with unknown path #{this.graph_node_id()}"

		graph() {
			return this._graph
		}
		graph_add() {
			this._node_id = this.graph().next_id()
			this.graph().setNode(this)
		}
		graph_remove() {
			this.graph().removeNode(this)
		}

		graph_node_id(): string {
			return this._node_id
		}

		// _graph_connect: (src, dest)->
		// 	this.graph().connect(src, dest)
		add_graph_input(src: any): boolean {
			return this.graph().connect(
				src,
				(<unknown>this) as SceneNodeDirtyable
			)
		}
		remove_graph_input(src: any) {
			this.graph().disconnect(src, (<unknown>this) as SceneNodeDirtyable)
		}

		// graph_disconnect: (src, dest)->
		// 	this.graph().disconnect(src, dest)

		graph_disconnect_predecessors() {
			this.graph().disconnect_predecessors(
				(<unknown>this) as SceneNodeDirtyable
			)
		}
		graph_disconnect_successors() {
			this.graph().disconnect_successors(
				(<unknown>this) as SceneNodeDirtyable
			)
		}

		graph_predecessor_ids(): string[] {
			return this.graph().predecessor_ids(this.graph_node_id()) || []
		}
		graph_predecessors(): any[] {
			return this.graph().predecessors(this)
		}
		graph_successors(): any[] {
			return this.graph().successors(this)
		}
		graph_all_predecessors(): any[] {
			return this.graph().all_predecessors(this)
		}
		graph_all_successors(): any[] {
			return this.graph().all_successors(this)
		}
	}
}
