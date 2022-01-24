import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkCopParamsConfig extends NodeParamsConfig {}
export class BaseNetworkCopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.COP, K> {
	static override context(): NodeContext {
		return NodeContext.COP;
	}
	override cook() {
		this.cookController.endCook();
	}
}
export class ParamLessBaseNetworkCopNode extends BaseNetworkCopNode<ParamLessNetworkCopParamsConfig> {}
