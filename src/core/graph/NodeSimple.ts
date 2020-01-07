// import {CoreObject} from 'src/core/Object';
// import {Dirtyable} from './Concern/Dirtyable';
import {SceneNodeDirtyable} from './SceneNodeDirtyable';
// import {GraphNode} from './Concern/GraphNode';
import {PolyScene} from 'src/engine/scene/PolyScene';

export class NodeSimple extends SceneNodeDirtyable {
	constructor(protected _name: string) {
		super();
	}

	set_scene(scene: PolyScene) {
		if (this._scene == null) {
			this._scene = scene;
			this._init_node_simple();
		}
	}

	_init_node_simple() {
		// this._init_dirtyable();
		this._init_graph_node(this.scene().graph());
	}
	set_dirty_allowed(original_trigger_graph_node: SceneNodeDirtyable): boolean {
		return true;
	}
}
