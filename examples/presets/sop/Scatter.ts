import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {ScatterSopNode} from '../../../src/engine/nodes/sop/Scatter';

const scatterSopNodePresetsCollectionFactory: PresetsCollectionFactory<ScatterSopNode> = (node: ScatterSopNode) => {
	const collection = new NodePresetsCollection();

	[2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((i, k) => {
		const size = 2 ** i;
		const preset = new BasePreset().addEntry(node.p.pointsCount, `${size} * ${size}`);
		collection.addPreset(`${k + 1}: ${size}x${size} (=${size * size})`, preset);
	});
	return collection;
};
export const scatterSopPresetRegister: PresetRegister<typeof ScatterSopNode, ScatterSopNode> = {
	nodeClass: ScatterSopNode,
	setupFunc: scatterSopNodePresetsCollectionFactory,
};
