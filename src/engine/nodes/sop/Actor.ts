/**
 * Assigns actor nodes to input objects
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {ActorsManager} from '../../../core/actor/ActorsManager';
class ActorSopParamsConfig extends NodeParamsConfig {
	/** @param actor node */
	actor = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.ACTOR,
		},
		dependentOnFoundNode: false,
	});
}
const ParamsConfig = new ActorSopParamsConfig();

export class ActorSopNode extends TypedSopNode<ActorSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'actor';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.objects();

		const actorNode = this.pv.actor.nodeWithContext(NodeContext.ACTOR, this.states?.error);
		if (actorNode) {
			const container = await actorNode.compute();
			const actorBuilder = container.coreContent();
			if (actorBuilder) {
				for (let object of objects) {
					ActorsManager.assignActorBuilder(object, actorBuilder);
				}
			}

			this.setCoreGroup(coreGroup);
		}
	}
}
