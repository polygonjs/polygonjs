/**
 * A subnet to create animation nodes
 *
 */

import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {AnimNodeChildrenMap} from '../../poly/registers/nodes/Anim';
import {BaseAnimNodeType} from '../anim/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ObjNodeRenderOrder} from './_Base';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

class BaseAnimationsObjNode extends ParamLessBaseManagerObjNode {
	static override type() {
		return NetworkNodeType.ANIM;
	}

	protected override _childrenControllerContext = NodeContext.ANIM;

	override createNode<S extends keyof AnimNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): AnimNodeChildrenMap[S];
	override createNode<K extends valueof<AnimNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<AnimNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseAnimNodeType[];
	}
	override nodesByType<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][] {
		return super.nodesByType(type) as AnimNodeChildrenMap[K][];
	}
}
export class AnimationsNetworkObjNode extends BaseAnimationsObjNode {
	public override readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
}
