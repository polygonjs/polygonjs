import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerB} from '../utils/FlagsController';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

/**
 *
 *
 * TypedAnimNode is the base class for all nodes that process animations. This inherits from [TypedNode](/docs/api/TypedNode).
 *
 */
export class TypedAudioNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.AUDIO, K> {
	public override readonly flags: FlagsControllerB = new FlagsControllerB(this);

	static override context(): NodeContext {
		return NodeContext.AUDIO;
	}

	override initializeBaseNode() {
		this.io.outputs.setHasOneOutput();
	}
	protected setAudioBuilder(audioBuilder: AudioBuilder) {
		this._setContainer(audioBuilder);
	}
}

export type BaseAudioNodeType = TypedAudioNode<NodeParamsConfig>;
export class BaseAudioNodeClass extends TypedAudioNode<NodeParamsConfig> {}
