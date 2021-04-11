import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkMatParamsConfig extends NodeParamsConfig {}
export class BaseNetworkMatNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.MAT, K> {
	static context(): NodeContext {
		return NodeContext.MAT;
	}
	cook() {
		this.cookController.endCook();
	}
}
export class ParamLessBaseNetworkMatNode extends BaseNetworkMatNode<ParamLessNetworkMatParamsConfig> {}
