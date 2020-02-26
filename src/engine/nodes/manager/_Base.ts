import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ManagerContainer} from '../../containers/Manager';

export class TypedBaseManagerNode<K extends NodeParamsConfig> extends TypedNode<'MANAGER', BaseManagerNodeType, K> {
	container_controller: TypedContainerController<ManagerContainer> = new TypedContainerController<ManagerContainer>(
		this,
		ManagerContainer
	);

	static node_context(): NodeContext {
		return NodeContext.MANAGER;
	}
}

export type BaseManagerNodeType = TypedBaseManagerNode<any>;
export class BaseManagerNodeClass extends TypedBaseManagerNode<any> {}
