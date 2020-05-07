import {BaseNetworkSopNode} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
import {PostNodeChildrenMap} from '../../poly/registers/nodes/Post';
import {BasePostProcessNodeType} from '../post/_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';

export class PostProcessSopNode extends BaseNetworkSopNode {
	static type() {
		return 'post_process';
	}
	public readonly display_node_controller: DisplayNodeController = new DisplayNodeController(this, {
		on_display_node_remove: () => {},
		on_display_node_set: () => {},
		on_display_node_update: () => {},
	});

	protected _children_controller_context = NodeContext.POST;

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
