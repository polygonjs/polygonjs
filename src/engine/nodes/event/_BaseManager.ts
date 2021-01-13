import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkEventParamsConfig extends NodeParamsConfig {}
export class BaseNetworkEventNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.EVENT, K> {
	static nodeContext(): NodeContext {
		return NodeContext.EVENT;
	}
	cook() {
		this.cookController.end_cook();
	}
}
export class ParamLessBaseNetworkEventNode extends BaseNetworkEventNode<ParamLessNetworkEventParamsConfig> {}
