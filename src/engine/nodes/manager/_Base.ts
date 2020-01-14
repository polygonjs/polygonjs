import {TypedNode} from '../_Base';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ManagerContainer} from 'src/engine/containers/Manager';

export class TypedNodeManager<K extends NodeParamsConfig> extends TypedNode<'MANAGER', K> {
	container_controller: TypedContainerController<ManagerContainer> = new TypedContainerController<ManagerContainer>(
		this,
		ManagerContainer
	);

	static node_context(): NodeContext {
		return NodeContext.MANAGER;
	}
}
