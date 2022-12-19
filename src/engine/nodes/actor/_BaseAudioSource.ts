import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {NodeContext} from '../../poly/NodeContext';

import {Player} from 'tone/build/esm/source/buffer/Player';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PauseAudioSourceActorParamsConfig extends NodeParamsConfig {
	/** @param audio node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
		},
		// dependentOnFoundNode: false,
	});
}
const ParamsConfig = new PauseAudioSourceActorParamsConfig();

export abstract class BaseAudioSourceActorNode extends TypedActorNode<PauseAudioSourceActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	protected _sourcePlayerContext: ActorNodeTriggerContext | undefined;
	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const audioNode = this.pv.node.nodeWithContext(NodeContext.AUDIO, this.states?.error);
		if (!audioNode) {
			return;
		}
		audioNode.compute().then((container) => {
			const audioBuilder = container.coreContent();
			if (!audioBuilder) {
				return;
			}
			this.states.error.clear();
			const source = audioBuilder.source();
			if (!source) {
				this.states.error.set('no audio source found');
				return;
			}
			if (!(source instanceof Player)) {
				this.states.error.set('source is not a player');
				return;
			}
			this._sourcePlayerContext = context;

			this.onSourceFound(source, context);
		});
	}
	abstract onSourceFound(source: Player, context: ActorNodeTriggerContext): void;
}
