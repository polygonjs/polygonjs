import {ATTRIBUTE_CLASSES, AttribClass, ATTRIBUTE_TYPES, AttribType} from '../../../src/core/geometry/Constant';
import {CSSObjectAttribute} from '../../../src/core/render/CSSRenderers/CSSObjectAttribute';
import {WFCQuadAttribute} from '../../../src/core/wfc/WFCAttributes';
import {tileConfigToString} from '../../../src/core/wfc/WFCTileConfig';
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
	function _makeAttribClassPrimitive(preset: BasePreset) {
		return preset.addEntry(node.p.class, ATTRIBUTE_CLASSES.indexOf(AttribClass.PRIMITIVE));
	}
	function _makeAttribClassObject(preset: BasePreset) {
		return preset.addEntry(node.p.class, ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT));
	}
	function _numeric() {
		return new BasePreset()
			.addEntry(node.p.type, ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC))
			.addEntry(node.p.string, '')
			.addEntry(node.p.value1, 0)
			.addEntry(node.p.value2, 0)
			.addEntry(node.p.value3, 0)
			.addEntry(node.p.value4, 0);
	}
	function _string() {
		return new BasePreset()
			.addEntry(node.p.type, ATTRIBUTE_TYPES.indexOf(AttribType.STRING))
			.addEntry(node.p.value1, 0)
			.addEntry(node.p.value2, 0)
			.addEntry(node.p.value3, 0)
			.addEntry(node.p.value4, 0);
	}
	function _size1() {
		return _makeSize1(_numeric());
	}
	function _size3() {
		return _makeSize3(_numeric());
	}
	function CSSObject(attribName: CSSObjectAttribute) {
		return _makeAttribClassObject(_string().addEntry(node.p.name, attribName));
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
	const SAMPLE_TILE_NAME = 'my-tile-name';
	const WFC = {
		[WFCQuadAttribute.QUAD_ID]: _makeAttribClassPrimitive(_size1())
			.addEntry(node.p.group, '')
			.addEntry(node.p.name, WFCQuadAttribute.QUAD_ID)
			.addEntry(node.p.value1, '@primnum'),
		[WFCQuadAttribute.FLOOR_INDEX]: _makeAttribClassObject(_size1())
			.addEntry(node.p.group, '')
			.addEntry(node.p.name, WFCQuadAttribute.FLOOR_INDEX)
			.addEntry(node.p.value1, '@objnum'),
		[WFCQuadAttribute.TILE_ID]: _makeAttribClassPrimitive(_string())
			.addEntry(node.p.group, '')
			.addEntry(node.p.name, WFCQuadAttribute.TILE_ID)
			.addEntry(node.p.string, SAMPLE_TILE_NAME),
		[WFCQuadAttribute.SOLVE_ALLOWED]: _makeAttribClassPrimitive(_size1())
			.addEntry(node.p.group, '0')
			.addEntry(node.p.name, WFCQuadAttribute.SOLVE_ALLOWED)
			.addEntry(node.p.value1, 0),
		[WFCQuadAttribute.SOLVED_TILE_CONFIGS]: _makeAttribClassPrimitive(_string())
			.addEntry(node.p.group, '')
			.addEntry(node.p.name, WFCQuadAttribute.SOLVED_TILE_CONFIGS)
			.addEntry(node.p.string, tileConfigToString({tileId: SAMPLE_TILE_NAME, rotation: 0})),
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
		[`WFC/${WFCQuadAttribute.QUAD_ID}`]: WFC[WFCQuadAttribute.QUAD_ID],
		[`WFC/${WFCQuadAttribute.FLOOR_INDEX}`]: WFC[WFCQuadAttribute.FLOOR_INDEX],
		[`WFC/${WFCQuadAttribute.TILE_ID}`]: WFC[WFCQuadAttribute.TILE_ID],
		[`WFC/${WFCQuadAttribute.SOLVE_ALLOWED}`]: WFC[WFCQuadAttribute.SOLVE_ALLOWED],
		[`WFC/${WFCQuadAttribute.SOLVED_TILE_CONFIGS}`]: WFC[WFCQuadAttribute.SOLVED_TILE_CONFIGS],
	});

	return collection;
};
export const attribCreateSopPresetRegister: PresetRegister<typeof AttribCreateSopNode, AttribCreateSopNode> = {
	nodeClass: AttribCreateSopNode,
	setupFunc: attribCreateSopNodePresetsCollectionFactory,
};
