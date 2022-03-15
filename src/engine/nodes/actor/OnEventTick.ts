/**
 * sends a trigger on every frame
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';

enum OnEventTickActorNodeOuput {
	TIME = 'time',
	DELTA = 'delta',
}

class OnEventTickActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnEventTickActorParamsConfig();

export class OnEventTickActorNode extends TypedActorNode<OnEventTickActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_EVENT_TICK;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
			new ActorConnectionPoint(OnEventTickActorNodeOuput.TIME, ActorConnectionPointType.FLOAT),
			new ActorConnectionPoint(OnEventTickActorNodeOuput.DELTA, ActorConnectionPointType.FLOAT),
		]);
	}

	public override outputValue(inputName: string): number {
		switch (inputName as OnEventTickActorNodeOuput) {
			case OnEventTickActorNodeOuput.TIME: {
				return this.scene().timeController.time();
			}
			case OnEventTickActorNodeOuput.DELTA: {
				return this.scene().timeController.timeDelta();
			}
		}
		return -1;
	}
}
