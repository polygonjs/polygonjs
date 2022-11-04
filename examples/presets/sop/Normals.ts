import {NormalsSopNode} from '../../../src/engine/nodes/sop/Normals';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const normalsSopNodePresetsCollectionFactory: PresetsCollectionFactory<NormalsSopNode> = (node: NormalsSopNode) => {
	const collection = new NodePresetsCollection();

	const positionToNormal = new BasePreset()
		.addEntry(node.p.edit, true)
		.addEntry(node.p.updateX, true)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, true)
		.addEntry(node.p.x, '@P.x')
		.addEntry(node.p.y, '@P.y')
		.addEntry(node.p.z, '@P.z');

	const x = new BasePreset()
		.addEntry(node.p.edit, true)
		.addEntry(node.p.updateX, true)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, true)
		.addEntry(node.p.x, 1)
		.addEntry(node.p.y, 0)
		.addEntry(node.p.z, 0);
	const y = new BasePreset()
		.addEntry(node.p.edit, true)
		.addEntry(node.p.updateX, true)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, true)
		.addEntry(node.p.x, 0)
		.addEntry(node.p.y, 1)
		.addEntry(node.p.z, 0);
	const z = new BasePreset()
		.addEntry(node.p.edit, true)
		.addEntry(node.p.updateX, true)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, true)
		.addEntry(node.p.x, 0)
		.addEntry(node.p.y, 0)
		.addEntry(node.p.z, 1);

	collection.setPresets({
		positionToNormal,
		x,
		y,
		z,
	});

	return collection;
};
export const normalsSopPresetRegister: PresetRegister<typeof NormalsSopNode, NormalsSopNode> = {
	nodeClass: NormalsSopNode,
	setupFunc: normalsSopNodePresetsCollectionFactory,
};
