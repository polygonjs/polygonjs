/**
 * returns a non-deterministic random value
 *
 *
 *
 */
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';

enum RandomActorNodeInputName {
	random = 'random',
}

class RandomActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new RandomActorParamsConfig();

export class RandomActorNode extends TypedActorNode<RandomActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'random';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(RandomActorNodeInputName.random, ActorConnectionPointType.FLOAT),
		]);
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		return Math.random();
	}
}
