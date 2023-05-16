import {DirectionalLightSopNode} from '../../../src/engine/nodes/sop/DirectionalLight';
import {PolyDictionary} from '../../../src/types/GlobalTypes';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const shadowSizePowers = [5, 6, 7, 8, 9, 10, 11];

const directionalLightSopNodePresetsCollectionFactory: PresetsCollectionFactory<DirectionalLightSopNode> = (
	node: DirectionalLightSopNode
) => {
	const collection = new NodePresetsCollection();

	const presetsByName: PolyDictionary<BasePreset> = {};
	for (let i = 0; i < shadowSizePowers.length; i++) {
		const shadowSizePower = shadowSizePowers[i];
		const shadowSize = 2 ** shadowSizePower;
		const preset = new BasePreset().addEntry(node.p.shadowRes, [shadowSize, shadowSize]);
		const presetName = `shadow resolution ${i}: 2^${shadowSize} (${shadowSize}x${shadowSize})`;
		presetsByName[presetName] = preset;
	}

	collection.setPresets(presetsByName);

	return collection;
};
export const directionalLightSopPresetRegister: PresetRegister<
	typeof DirectionalLightSopNode,
	DirectionalLightSopNode
> = {
	nodeClass: DirectionalLightSopNode,
	setupFunc: directionalLightSopNodePresetsCollectionFactory,
};
