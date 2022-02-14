import {TransformSopNode} from '../../../src/engine/nodes/sop/Transform';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const transformSopNodePresetsCollectionFactory: PresetsCollectionFactory<TransformSopNode> = (
	node: TransformSopNode
) => {
	const collection = new NodePresetsCollection();

	const onGround = new BasePreset().addEntry(node.p.t.y, `-bbox(0, 'min').y`);
	const centerToOrigin = new BasePreset().addEntry(node.p.t, ['-$CEX', '-$CEY', '-$CEZ']);
	const pivotOnCenter = new BasePreset().addEntry(node.p.pivot, ['$CEX', '$CEY', '$CEZ']);
	const scaleTo1 = new BasePreset().addEntry(node.p.scale, '1/bbox(0,"size").x');

	collection.setPresets({onGround, centerToOrigin, scaleTo1, pivotOnCenter});

	return collection;
};
export const transformSopPresetRegister: PresetRegister<typeof TransformSopNode, TransformSopNode> = {
	nodeClass: TransformSopNode,
	setupFunc: transformSopNodePresetsCollectionFactory,
};
