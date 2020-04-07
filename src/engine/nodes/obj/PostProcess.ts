import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from '../../poly/NodeContext';
import {PostNodeChildrenMap} from '../../poly/registers/Post';
import {BasePostProcessNodeType} from '../post/_Base';

export class PostProcessObjNode extends BaseManagerObjNode {
	static type() {
		return 'post_process';
	}
	// children_context(){ return NodeContext.POST }

	protected _children_controller_context = NodeContext.POST;
	initialize_node() {
		this.children_controller?.init();
		// this._init_manager();
	}

	create_node<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K] {
		return super.create_node(type) as PostNodeChildrenMap[K];
	}
	children() {
		return super.children() as BasePostProcessNodeType[];
	}
	nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as PostNodeChildrenMap[K][];
	}
}
