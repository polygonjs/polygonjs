import { TypedNode } from '../_Base';
import { NodeContext } from '../../poly/NodeContext';
import { ContainerMap } from '../../containers/utils/ContainerMap';
export declare class TypedContainerController<NC extends NodeContext> {
    protected node: TypedNode<NC, any>;
    private _callbacks;
    private _callbacks_tmp;
    protected _container: ContainerMap[NC];
    constructor(node: TypedNode<NC, any>);
    get container(): ContainerMap[NC];
    request_container(): Promise<ContainerMap[NC]> | ContainerMap[NC];
    process_container_request(): void;
    request_input_container(input_index: number): Promise<ContainerMap[NC] | null>;
    notify_requesters(container?: ContainerMap[NC]): void;
}
export declare class BaseContainerController extends TypedContainerController<any> {
}
