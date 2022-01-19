import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {FileAudioNode} from '../../../src/engine/nodes/audio/File';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const fileAudioNodePresetsCollectionFactory: PresetsCollectionFactory<FileAudioNode> = (node: FileAudioNode) => {
	const collection = new NodePresetsCollection();

	const ambient_mp3 = new BasePreset().addEntry(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/audio/Thrystero_Diagonal-160.mp3`
	);
	const ambient_ogg = new BasePreset().addEntry(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/audio/Thrystero_Diagonal-160.ogg`
	);
	const helicopter_ogg = new BasePreset().addEntry(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/audio/497848__amaida1__helicopter-sound.ogg`
	);
	const helicopter_wav = new BasePreset().addEntry(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/audio/497848__amaida1__helicopter-sound.wav`
	);

	collection.setPresets({
		ambient_mp3,
		ambient_ogg,
		helicopter_ogg,
		helicopter_wav,
	});

	return collection;
};
export const fileAudioPresetRegister: PresetRegister<typeof FileAudioNode, FileAudioNode> = {
	nodeClass: FileAudioNode,
	setupFunc: fileAudioNodePresetsCollectionFactory,
};
