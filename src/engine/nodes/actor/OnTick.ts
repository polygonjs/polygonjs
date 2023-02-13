/**
 * sends a trigger on every frame
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';

export enum OnTickActorNodeOuput {
	TIME = 'time',
	DELTA = 'delta',
}

class OnTickActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnTickActorParamsConfig();

export class OnTickActorNode extends TypedActorNode<OnTickActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_TICK;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
			new ActorConnectionPoint(OnTickActorNodeOuput.TIME, ActorConnectionPointType.FLOAT),
			new ActorConnectionPoint(OnTickActorNodeOuput.DELTA, ActorConnectionPointType.FLOAT),
		]);
	}

	public override outputValue(context: ActorNodeTriggerContext, outputName: string) {
		switch (outputName as OnTickActorNodeOuput) {
			case OnTickActorNodeOuput.TIME: {
				return this.scene().timeController.time();
			}
			case OnTickActorNodeOuput.DELTA: {
				return this.scene().timeController.delta();
			}
		}
	}
}
