import {SpotLightSopNode} from '../../../src/engine/nodes/sop/SpotLight';
import {PolyDictionary} from '../../../src/types/GlobalTypes';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const shadowSizePowers = [5, 6, 7, 8, 9, 10, 11];

const spotLightSopNodePresetsCollectionFactory: PresetsCollectionFactory<SpotLightSopNode> = (
	node: SpotLightSopNode
) => {
	const collection = new NodePresetsCollection();

	const presetsByName: PolyDictionary<BasePreset> = {};
	for (let i = 0; i < shadowSizePowers.length; i++) {
		const shadowSizePower = shadowSizePowers[i];
		const shadowSize = 2 ** shadowSizePower;
		const powerAlphabetical = `${shadowSizePower}`.padStart(2, '0');
		const preset = new BasePreset().addEntry(node.p.shadowRes, [shadowSize, shadowSize]);
		const presetName = `shadow resolution: 2^${powerAlphabetical} ( ${shadowSize} x ${shadowSize} )`;
		presetsByName[presetName] = preset;
	}

	collection.setPresets(presetsByName);

	return collection;
};
export const spotLightSopPresetRegister: PresetRegister<typeof SpotLightSopNode, SpotLightSopNode> = {
	nodeClass: SpotLightSopNode,
	setupFunc: spotLightSopNodePresetsCollectionFactory,
};
