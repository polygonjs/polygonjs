import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkPostParamsConfig extends NodeParamsConfig {}
export class BaseNetworkPostNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.POST, K> {
	static node_context(): NodeContext {
		return NodeContext.POST;
	}
	cook() {
		this.cook_controller.end_cook();
	}
}
export class ParamLessBaseNetworkPostNode extends BaseNetworkPostNode<ParamLessNetworkPostParamsConfig> {}
