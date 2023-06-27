import {ATTRIBUTE_CLASSES, AttribClass, ATTRIBUTE_TYPES, AttribType} from '../../../src/core/geometry/Constant';
import {CSSObjectAttribute} from '../../../src/core/render/CSSRenderers/CSSObjectAttribute';
import {AttribCreateSopNode} from '../../../src/engine/nodes/sop/AttribCreate';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const attribCreateSopNodePresetsCollectionFactory: PresetsCollectionFactory<AttribCreateSopNode> = (
	node: AttribCreateSopNode
) => {
	const collection = new NodePresetsCollection();

	function _makeSize1(preset: BasePreset) {
		return preset.addEntry(node.p.size, 1);
	}
	function _makeSize3(preset: BasePreset) {
		return preset.addEntry(node.p.size, 3);
	}
	function _makeAttribClassObject(preset: BasePreset) {
		return preset.addEntry(node.p.class, ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT));
	}
	function _makeString(preset: BasePreset) {
		return preset.addEntry(node.p.type, ATTRIBUTE_TYPES.indexOf(AttribType.STRING));
	}
	function _size1() {
		return _makeSize1(new BasePreset());
	}
	function _size3() {
		return _makeSize3(new BasePreset());
	}
	function CSSObject(attribName: CSSObjectAttribute) {
		return _makeAttribClassObject(_makeString(new BasePreset()).addEntry(node.p.name, attribName));
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

	const html = {
		id: CSSObject(CSSObjectAttribute.ID),
		class: CSSObject(CSSObjectAttribute.CLASS),
		html: CSSObject(CSSObjectAttribute.HTML),
	};

	collection.setPresets({
		id,
		pti,
		bbx,
		bby,
		bbz,
		randomId,
		up,
		'html/id': html.id,
		'html/class': html.class,
		'html/html': html.html,
	});

	return collection;
};
export const attribCreateSopPresetRegister: PresetRegister<typeof AttribCreateSopNode, AttribCreateSopNode> = {
	nodeClass: AttribCreateSopNode,
	setupFunc: attribCreateSopNodePresetsCollectionFactory,
};
