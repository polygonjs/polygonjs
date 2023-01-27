import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerB} from '../utils/FlagsController';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

const INPUT_GEOMETRY_NAME = 'input animation clip';
const DEFAULT_INPUT_NAMES = [INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME];

/**
 *
 * # [API](/docs/api) / TypedAnimNode
 *
 * TypedAnimNode is the base class for all nodes that process animations. This inherits from [TypedNode](/docs/api/TypedNode).
 *
 */
export class TypedAnimNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ANIM, K> {
	public override readonly flags: FlagsControllerB = new FlagsControllerB(this);

	static override context(): NodeContext {
		return NodeContext.ANIM;
	}

	static override displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	override initializeBaseNode() {
		this.io.outputs.setHasOneOutput();
	}
	protected setTimelineBuilder(timeline_builder: TimelineBuilder) {
		this._setContainer(timeline_builder);
	}
}

export type BaseAnimNodeType = TypedAnimNode<NodeParamsConfig>;
export class BaseAnimNodeClass extends TypedAnimNode<NodeParamsConfig> {}
