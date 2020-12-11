import { TypedNode } from '../nodes/_Base';
import { ContainableMap } from './utils/ContainableMap';
import { NodeContext } from '../poly/NodeContext';
export declare abstract class TypedContainer<NC extends NodeContext> {
    protected _node: TypedNode<NC, any>;
    protected _content: ContainableMap[NC];
    constructor(_node: TypedNode<NC, any>);
    set_node(node: TypedNode<NC, any>): void;
    node(): TypedNode<NC, any>;
    set_content(content: ContainableMap[NC]): void;
    has_content(): boolean;
    content(): ContainableMap[NC];
    protected _post_set_content(): void;
    core_content(): ContainableMap[NC] | undefined;
    core_content_cloned(): ContainableMap[NC] | undefined;
    infos(): any;
}
export declare class BaseContainer extends TypedContainer<any> {
}
