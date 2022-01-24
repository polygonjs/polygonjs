import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';
import {AudioBuilder} from '../../core/audio/AudioBuilder';

export class AudioContainer extends TypedContainer<NodeContext.AUDIO> {
	setContent(content: ContainableMap[NodeContext.AUDIO]) {
		super.set_content(content);
	}
	setAudioBuilder(audioBuilder: AudioBuilder) {
		return this.set_content(audioBuilder);
	}
	audioBuilder() {
		return this.content();
	}

	override coreContentCloned() {
		if (this._content) {
			return this._content.clone();
		}
	}
}
