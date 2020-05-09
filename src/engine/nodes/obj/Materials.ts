import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {MatNodeChildrenMap} from '../../poly/registers/nodes/Mat';
import {BaseMatNodeType} from '../mat/_Base';

export class MaterialsObjNode extends BaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.MANAGER;
	static type() {
		return NetworkNodeType.MAT;
	}
	// children_context(){ return NodeContext.MAT }

	protected _children_controller_context = NodeContext.MAT;
	// initialize_node() {
	// 	this.children_controller?.init({dependent: false});
	// }

	create_node<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K] {
		return super.create_node(type) as MatNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseMatNodeType[];
	}
	nodes_by_type<K extends keyof MatNodeChildrenMap>(type: K): MatNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as MatNodeChildrenMap[K][];
	}
}
