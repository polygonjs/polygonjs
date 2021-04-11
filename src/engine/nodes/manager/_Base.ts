import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
export class TypedBaseManagerNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.MANAGER, K> {
	static context(): NodeContext {
		return NodeContext.MANAGER;
	}
}

export type BaseManagerNodeType = TypedBaseManagerNode<any>;
export class BaseManagerNodeClass extends TypedBaseManagerNode<any> {}
