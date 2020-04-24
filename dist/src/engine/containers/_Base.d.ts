import { BaseNodeType } from '../nodes/_Base';
import { ContainableMap } from './utils/ContainableMap';
declare type K = keyof ContainableMap;
declare type Containable = ContainableMap[K];
export declare abstract class TypedContainer<T extends Containable> {
    protected _node: BaseNodeType;
    protected _content: T;
    constructor(_node: BaseNodeType);
    set_node(node: BaseNodeType): void;
    node(): BaseNodeType;
    reset_caches(): void;
    set_content(content: T): void;
    has_content(): boolean;
    content(): T;
    protected _post_set_content(): void;
    core_content(): T | undefined;
    core_content_cloned(): T | undefined;
    infos(): any;
}
export declare class BaseContainer extends TypedContainer<any> {
}
export {};
