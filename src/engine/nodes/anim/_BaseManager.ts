import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkAnimParamsConfig extends NodeParamsConfig {}
export class BaseNetworkAnimNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ANIM, K> {
	static override context(): NodeContext {
		return NodeContext.ANIM;
	}
	override cook() {
		this.cookController.endCook();
	}
}
export class ParamLessBaseNetworkAnimNode extends BaseNetworkAnimNode<ParamLessNetworkAnimParamsConfig> {}
