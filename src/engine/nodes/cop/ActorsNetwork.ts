/**
 * A subnet to create actor nodes
 *
 */

import {ParamLessBaseNetworkCopNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {BaseAnimNodeType} from '../anim/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class ActorsNetworkCopNode extends ParamLessBaseNetworkCopNode {
	static override type() {
		return NetworkNodeType.ACTOR;
	}

	protected override _childrenControllerContext = NodeContext.JS;

	override createNode<S extends keyof JsNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): JsNodeChildrenMap[S];
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseAnimNodeType[];
	}
	override nodesByType<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][] {
		return super.nodesByType(type) as JsNodeChildrenMap[K][];
	}
}
