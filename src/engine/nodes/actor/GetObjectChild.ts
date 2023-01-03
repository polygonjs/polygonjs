/**
 * get a child object
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
import {ParamType} from '../../poly/ParamType';

class GetObjectChildActorParamsConfig extends NodeParamsConfig {
	/** @param child index */
	index = ParamConfig.INTEGER(0, {
		range: [0, 9],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new GetObjectChildActorParamsConfig();

export class GetObjectChildActorNode extends TypedActorNode<GetObjectChildActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getObjectChild';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('object3D', ActorConnectionPointType.OBJECT_3D),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType.OBJECT_3D] {
		const index = this._inputValueFromParam<ParamType.INTEGER>(this.p.index, context);
		return context.Object3D.children[index];
	}
}
