/**
 * get an object property
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
class GetObjectPropertyActorParamsConfig extends NodeParamsConfig {
	/** @param object mask */
	mask = ParamConfig.STRING('');
}
const ParamsConfig = new GetObjectPropertyActorParamsConfig();

export class GetObjectPropertyActorNode extends TypedActorNode<GetObjectPropertyActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getObjectProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(ActorConnectionPointType.OBJECT_3D, ActorConnectionPointType.OBJECT_3D),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('position', ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint('scale', ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint('visible', ActorConnectionPointType.BOOLEAN),
			new ActorConnectionPoint('matrixAutoUpdate', ActorConnectionPointType.BOOLEAN),
		]);
	}
}
