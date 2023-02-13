import {AttribClass, ATTRIBUTE_CLASSES} from '../../../src/core/geometry/Constant';
import {DeleteSopNode} from '../../../src/engine/nodes/sop/Delete';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const deleteSopNodePresetsCollectionFactory: PresetsCollectionFactory<DeleteSopNode> = (node: DeleteSopNode) => {
	const collection = new NodePresetsCollection();

	const allFaces = new BasePreset()
		.addEntry(node.p.class, ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT))
		.addEntry(node.p.byExpression, true)
		.addEntry(node.p.expression, true)
		.addEntry(node.p.keepPoints, true);
	collection.setPresets({
		allFaces,
	});

	return collection;
};
export const deleteSopPresetRegister: PresetRegister<typeof DeleteSopNode, DeleteSopNode> = {
	nodeClass: DeleteSopNode,
	setupFunc: deleteSopNodePresetsCollectionFactory,
};
