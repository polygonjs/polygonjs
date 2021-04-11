import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkSopParamsConfig extends NodeParamsConfig {}
export class BaseNetworkSopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.SOP, K> {
	static context(): NodeContext {
		return NodeContext.SOP;
	}
	// initializeBaseNode() {
	// 	this.children_controller?.init({dependent: false});
	// }
	cook() {
		this.cookController.endCook();
	}
}
export class ParamLessBaseNetworkSopNode extends BaseNetworkSopNode<ParamLessNetworkSopParamsConfig> {}
