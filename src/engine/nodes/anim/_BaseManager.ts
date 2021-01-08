import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkAnimParamsConfig extends NodeParamsConfig {}
export class BaseNetworkAnimNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ANIM, K> {
	static node_context(): NodeContext {
		return NodeContext.ANIM;
	}
	cook() {
		this.cook_controller.end_cook();
	}
}
export class ParamLessBaseNetworkAnimNode extends BaseNetworkAnimNode<ParamLessNetworkAnimParamsConfig> {}
