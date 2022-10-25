import {AttribCreateSopNode} from '../../../src/engine/nodes/sop/AttribCreate';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const attribCreateSopNodePresetsCollectionFactory: PresetsCollectionFactory<AttribCreateSopNode> = (
	node: AttribCreateSopNode
) => {
	const collection = new NodePresetsCollection();

	function _size1() {
		return new BasePreset().addEntry(node.p.size, 1);
	}
	function _size3() {
		return new BasePreset().addEntry(node.p.size, 3);
	}

	const id = _size1().addEntry(node.p.name, 'id').addEntry(node.p.value1, '@ptnum');
	const pti = _size1().addEntry(node.p.name, 'pti').addEntry(node.p.value1, '@ptnum / (pointsCount(0)-1)');
	const bbx = _size1()
		.addEntry(node.p.name, 'bbx')
		.addEntry(node.p.value1, `(@P.x - bbox(0, 'min').x) / bbox(0,'size').x`);
	const bby = _size1()
		.addEntry(node.p.name, 'bby')
		.addEntry(node.p.value1, `(@P.y - bbox(0, 'min').y) / bbox(0,'size').y`);
	const bbz = _size1()
		.addEntry(node.p.name, 'bbz')
		.addEntry(node.p.value1, `(@P.z - bbox(0, 'min').z) / bbox(0,'size').z`);
	const randomId = _size1()
		.addEntry(node.p.name, 'randomId')
		.addEntry(node.p.value1, `10000 * rand(@ptnum * 124.543)`);
	const up = _size3().addEntry(node.p.name, 'up').addEntry(node.p.value3, [0, 1, 0]);

	collection.setPresets({
		id,
		pti,
		bbx,
		bby,
		bbz,
		randomId,
		up,
	});

	return collection;
};
export const attribCreateSopPresetRegister: PresetRegister<typeof AttribCreateSopNode, AttribCreateSopNode> = {
	nodeClass: AttribCreateSopNode,
	setupFunc: attribCreateSopNodePresetsCollectionFactory,
};
