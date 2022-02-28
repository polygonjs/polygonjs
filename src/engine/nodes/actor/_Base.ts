import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerB} from '../utils/FlagsController';
import {ActorBuilder} from '../../../core/actor/ActorBuilder';
import {Object3D} from 'three/src/core/Object3D';

const INPUT_NAME = 'input actor behaviors';
const DEFAULT_INPUT_NAMES = [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];

/**
 * BaseActorNode is the base class for all nodes that create behaviors. This inherits from [BaseNode](/docs/api/BaseNode).
 *
 */
export class TypedActorNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ACTOR, K> {
	public override readonly flags: FlagsControllerB = new FlagsControllerB(this);

	static override context(): NodeContext {
		return NodeContext.ACTOR;
	}

	static override displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	override initializeBaseNode() {
		this.io.outputs.setHasOneOutput();
	}
	protected setActorBuilder(actorBuilder: ActorBuilder) {
		this._setContainer(actorBuilder);
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.set_depends_on_inputs(false);
	}

	override cook(actorBuilders: ActorBuilder[]) {
		const actorBuilder = actorBuilders[0] || new ActorBuilder();
		actorBuilder.addProcessor(this);

		this.setActorBuilder(actorBuilder);
	}
	processActor(object: Object3D) {}
}

export type BaseActorNodeType = TypedActorNode<NodeParamsConfig>;
export class BaseActorNodeClass extends TypedActorNode<NodeParamsConfig> {}
