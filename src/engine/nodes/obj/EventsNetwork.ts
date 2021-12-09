/**
 * Parent for Event nodes
 *
 *
 */
import {ParamLessBaseManagerObjNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';
import {EventNodeChildrenMap} from '../../poly/registers/nodes/Event';
import {BaseEventNodeType} from '../event/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export class EventsNetworkObjNode extends ParamLessBaseManagerObjNode {
	public readonly renderOrder: number = ObjNodeRenderOrder.MANAGER;
	static type() {
		return NetworkNodeType.EVENT;
	}

	protected _childrenControllerContext = NodeContext.EVENT;
	// initializeNode() {
	// 	this.children_controller?.init({dependent: false});
	// }

	createNode<S extends keyof EventNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): EventNodeChildrenMap[S];
	createNode<K extends valueof<EventNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<EventNodeChildrenMap>>(node_class: Constructor<K>, options?: NodeCreateOptions): K {
		return super.createNode(node_class, options) as K;
	}
	children() {
		return super.children() as BaseEventNodeType[];
	}
	nodesByType<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][] {
		return super.nodesByType(type) as EventNodeChildrenMap[K][];
	}
}
