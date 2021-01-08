import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkSopParamsConfig extends NodeParamsConfig {}
export class BaseNetworkSopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.SOP, K> {
	static node_context(): NodeContext {
		return NodeContext.SOP;
	}
	// initialize_base_node() {
	// 	this.children_controller?.init({dependent: false});
	// }
	cook() {
		this.cook_controller.end_cook();
	}
}
export class ParamLessBaseNetworkSopNode extends BaseNetworkSopNode<ParamLessNetworkSopParamsConfig> {}
