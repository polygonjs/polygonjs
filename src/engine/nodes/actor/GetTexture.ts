/**
 * get a texture
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {NodeContext} from '../../poly/NodeContext';
import {CoreType} from '../../../core/Type';
import {BaseCopNodeType} from '../cop/_Base';
class GetTextureActorParamsConfig extends NodeParamsConfig {
	/** @param the material node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
		},
		dependentOnFoundNode: false,
		computeOnDirty: true,
	});
}
const ParamsConfig = new GetTextureActorParamsConfig();

export class GetTextureActorNode extends TypedActorNode<GetTextureActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getTexture';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint('mask', ActorConnectionPointType.STRING),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(ActorConnectionPointType.TEXTURE, ActorConnectionPointType.TEXTURE),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const textureNode = this.pv.node.nodeWithContext(NodeContext.COP, this.states?.error);

		if (textureNode && CoreType.isFunction((textureNode as BaseCopNodeType).__textureSync__)) {
			return textureNode.__textureSync__();
		}
	}
}
