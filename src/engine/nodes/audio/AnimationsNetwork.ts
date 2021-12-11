/**
 * A subnet to create animation nodes
 *
 */

import {ParamLessBaseNetworkAudioNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {AnimNodeChildrenMap} from '../../poly/registers/nodes/Anim';
import {BaseAnimNodeType} from '../anim/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class AnimationsNetworkAudioNode extends ParamLessBaseNetworkAudioNode {
	static type() {
		return NetworkNodeType.ANIM;
	}

	protected _childrenControllerContext = NodeContext.ANIM;

	createNode<S extends keyof AnimNodeChildrenMap>(node_class: S, options?: NodeCreateOptions): AnimNodeChildrenMap[S];
	createNode<K extends valueof<AnimNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<AnimNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K {
		return super.createNode(node_class, options) as K;
	}
	children() {
		return super.children() as BaseAnimNodeType[];
	}
	nodesByType<K extends keyof AnimNodeChildrenMap>(type: K): AnimNodeChildrenMap[K][] {
		return super.nodesByType(type) as AnimNodeChildrenMap[K][];
	}
}
