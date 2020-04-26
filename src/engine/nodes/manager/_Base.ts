import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
export class TypedBaseManagerNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.MANAGER, K> {
	static node_context(): NodeContext {
		return NodeContext.MANAGER;
	}
	// node_sibbling(name: string): BaseManagerNodeType | null {
	// 	return super.node_sibbling(name) as BaseManagerNodeType | null;
	// }
}

export type BaseManagerNodeType = TypedBaseManagerNode<any>;
export class BaseManagerNodeClass extends TypedBaseManagerNode<any> {}
