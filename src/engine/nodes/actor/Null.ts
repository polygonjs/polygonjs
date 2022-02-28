/**
 * Dummy node
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorBuilder} from '../../../core/actor/ActorBuilder';
class NullActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullActorParamsConfig();

export class NullActorNode extends TypedActorNode<NullActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'null';
	}

	override cook(actorBuilders: ActorBuilder[]) {
		const actorBuilder = actorBuilders[0] || new ActorBuilder();

		this.setActorBuilder(actorBuilder);
	}
}
