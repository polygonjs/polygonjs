/**
 * Play an audio source
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {NodeContext} from '../../poly/NodeContext';
import {AudioPlayerCallbacksManager} from './../../../core/audio/PlayerCallbacksManager';
import {Player} from 'tone/build/esm/source/buffer/Player';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PlayAudioSourceActorParamsConfig extends NodeParamsConfig {
	/** @param audio node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
		},
		// dependentOnFoundNode: false,
	});
}
const ParamsConfig = new PlayAudioSourceActorParamsConfig();

export class PlayAudioSourceActorNode extends TypedActorNode<PlayAudioSourceActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'playAudioSource';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}
	private _sourcePlayer: Player | undefined;
	private _sourcePlayerContext: ActorNodeTriggerContext | undefined;
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
			this._sourcePlayer = source;
			this._sourcePlayerContext = context;
			this._addPlayerEvent(source);
			source.start();
		});
	}

	override dispose(): void {
		super.dispose();
		this._removePlayerEvent();
	}
	private _addPlayerEvent(sourcePlayer: Player) {
		AudioPlayerCallbacksManager.onStop(sourcePlayer, this._onSourcePlayerStopBound);
	}
	private _removePlayerEvent() {
		if (!this._sourcePlayer) {
			return;
		}
		AudioPlayerCallbacksManager.removeOnStop(this._sourcePlayer, this._onSourcePlayerStopBound);
	}
	private _onSourcePlayerStopBound = this._onSourcePlayerStop.bind(this);
	private _onSourcePlayerStop() {
		if (!this._sourcePlayerContext) {
			return;
		}
		this.runTrigger(this._sourcePlayerContext);
	}
}
