import { TypedNode } from '../_Base';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { FlagsController } from '../utils/FlagsController';
export declare class TypedRopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ROP, K> {
    static node_context(): NodeContext;
    readonly flags: FlagsController;
    initialize_base_node(): void;
    cook(): void;
}
export declare type BaseRopNodeType = TypedRopNode<NodeParamsConfig>;
export declare class BaseRopNodeClass extends TypedRopNode<NodeParamsConfig> {
}
