/**
 * A subnet to create audio nodes
 *
 */

import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {AudioNodeChildrenMap} from '../../poly/registers/nodes/Audio';
import {BaseAudioNodeType} from '../audio/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {ObjNodeRenderOrder} from './_Base';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

class BaseAudioObjNode extends ParamLessBaseManagerObjNode {
	static type() {
		return NetworkNodeType.AUDIO;
	}

	protected _childrenControllerContext = NodeContext.AUDIO;

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
export class AudioNetworkObjNode extends BaseAudioObjNode {
	public readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
}
