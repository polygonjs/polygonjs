import {NormalsSopNode} from '../../../src/engine/nodes/sop/Normals';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const normalsSopNodePresetsCollectionFactory: PresetsCollectionFactory<NormalsSopNode> = (node: NormalsSopNode) => {
	const collection = new NodePresetsCollection();

	const positionToNormal = new BasePreset()
		.addEntry(node.p.updateX, true)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, true)
		.addEntry(node.p.x, '@P.x')
		.addEntry(node.p.y, '@P.y')
		.addEntry(node.p.z, '@P.z');

	collection.setPresets({
		positionToNormal,
	});

	return collection;
};
export const normalsSopPresetRegister: PresetRegister<typeof NormalsSopNode, NormalsSopNode> = {
	nodeClass: NormalsSopNode,
	setupFunc: normalsSopNodePresetsCollectionFactory,
};
