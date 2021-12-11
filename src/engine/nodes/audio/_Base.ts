import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerB} from '../utils/FlagsController';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

const INPUT_NAME = 'input audio properties';
const DEFAULT_INPUT_NAMES = [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];

/**
 * BaseAnimNode is the base class for all nodes that process animations. This inherits from [BaseNode](/docs/api/BaseNode).
 *
 */
export class TypedAudioNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.AUDIO, K> {
	public readonly flags: FlagsControllerB = new FlagsControllerB(this);

	static context(): NodeContext {
		return NodeContext.AUDIO;
	}

	static displayedInputNames(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	initializeBaseNode() {
		this.io.outputs.setHasOneOutput();
	}
	protected setAudioBuilder(audioBuilder: AudioBuilder) {
		this._setContainer(audioBuilder);
	}
}

export type BaseAudioNodeType = TypedAudioNode<NodeParamsConfig>;
export class BaseAudioNodeClass extends TypedAudioNode<NodeParamsConfig> {}
