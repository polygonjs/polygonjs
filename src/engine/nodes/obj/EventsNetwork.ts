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
import {ParamsInitData} from '../utils/io/IOController';
import {Constructor, valueof} from '../../../types/GlobalTypes';

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
		params_init_value_overrides?: ParamsInitData
	): EventNodeChildrenMap[S];
	createNode<K extends valueof<EventNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<EventNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseEventNodeType[];
	}
	nodesByType<K extends keyof EventNodeChildrenMap>(type: K): EventNodeChildrenMap[K][] {
		return super.nodesByType(type) as EventNodeChildrenMap[K][];
	}
}
