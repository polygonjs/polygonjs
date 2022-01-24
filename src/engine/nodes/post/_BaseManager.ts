import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkPostParamsConfig extends NodeParamsConfig {}
export class BaseNetworkPostNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.POST, K> {
	static override context(): NodeContext {
		return NodeContext.POST;
	}
	override cook() {
		this.cookController.endCook();
	}
}
export class ParamLessBaseNetworkPostNode extends BaseNetworkPostNode<ParamLessNetworkPostParamsConfig> {}
