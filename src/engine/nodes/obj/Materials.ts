import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {MatNodeChildrenMap} from 'src/engine/poly/registers/Mat';
import {BaseMatNodeType} from '../mat/_Base';

export class MaterialsObjNode extends BaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.MAT;
	static type() {
		return 'materials';
	}
	// children_context(){ return NodeContext.MAT }

	protected _children_controller_context = NodeContext.MAT;
	initialize_node() {
		this.children_controller?.init();
	}

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
