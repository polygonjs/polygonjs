/**
 * get an object
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
class GetObjectActorParamsConfig extends NodeParamsConfig {
	/** @param use current object */
	getCurrentObject = ParamConfig.BOOLEAN(1);
	/** @param object mask */
	mask = ParamConfig.STRING('', {
		visibleIf: {
			getCurrentObject: 0,
		},
	});
}
const ParamsConfig = new GetObjectActorParamsConfig();

export class GetObjectActorNode extends TypedActorNode<GetObjectActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getObject';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint('mask', ActorConnectionPointType.STRING),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('object3D', ActorConnectionPointType.OBJECT_3D),
		]);
	}
}
