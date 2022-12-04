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

	const shortNames: string[] = [
		'177242__deleted-user-3277771__cinematic-impact.mp3',
		'33637__herbertboland__cinematicboomnorm.mp3',
		'492495__soundflakes__atmosphere-distant-moaning-01.mp3',
		'636301__discordantscraps__cyber-ghost-trick-7.mp3',
		'657826__the-sacha-rush__thoughtful-atmospheric-rapid-intro.mp3',
	];
	const shortPresets: Record<string, BasePreset> = {};
	for (let shortName of shortNames) {
		const preset = new BasePreset().addEntry(
			node.p.url,
			`${DEMO_ASSETS_ROOT_URL}/audio/resources/freesound/short/${shortName}`
		);
		const elements = shortName.split('.')[0].split('__');
		elements.shift();
		const shortShortName = elements.join('__');
		shortPresets[`freesound/${shortShortName}`] = preset;
	}

	collection.setPresets({
		ambient_mp3,
		ambient_ogg,
		helicopter_ogg,
		helicopter_wav,
		...shortPresets,
	});

	return collection;
};
export const fileAudioPresetRegister: PresetRegister<typeof FileAudioNode, FileAudioNode> = {
	nodeClass: FileAudioNode,
	setupFunc: fileAudioNodePresetsCollectionFactory,
};
