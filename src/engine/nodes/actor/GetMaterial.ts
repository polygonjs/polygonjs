/**
 * get a material
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
class GetMaterialActorParamsConfig extends NodeParamsConfig {
	/** @param the material node */
	nodePath = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
		computeOnDirty: true,
	});
}
const ParamsConfig = new GetMaterialActorParamsConfig();

export class GetMaterialActorNode extends TypedActorNode<GetMaterialActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getMaterial';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint('mask', ActorConnectionPointType.STRING),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('material', ActorConnectionPointType.MATERIAL),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const materialNode = this.pv.nodePath.nodeWithContext(NodeContext.MAT, this.states?.error);
		if (materialNode) {
			return materialNode.material;
		}
		return -1;
	}
}
