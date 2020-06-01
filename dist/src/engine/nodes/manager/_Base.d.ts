import { TypedNode } from '../_Base';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare class TypedBaseManagerNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.MANAGER, K> {
    static node_context(): NodeContext;
}
export declare type BaseManagerNodeType = TypedBaseManagerNode<any>;
export declare class BaseManagerNodeClass extends TypedBaseManagerNode<any> {
}
