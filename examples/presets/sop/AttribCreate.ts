import {AttribCreateSopNode} from '../../../src/engine/nodes/sop/AttribCreate';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const attribCreateSopNodePresetsCollectionFactory: PresetsCollectionFactory<AttribCreateSopNode> = (
	node: AttribCreateSopNode
) => {
	const collection = new NodePresetsCollection();

	const id = new BasePreset().addEntry(node.p.name, 'id').addEntry(node.p.value1, '@ptnum');
	const pti = new BasePreset().addEntry(node.p.name, 'pti').addEntry(node.p.value1, '@ptnum / (pointsCount(0)-1)');
	const bbx = new BasePreset()
		.addEntry(node.p.name, 'bbx')
		.addEntry(node.p.value1, `(@P.x - bbox(0, 'min').x) / bbox(0,'size').x`);
	const bby = new BasePreset()
		.addEntry(node.p.name, 'bby')
		.addEntry(node.p.value1, `(@P.y - bbox(0, 'min').y) / bbox(0,'size').y`);
	const bbz = new BasePreset()
		.addEntry(node.p.name, 'bbz')
		.addEntry(node.p.value1, `(@P.z - bbox(0, 'min').z) / bbox(0,'size').z`);
	const randomId = new BasePreset()
		.addEntry(node.p.name, 'randomId')
		.addEntry(node.p.value1, `10000 * rand(@ptnum * 124.543)`);

	collection.setPresets({
		id,
		pti,
		bbx,
		bby,
		bbz,
		randomId,
	});

	return collection;
};
export const attribCreateSopPresetRegister: PresetRegister<typeof AttribCreateSopNode, AttribCreateSopNode> = {
	nodeClass: AttribCreateSopNode,
	setupFunc: attribCreateSopNodePresetsCollectionFactory,
};
