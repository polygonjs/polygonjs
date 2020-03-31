import { TypedNode } from '../_Base';
import { NodeContext } from '../../poly/NodeContext';
import { TypedContainerController } from '../utils/ContainerController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ManagerContainer } from '../../containers/Manager';
export declare class TypedBaseManagerNode<K extends NodeParamsConfig> extends TypedNode<'MANAGER', BaseManagerNodeType, K> {
    container_controller: TypedContainerController<ManagerContainer>;
    static node_context(): NodeContext;
}
export declare type BaseManagerNodeType = TypedBaseManagerNode<any>;
export declare class BaseManagerNodeClass extends TypedBaseManagerNode<any> {
}
