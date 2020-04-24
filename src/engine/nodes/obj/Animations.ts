import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {AnimNodeChildrenMap} from '../../poly/registers/nodes/Anim';
import {BaseAnimNodeType} from '../anim/_Base';

export class AnimationsObjNode extends BaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.MANAGER;
	static type(): Readonly<'animations'> {
		return 'animations';
	}
	// children_context(){ return NodeContext.MAT }

	protected _children_controller_context = NodeContext.ANIM;
	initialize_node() {
		this.children_controller?.init();
	}

	create_node<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K] {
		return super.create_node(type) as AnimNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseAnimNodeType[];
	}
	nodes_by_type<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as AnimNodeChildrenMap[K][];
	}
}
