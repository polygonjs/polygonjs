/**
 * A subnet to create Audio nodes
 *
 */

import {ParamLessBaseNetworkAudioNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {AudioNodeChildrenMap} from '../../poly/registers/nodes/Audio';
import {BaseAudioNodeType} from './_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class CopNetworkAudioNode extends ParamLessBaseNetworkAudioNode {
	static override type() {
		return NetworkNodeType.COP;
	}

	protected override _childrenControllerContext = NodeContext.COP;

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
		return super.children() as BaseAudioNodeType[];
	}
	override nodesByType<K extends keyof AudioNodeChildrenMap>(type: K): AudioNodeChildrenMap[K][] {
		return super.nodesByType(type) as AudioNodeChildrenMap[K][];
	}
}
