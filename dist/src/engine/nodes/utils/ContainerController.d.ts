import { BaseContainer, TypedContainer } from '../../containers/_Base';
import { BaseNodeType } from '../_Base';
export declare class TypedContainerController<T extends TypedContainer<any>> {
    protected node: BaseNodeType;
    private _callbacks;
    protected _container: T;
    constructor(node: BaseNodeType, container_class: typeof BaseContainer);
    get container(): T;
    request_container(): Promise<T>;
    process_container_request(): void;
    request_input_container(input_index: number): Promise<any>;
    notify_requesters(container?: T): void;
}
export declare class BaseContainerController extends TypedContainerController<any> {
}
