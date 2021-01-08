import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkRopParamsConfig extends NodeParamsConfig {}
export class BaseNetworkRopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ROP, K> {
	static node_context(): NodeContext {
		return NodeContext.ROP;
	}
	cook() {
		this.cook_controller.end_cook();
	}
}
export class ParamLessBaseNetworkRopNode extends BaseNetworkRopNode<ParamLessNetworkRopParamsConfig> {}
