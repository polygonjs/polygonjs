import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {SamplerAudioNode} from '../../../src/engine/nodes/audio/Sampler';

const samplerAudioNodePresetsCollectionFactory: PresetsCollectionFactory<SamplerAudioNode> = (
	node: SamplerAudioNode
) => {
	const collection = new NodePresetsCollection();

	const tonejs_samples = new BasePreset().addEntry(
		node.p.baseUrl,
		`${DEMO_ASSETS_ROOT_URL}/audio/resources/tonejs.github.io/samples`
	);

	collection.setPresets({
		tonejs_samples,
	});

	return collection;
};
export const samplerAudioPresetRegister: PresetRegister<typeof SamplerAudioNode, SamplerAudioNode> = {
	nodeClass: SamplerAudioNode,
	setupFunc: samplerAudioNodePresetsCollectionFactory,
};
