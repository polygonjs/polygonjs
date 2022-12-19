/**
 * Pause an audio source
 *
 *
 */
import {ActorNodeTriggerContext} from './_Base';
import {Player} from 'tone/build/esm/source/buffer/Player';
import {BaseAudioSourceActorNode} from './_BaseAudioSource';

export class PauseAudioSourceActorNode extends BaseAudioSourceActorNode {
	static override type() {
		return 'pauseAudioSource';
	}

	onSourceFound(source: Player, context: ActorNodeTriggerContext) {
		source.stop();
		this.runTrigger(context);
	}
}
