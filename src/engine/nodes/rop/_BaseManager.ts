import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkRopParamsConfig extends NodeParamsConfig {}
export class BaseNetworkRopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ROP, K> {
	static override context(): NodeContext {
		return NodeContext.ROP;
	}
	override cook() {
		this.cookController.endCook();
	}
}
export class ParamLessBaseNetworkRopNode extends BaseNetworkRopNode<ParamLessNetworkRopParamsConfig> {}
