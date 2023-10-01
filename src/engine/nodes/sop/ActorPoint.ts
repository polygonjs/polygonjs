/**
 * Assigns actor nodes to input objects
 *
 *
 */

import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NetworkNodeType} from '../../poly/NodeContext';
import {filterObjectsWithGroup} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {TypedActorSopNode} from './_BaseActor';
import {isBooleanTrue} from '../../../core/Type';
import {ActorBuilderNode} from '../../scene/utils/ActorsManager';
import {InputCloneMode} from '../../poly/InputCloneMode';
class ActorPointSopParamsConfig extends NodeParamsConfig {
	/** @param select which objects this applies the actor behavior to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param build actor from child nodes */
	useThisNode = ParamConfig.BOOLEAN(1, {
		separatorAfter: true,
	});
	/** @param actor node */
	node = ParamConfig.NODE_PATH('', {
		visibleIf: {useThisNode: 0},
		nodeSelection: {
			types: [NetworkNodeType.ACTOR],
		},
		dependentOnFoundNode: false,
		separatorAfter: true,
	});
}
const ParamsConfig = new ActorPointSopParamsConfig();

export class ActorPointSopNode extends TypedActorSopNode<ActorPointSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ACTOR_POINT;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		// compile
		this.compilationController.compileIfRequired();

		//
		const coreGroup = inputCoreGroups[0];
		const objects = filterObjectsWithGroup(coreGroup, this.pv);
		const actorNode = await this._findActorNode();
		if (actorNode) {
				for (const object of objects) {
					this.scene().actorsManager.assignActorBuilder(object, actorNode);
				}
		}

		this.setCoreGroup(coreGroup);
	}
	private async _findActorNode() {
		if (isBooleanTrue(this.pv.useThisNode)) {
			return this;
		} else {
			const node = this.pv.node.node() as ActorBuilderNode | undefined;
			if (node) {
				await node.compute();
			}
			return node;
		}
	}
}
