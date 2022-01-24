import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkEventParamsConfig extends NodeParamsConfig {}
export class BaseNetworkEventNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.EVENT, K> {
	static override context(): NodeContext {
		return NodeContext.EVENT;
	}
	override cook() {
		this.cookController.endCook();
	}
}
export class ParamLessBaseNetworkEventNode extends BaseNetworkEventNode<ParamLessNetworkEventParamsConfig> {}
