import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkActorParamsConfig extends NodeParamsConfig {}
export class BaseNetworkActorNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ACTOR, K> {
	static override context(): NodeContext {
		return NodeContext.ACTOR;
	}
	// initializeBaseNode() {
	// 	this.children_controller?.init({dependent: false});
	// }
	override cook() {
		this.cookController.endCook();
	}
}
export class ParamLessBaseNetworkActorNode extends BaseNetworkActorNode<ParamLessNetworkActorParamsConfig> {}
