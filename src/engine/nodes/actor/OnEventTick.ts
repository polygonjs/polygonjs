/**
 * sends a trigger on every frame
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
class OnEventTickActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnEventTickActorParamsConfig();

export class OnEventTickActorNode extends TypedActorNode<OnEventTickActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'onEventTick';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('trigger', ActorConnectionPointType.TRIGGER),
			new ActorConnectionPoint('time', ActorConnectionPointType.FLOAT),
			new ActorConnectionPoint('delta', ActorConnectionPointType.FLOAT),
		]);
	}
}
