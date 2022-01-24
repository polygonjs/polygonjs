/**
 * A subnet to create audio nodes
 *
 */

import {ParamLessBaseNetworkSopNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {AudioNodeChildrenMap} from '../../poly/registers/nodes/Audio';
import {BaseAnimNodeType} from '../anim/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class AudioNetworkSopNode extends ParamLessBaseNetworkSopNode {
	static override type() {
		return NetworkNodeType.AUDIO;
	}

	protected override _childrenControllerContext = NodeContext.AUDIO;

	override createNode<S extends keyof AudioNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): AudioNodeChildrenMap[S];
	override createNode<K extends valueof<AudioNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<AudioNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseAnimNodeType[];
	}
	override nodesByType<K extends keyof AudioNodeChildrenMap>(type: K): AudioNodeChildrenMap[K][] {
		return super.nodesByType(type) as AudioNodeChildrenMap[K][];
	}
}
