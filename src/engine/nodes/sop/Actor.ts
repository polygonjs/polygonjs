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
import {ActorNodeChildrenMap} from '../../poly/registers/nodes/Actor';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseActorNodeType} from '../actor/_Base';
import {isBooleanTrue} from '../../../core/Type';
import {ActorBuilderNode} from '../../scene/utils/ActorsManager';
// import {ActorsManager} from '../../../core/actor/ActorsManager';
class ActorSopParamsConfig extends NodeParamsConfig {
	/** @param build actor from child nodes */
	useChildNodes = ParamConfig.BOOLEAN(1);
	/** @param actor node */
	node = ParamConfig.NODE_PATH('', {
		visibleIf: {useChildNodes: 0},
		// nodeSelection: {
		// 	// context: NodeContext.ACTOR,
		// },
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

		const actorNode = this._findActorNode();
		if (actorNode) {
			for (let object of objects) {
				this.scene().actorsManager.assignActorBuilder(object, actorNode);
			}
		}

		this.setCoreGroup(coreGroup);
	}
	private _findActorNode() {
		if (isBooleanTrue(this.pv.useChildNodes)) {
			return this;
		} else {
			return this.pv.node.nodeWithContext(NodeContext.ACTOR, this.states?.error) as ActorBuilderNode | undefined;
		}
	}

	//
	// CHILDREN
	//
	protected override _childrenControllerContext = NodeContext.ACTOR;
	override createNode<S extends keyof ActorNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): ActorNodeChildrenMap[S];
	override createNode<K extends valueof<ActorNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<ActorNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseActorNodeType[];
	}
	override nodesByType<K extends keyof ActorNodeChildrenMap>(type: K): ActorNodeChildrenMap[K][] {
		return super.nodesByType(type) as ActorNodeChildrenMap[K][];
	}
	override childrenAllowed() {
		return true;
	}
}
