import { BaseNodeClass } from '../../../nodes/_Base';
import { BaseOperation } from '../../../../core/operations/_Base';
import { NodeContext } from '../../NodeContext';
export interface RegisterOptions {
    only?: string[];
    except?: string[];
    user_allowed?: boolean;
}
export declare type BaseNodeConstructor = typeof BaseNodeClass;
declare type NodeConstructorByType = Map<string, BaseNodeConstructor>;
declare type NodeConstructorByTypeByContext = Map<NodeContext, NodeConstructorByType>;
export declare type BaseOperationConstructor = typeof BaseOperation;
export declare class NodesRegister {
    private _node_register;
    private _node_register_categories;
    private _node_register_options;
    register_node(node: BaseNodeConstructor, tab_menu_category?: string, options?: RegisterOptions): void;
    deregister_node(context: NodeContext, node_type: string): void;
    registered_nodes_for_context_and_parent_type(context: NodeContext, parent_node_type: string): (typeof BaseNodeClass)[];
    registered_nodes(context: NodeContext, parent_node_type: string): Dictionary<BaseNodeConstructor>;
    registered_category(context: NodeContext, type: string): string | undefined;
    map(): NodeConstructorByTypeByContext;
}
export declare class OperationsRegister {
    private _operation_register;
    register_operation(operation: BaseOperationConstructor): void;
    registered_operations_for_context_and_parent_type(context: NodeContext, parent_node_type: string): (typeof BaseOperation)[];
    registered_operation(context: NodeContext, operation_type: string): BaseOperationConstructor | undefined;
}
export {};
