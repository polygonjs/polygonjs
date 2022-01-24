import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedNode} from '../_Base';

class ParamLessNetworkAudioParamsConfig extends NodeParamsConfig {}
export class BaseNetworkAudioNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.AUDIO, K> {
	static override context(): NodeContext {
		return NodeContext.AUDIO;
	}
	override cook() {
		this.cookController.endCook();
	}
}
export class ParamLessBaseNetworkAudioNode extends BaseNetworkAudioNode<ParamLessNetworkAudioParamsConfig> {}
