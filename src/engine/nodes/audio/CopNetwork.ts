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
	static type() {
		return NetworkNodeType.COP;
	}

	protected _childrenControllerContext = NodeContext.COP;

	createNode<S extends keyof AudioNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): AudioNodeChildrenMap[S];
	createNode<K extends valueof<AudioNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<AudioNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K {
		return super.createNode(node_class, options) as K;
	}
	children() {
		return super.children() as BaseAudioNodeType[];
	}
	nodesByType<K extends keyof AudioNodeChildrenMap>(type: K): AudioNodeChildrenMap[K][] {
		return super.nodesByType(type) as AudioNodeChildrenMap[K][];
	}
}
