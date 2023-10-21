import {ATTRIBUTE_CLASSES, AttribClass} from './../../../src/core/geometry/Constant';
import {AttribPromoteSopNode} from '../../../src/engine/nodes/sop/AttribPromote';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const attribPromoteSopNodeNodePresetsCollectionFactory: PresetsCollectionFactory<AttribPromoteSopNode> = (
	node: AttribPromoteSopNode
) => {
	const collection = new NodePresetsCollection();

	const points = ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT);
	const primitives = ATTRIBUTE_CLASSES.indexOf(AttribClass.PRIMITIVE);
	const objects = ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT);

	collection.addPreset(
		'Object -> Point',
		new BasePreset().addEntry(node.p.classFrom, objects).addEntry(node.p.classTo, points)
	);
	collection.addPreset(
		'Object -> Primitive',
		new BasePreset().addEntry(node.p.classFrom, objects).addEntry(node.p.classTo, primitives)
	);
	collection.addPreset(
		'Point -> Object',
		new BasePreset().addEntry(node.p.classFrom, points).addEntry(node.p.classTo, objects)
	);
	collection.addPreset(
		'Point -> Primitive',
		new BasePreset().addEntry(node.p.classFrom, points).addEntry(node.p.classTo, primitives)
	);

	return collection;
};
export const attribPromoteSopPresetRegister: PresetRegister<typeof AttribPromoteSopNode, AttribPromoteSopNode> = {
	nodeClass: AttribPromoteSopNode,
	setupFunc: attribPromoteSopNodeNodePresetsCollectionFactory,
};
