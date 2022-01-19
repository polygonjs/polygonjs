import {RoundedBoxSopNode} from '../../../src/engine/nodes/sop/RoundedBox';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

// export function RoundedBoxSopNodePresets() {
// 	return {
// 		playerCapsule: function (node: RoundedBoxSopNode) {
// 			node.p.size.set([1, 2, 1]);
// 			node.p.divisions.set(10);
// 			node.p.bevel.set(0.5);
// 			node.p.center.set([0, -0.5, 0]);
// 		},
// 	};
// }

const roundedBoxSopNodePresetsCollectionFactory: PresetsCollectionFactory<RoundedBoxSopNode> = (
	node: RoundedBoxSopNode
) => {
	const collection = new NodePresetsCollection();

	const playerCapsule = new BasePreset()
		.addEntry(node.p.size, [1, 2, 1])
		.addEntry(node.p.divisions, 10)
		.addEntry(node.p.bevel, 0.5)
		.addEntry(node.p.center, [0, -0.5, 0]);

	collection.setPresets({
		playerCapsule,
	});

	return collection;
};
export const roundedBoxSopPresetRegister: PresetRegister<typeof RoundedBoxSopNode, RoundedBoxSopNode> = {
	nodeClass: RoundedBoxSopNode,
	setupFunc: roundedBoxSopNodePresetsCollectionFactory,
};
