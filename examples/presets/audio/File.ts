import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {FileAudioNode} from '../../../src/engine/nodes/audio/File';

export function FileAudioNodePresets() {
	return {
		ambient_mp3: function (node: FileAudioNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/audio/Thrystero_Diagonal-160.mp3`);
		},
		ambient_ogg: function (node: FileAudioNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/audio/Thrystero_Diagonal-160.ogg`);
		},
		helicopter_ogg: function (node: FileAudioNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/audio/497848__amaida1__helicopter-sound.ogg`);
		},
		helicopter_wav: function (node: FileAudioNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/audio/497848__amaida1__helicopter-sound.wav`);
		},
	};
}
