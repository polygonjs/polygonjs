// /**
//  * applies a ToDestination
//  *
//  *
//  */

// import {TypedAudioNode} from './_Base';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {AudioBuilder} from '../../../core/audio/AudioBuilder';
// import {ToneAudioNode} from 'tone/build/esm/core/context/ToneAudioNode';
// class ToDestinationAudioParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new ToDestinationAudioParamsConfig();

// export class ToDestinationAudioNode extends TypedAudioNode<ToDestinationAudioParamsConfig> {
// 	paramsConfig = ParamsConfig;
// 	static type() {
// 		return 'ToDestination';
// 	}

// 	initializeNode() {
// 		this.io.inputs.setCount(1);
// 	}

// 	private _previousAudioNode: ToneAudioNode | undefined;
// 	cook(inputContents: AudioBuilder[]) {
// 		const audioBuilder = inputContents[0];

// 		const audioNode = audioBuilder.audioNode();
// 		if (!audioNode) {
// 			this.states.error.set('no audioNode in input');
// 			this.cookController.endCook();
// 			return;
// 		}
// 		if (this._previousAudioNode) {
// 			this._previousAudioNode.disconnect(this._previousAudioNode.context.destination);
// 		}
// 		audioNode.toDestination();
// 		this._previousAudioNode = audioNode;

// 		this.setAudioBuilder(audioBuilder);
// 	}
// }
